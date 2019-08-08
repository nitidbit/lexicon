import get from 'lodash/get';

export interface NestedMap<K, V> extends Map<K, V | NestedMap<K, V>> {}

export const getNestedKeyInMap = <T>(map: NestedMap<string, T>, key: string): T | NestedMap<string, T> | null => {
  const [first, ...rest] = key.split('.');

  if (!map.has(first)) return null;
  // foo bar baz
  const val = map.get(first);
  if (rest.length > 0) {
    if (val instanceof Map) {
      return getNestedKeyInMap(val, rest.join('.'));
    } else {
      return null;
    }
  } else {
    return val;
  }
};

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

export const evaluateTemplate = (template: string, data: unknown): string => {
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
        value = get(data, path);

      replaced += value;
      i--;
      continue;
    } else {
      replaced += template[i];
    }
  }

  return replaced;
}
