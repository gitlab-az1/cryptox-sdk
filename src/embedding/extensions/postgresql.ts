import math from 'typesdk/math';
import type { Dict } from 'typesdk/types';
import { Database } from 'typesdk/database/postgres';
import { assertString } from 'typesdk/utils/assertions';

import { Embedding } from '../_internals/_config';
import { Exception } from '../../errors/Exception';
import { MultidimensionalVector } from '../vectors/multidimensional';
import { calculateCosineSimilarityFromNumericArrays } from '../../_internal/resources/math';
import { LegacyWordEmbedding, type LegacyWordEmbeddingOptions } from '../LegacyWordEmbedding';



let database: Database | null = null;


/**
 * Represents the options for creating a legacy PostgresEmbeddingTextWorker.
 */
export type PostgresEmbeddingTextWorkerLegacyOptions = {
  driver: 'legacy';
  options?: LegacyWordEmbeddingOptions;
}

/**
 * Represents the options for creating a PostgresEmbeddingTextWorker.
 */
export type PostgresEmbeddingTextWorkerOptions = PostgresEmbeddingTextWorkerLegacyOptions;


/**
 * Represents the options for configuring a PostgresEmbeddingExtension.
 */
export type PostgresEmbeddingExtensionOptions = {
  tablePrefix?: string;
  forceProduction?: boolean;
  connectionString: string;
  formatTablePrefix?: boolean;
  embeddingOptions: PostgresEmbeddingTextWorkerOptions;
}

/**
 * Represents the schema of a database, where each table name is mapped to its column names and types.
 */
export interface DatabaseSchema extends Record<string, Dict<string | number | boolean | any[] | NonNullable<Record<string | number | symbol, any>>>> {} 

/**
 * Represents the results of a database lookup operation, including the matched data and cosine similarity.
 */
export type LookupResults<Schema extends DatabaseSchema, Row extends keyof Schema> = {
  [Column in keyof Schema[Row]]: Schema[Row][Column];
} & {
  readonly $cosine_similarity: number;
  readonly embedding: readonly number[];
}

/**
 * Represents a PostgreSQL database extension for handling embeddings.
 */
export class PostgresEmbeddingExtension<Schema extends DatabaseSchema = DatabaseSchema> {
  #embedding: Embedding | null = null;
  #db: Database | null = null;

  private _options: PostgresEmbeddingExtensionOptions;

  /**
   * Constructs a new PostgresEmbeddingExtension instance with the specified options.
   * @param options - The options to configure the extension.
   */
  constructor(options: PostgresEmbeddingExtensionOptions) {
    this._options = options;

    try {
      new URL(this._options.connectionString);
    } catch (err: any) {
      throw new Exception(`Malformed connection string: ${this._options.connectionString}`,
        err.message ?? err);
    }

    if(!process.env.POSTGRES_DB) {
      process.env.POSTGRES_DB = new URL(this._options.connectionString).pathname.slice(1);
    }

    if(!!this._options.tablePrefix &&
      this._options.formatTablePrefix !== false) {
      const prefix = this._options.tablePrefix.trim();

      this._options = Object.assign({}, this._options, {
        tablePrefix: prefix.endsWith('_') ? prefix : `${prefix}_`,
      });
    }
  }

  async #insertEmbeddingData<K extends keyof Schema>(table: K, data: Schema[K]): Promise<Schema[K]> {
    assertString(table);

    if(!/^[a-zA-Z_]+$/.test(table)) {
      throw new Exception(`Malformed table name: ${table}`,
        'The table name you provided contains characters that can be used for SQL injection. Please use only alphanumeric characters and underscores.');
    }

    if(!!this._options.tablePrefix && 
      !/^[a-zA-Z_]+$/.test(this._options.tablePrefix)) {
      throw new Exception(`Malformed table prefix: ${this._options.tablePrefix}`,
        'The table prefix you provided contains characters that can be used for SQL injection. Please use only alphanumeric characters and underscores.');
    }

    let query = `INSERT INTO ${this._options.tablePrefix ?? ''}${table} (`;
    const columns = [];

    delete data.embedding;

    for(const prop of ['embedding', ...Object.keys(data)]) {
      if(!/^[a-zA-Z_]+$/.test(prop)) {
        throw new Exception(`Malformed property name: ${prop}`,
          'The property name you provided contains characters that can be used for SQL injection. Please use only alphanumeric characters and underscores.');
      }

      columns.push(prop);
    }

    query += columns.join(', ');
    query += ') VALUES (';

    ['embedding', ...Object.keys(data)].forEach((_, index) => {
      query += `$${index + 1}, `;
    });

    query = query.trim();

    if(query.endsWith(',')) {
      query = query.slice(0, -1);
    }

    query += ') RETURNING *';

    const database = await this.#connect();

    try {
      const results = await database.query(query, {
        values: [
          (await this.#createEmbeddingVector(data)).toArray(),
          ...Object.values(data),
        ],
      });

      return results.rows[0];
    } finally {
      await database.close();
    }
  }

  /**
   * Inserts data into the specified table of the database.
   * 
   * @param table - The name of the table to insert data into.
   * @param data - The data to insert into the table.
   * @returns A Promise resolving to the inserted data.
   */
  public insert<K extends keyof Schema>(table: K, data: Schema[K]): Promise<Schema[K]> {
    return this.#insertEmbeddingData<K>(table, data);
  }


  async #updateEmbeddingData<K extends keyof Schema>(table: K, data: Schema[K], where: Dict<string>): Promise<void> {
    assertString(table);

    if(!/^[a-zA-Z_]+$/.test(table)) {
      throw new Exception(`Malformed table name: ${table}`,
        'The table name you provided contains characters that can be used for SQL injection. Please use only alphanumeric characters and underscores.');
    }

    if(!!this._options.tablePrefix && 
      !/^[a-zA-Z_]+$/.test(this._options.tablePrefix)) {
      throw new Exception(`Malformed table prefix: ${this._options.tablePrefix}`,
        'The table prefix you provided contains characters that can be used for SQL injection. Please use only alphanumeric characters and underscores.');
    }

    delete data.embedding;
    let query = `UPDATE ${this._options.tablePrefix ?? ''}${table} SET
      embedding = $1`;

    const keys = ['embedding', ...Object.keys(data)];

    for(let i = 1; i < keys.length; i++) {
      const prop = keys[i];

      if(!/^[a-zA-Z_]+$/.test(prop)) {
        throw new Exception(`Malformed property name: ${prop}`,
          'The property name you provided contains characters that can be used for SQL injection. Please use only alphanumeric characters and underscores.');
      }

      query += `, ${prop} = $${i + 1}`;
    }

    query += ' WHERE';

    const whereKey = Object.keys(where)[0];
    const whereValue = Object.values(where)[0];

    if(!/^[a-zA-Z_]+$/.test(whereKey)) {
      throw new Exception(`Malformed property name: ${whereKey}`,
        'The property name you provided contains characters that can be used for SQL injection. Please use only alphanumeric characters and underscores.');
    }

    query += ` ${whereKey} = $${keys.length + 1}`;
    const database = await this.#connect();

    try {
      await database.query(query, {
        values: [
          (await this.#createEmbeddingVector(data)).toArray(),
          ...Object.values(data),
          whereValue,
        ],
      });
    } finally {
      await database.close();
    }
  }

  /**
   * Updates data in the specified table of the database based on the provided conditions.
   * 
   * @param table - The name of the table to update data in.
   * @param data - The data to update in the table.
   * @param where - The conditions to apply for updating data.
   * @returns A Promise resolving when the update operation is complete.
   */
  public update<K extends keyof Schema>(table: K, data: Schema[K], where: Dict<string>): Promise<void> {
    return this.#updateEmbeddingData<K>(table, data, where);
  }

  async #createEmbeddingVector(data: Dict<string | number | boolean | any[] | NonNullable<Record<string | number | symbol, any>>>): Promise<MultidimensionalVector> {
    const embedding = this.#getEmbedding();
    const value = Object.values(data).filter(Boolean).map(String).join(' ');

    return (await embedding.embed(value));
  }

  async #lookupEmbeddingData<K extends keyof Schema>(table: K, data: Dict<string | number | boolean | any[] | NonNullable<Record<string | number | symbol, any>>>, threshold?: number): Promise<LookupResults<Schema, K>[]> {
    assertString(table);

    if(!/^[a-zA-Z_]+$/.test(table)) {
      throw new Exception(`Malformed table name: ${table}`,
        'The table name you provided contains characters that can be used for SQL injection. Please use only alphanumeric characters and underscores.');
    }

    if(!!this._options.tablePrefix && 
      !/^[a-zA-Z_]+$/.test(this._options.tablePrefix)) {
      throw new Exception(`Malformed table prefix: ${this._options.tablePrefix}`,
        'The table prefix you provided contains characters that can be used for SQL injection. Please use only alphanumeric characters and underscores.');
    }

    const c = new math.Comparator();

    if(!!threshold && !c.isBetween(threshold, 0, 1, true)) {
      console.warn(`Threshold value '${threshold}' is out of range [0, 1]. It can take down the search accuracy or even not found any results`);
    }

    const searchVector = await this.#createEmbeddingVector(data);
    const database = await this.#connect();

    try {
      const results = await database.query(`SELECT * FROM ${this._options.tablePrefix ?? ''}${table}`);
      const rows = results.rows.map(item => ({
        ...item,
        $cosine_similarity: calculateCosineSimilarityFromNumericArrays(searchVector.toArray(),
          item.embedding),
      }));

      if(!threshold) return rows;
      return rows.filter(item => item.$cosine_similarity >= threshold);
    } finally {
      await database.close();
    }
  }


  /**
   * Looks up data in the specified table of the database based on the provided criteria.
   * 
   * @param table - The name of the table to search.
   * @param thresholdOrData - The similarity threshold or the data to search for.
   * @param data - The data to search for (if the threshold is provided).
   * @returns A Promise resolving to an array of lookup results.
   */
  public lookup<K extends keyof Schema>(table: K, data: Schema[K]): Promise<LookupResults<Schema, K>[]>;

  /**
   * Looks up data in the specified table of the database based on the provided criteria.
   * 
   * @param table - The name of the table to search.
   * @param thresholdOrData - The similarity threshold or the data to search for.
   * @param data - The data to search for (if the threshold is provided).
   * @returns A Promise resolving to an array of lookup results.
   */
  public lookup<K extends keyof Schema>(table: K, threshold: number, data: Schema[K]): Promise<LookupResults<Schema, K>[]>;

  /**
   * Looks up data in the specified table of the database based on the provided criteria.
   * 
   * @param table - The name of the table to search.
   * @param thresholdOrData - The similarity threshold or the data to search for.
   * @param data - The data to search for (if the threshold is provided).
   * @returns A Promise resolving to an array of lookup results.
   */
  public lookup<K extends keyof Schema>(table: K, thresholdOrData: number | Schema[K], data?: Schema[K]): Promise<LookupResults<Schema, K>[]> {

    return this.#lookupEmbeddingData<K>(table,
      typeof thresholdOrData === 'object' ? thresholdOrData : data!,
      typeof thresholdOrData === 'number' ? thresholdOrData : undefined);
  }

  #getEmbedding(): Embedding {
    // eslint-disable-next-line no-extra-boolean-cast
    if(!!this.#embedding) return this.#embedding;

    const { driver = 'legacy', options } = this._options.embeddingOptions;

    switch(driver) {
      case 'legacy':
        this.#embedding = new LegacyWordEmbedding(options);
        break;
      default:
        throw new Error(`Unknown embedding driver: ${driver}`);
    }

    return this.#embedding;
  }

  async #connect(): Promise<Database> {
    let output: Database;

    if(this._options.forceProduction) {
      process.env.NODE_ENV = 'production';
    }

    if(process.env.NODE_ENV === 'production' ||
      this._options.forceProduction === true) {
      if(!this.#db ||
        !(await this.#db.isOnline())) {
        this.#db = new Database(this._options.connectionString);
      }

      output = this.#db;
    } else {
      if(!database ||
        !(await database.isOnline())) {
        database = new Database(this._options.connectionString);
      }

      output = database;
    }

    return output;
  }
}

export default PostgresEmbeddingExtension;
