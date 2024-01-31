import type { Dict } from 'typesdk/types';
import { Database } from 'typesdk/database/postgres';
import { assertString } from 'typesdk/utils/assertions';

import { Embedding } from '../_internals/_config';
import { Exception } from '../../errors/Exception';
import { MultidimensionalVector } from '../vectors/multidimensional';
import { LegacyWordEmbedding, type LegacyWordEmbeddingOptions } from '../LegacyWordEmbedding';



let database: Database | null = null;


export type PostgresEmbeddingTextWorkerLegacyOptions = {
  driver: 'legacy';
  options: LegacyWordEmbeddingOptions;
}

export type PostgresEmbeddingTextWorkerOptions = PostgresEmbeddingTextWorkerLegacyOptions;

export type PostgresEmbeddingExtensionOptions = {
  tablePrefix?: string;
  forceProduction?: boolean;
  connectionString: string;
  embeddingOptions: PostgresEmbeddingTextWorkerOptions;
}

export interface DatabaseSchema {
  [key: string]: Dict<string | number | boolean | any[] | NonNullable<Record<string | number | symbol, any>>>
}

export class PostgresEmbeddingExtension<Schema extends DatabaseSchema = DatabaseSchema> {
  #embedding: Embedding | null = null;
  #db: Database | null = null;

  constructor(
    private readonly _options: PostgresEmbeddingExtensionOptions // eslint-disable-line comma-dangle
  ) { }

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

  public update<K extends keyof Schema>(table: K, data: Schema[K], where: Dict<string>): Promise<void> {
    return this.#updateEmbeddingData<K>(table, data, where);
  }

  async #createEmbeddingVector(data: Dict<string | number | boolean | any[] | NonNullable<Record<string | number | symbol, any>>>): Promise<MultidimensionalVector> {
    const embedding = this.#getEmbedding();
    const value = Object.values(data).map(String).join(' ');

    return (await embedding.embed(value));
  }

  async #lookupEmbeddingData<K extends keyof Schema>(table: K, threshold: number, data: Dict<string | number | boolean | any[] | NonNullable<Record<string | number | symbol, any>>>): Promise<Schema[K][]> {
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

    if(threshold < 0 || threshold > 1) {
      throw new TypeError(`Threshold must be between 0 and 1, inclusive. Received ${threshold}`);
    }

    const database = await this.#connect();

    try {
      const results = await database.query(`SELECT * FROM ${this._options.tablePrefix ?? ''}${table} WHERE embedding <-> $1 < $2`, {
        values: [
          (await this.#createEmbeddingVector(data)).toArray(),
          threshold,
        ],
      });

      return results.rows;
    } finally {
      await database.close();
    }
  }

  public lookup<K extends keyof Schema>(table: K, threshold: number, data: Dict<string | number | boolean | any[] | NonNullable<Record<string | number | symbol, any>>>): Promise<Schema[K][]> {
    return this.#lookupEmbeddingData<K>(table, threshold, data);
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
