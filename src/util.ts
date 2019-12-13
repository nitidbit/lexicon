import get from 'lodash/get';
import _ from 'lodash';

//
//      NestedMap and related functions
//

export interface NestedMap<K, V> extends Map<K, V | NestedMap<K, V>> {}

// export const getNestedKeyInMap = <T>(map: NestedMap<string, T>, key: string): T | NestedMap<string, T> | null => {
//   const [first, ...rest] = key.split('.');

//   if (!map.has(first)) return null; // malformed key

//   const val = map.get(first);
//   if (rest.length == 0) {
//     return val; // we found the item
//   }

//   if (val instanceof Map) {
//     return getNestedKeyInMap(val, rest.join('.'));
//   } else {
//     return null;
//   }
// };

export const flattenMap = <T>(map: NestedMap<string, T>): Array<string> => {
  const flatKeys: Array<string> = [];

  const recurse = (map: NestedMap<string, T>, prefix: string) => {
    for (const [k, v] of map.entries()) {
      if (v instanceof Map) {
        recurse(v, `${prefix}${k}.`);
      } else {
        flatKeys.push(`${prefix}${k}`);
      }
    }
  };

  recurse(map, '');
  return flatKeys;
};

export const cloneNestedMap = <K, V>(map: NestedMap<K, V>): NestedMap<K, V> => {
  const shallow = new Map(map);
  for (const [key, value] of shallow) {
    if (value instanceof Map) {
      shallow.set(key, cloneNestedMap(value));
    }
  }

  return shallow;
};

//
//      Collection and related functions
//

export type Collection = Map<string, any> | Array<any> | object;

export function isCollection(maybeCollection: any): boolean {
  return _.isMap(maybeCollection)
    || _.isArray(maybeCollection)
    || _.isObject(maybeCollection)
}


// Equivalent to lodash.keys(), but works with Maps
export function keys(c: Collection) {
  if (_.isMap(c)) return c.keys();
  return _.keys(c);
}

// Equivalent to lodash.entries(), but works with Maps
export function entries(c: Collection) {
  if (_.isMap(c)) return c.entries();
  return _.entries(c);
}

//
//      Other functions
//

export const evaluateTemplate = (template: string, substitutions: object): string => {
  let escaped = false;
  let replaced = '';

  for (let i = 0; i < template.length; i++) {
    if (template[i] == '\\' && !escaped) {
      escaped = true;
      continue;
    } else if (escaped) {
      replaced += template[i];
      escaped = false;
      continue;
    } else if (template[i] == '#' && template[i + 1] == '{') {
      i += 2;
      const startPos = i;
      let level = 1;
      while (level > 0) {
        if (i >= template.length) throw new Error(`Unterminated bracket in Lexicon template \`${template}\``);
        if (template[i] == '{') level++;
        else if (template[i] == '}') level--;
        i++;
      }

      const path = template.substring(startPos, i - 1),
        value = get(substitutions, path);

      replaced += value;
      i--;
      continue;
    } else {
      replaced += template[i];
    }
  }

  return replaced;
}
