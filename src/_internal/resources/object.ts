export function omit<T extends object, K extends [...Array<keyof T>]>(
  obj: T,
  ...keys: K // eslint-disable-line comma-dangle
): { [Prop in Exclude<keyof T, K[number]>]: T[Prop] } {
  const res = {} as { [K in keyof typeof obj]: (typeof obj)[K] };
  let key: keyof typeof obj;

  for(key in obj) {
    if(keys.includes(key)) continue;
    res[key] = obj[key];
  }

  return res;
}
