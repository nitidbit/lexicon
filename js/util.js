"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_1 = __importDefault(require("lodash/get"));
exports.getNestedKeyInMap = (map, key) => {
    const [first, ...rest] = key.split('.');
    if (!map.has(first))
        return null;
    // foo bar baz
    const val = map.get(first);
    if (rest.length > 0) {
        if (val instanceof Map) {
            return exports.getNestedKeyInMap(val, rest.join('.'));
        }
        else {
            return null;
        }
    }
    else {
        return val;
    }
};
exports.flattenMap = (map) => {
    const flatKeys = [];
    const recurse = (map, prefix) => {
        for (const [k, v] of map.entries()) {
            if (v instanceof Map) {
                recurse(v, `${prefix}${k}.`);
            }
            else {
                flatKeys.push(`${prefix}${k}`);
            }
        }
    };
    recurse(map, '');
    return flatKeys;
};
exports.cloneNestedMap = (map) => {
    const shallow = new Map(map);
    for (const [key, value] of shallow) {
        if (value instanceof Map) {
            shallow.set(key, exports.cloneNestedMap(value));
        }
    }
    return shallow;
};
exports.evaluateTemplate = (template, substitutions) => {
    let escaped = false;
    let replaced = '';
    for (let i = 0; i < template.length; i++) {
        if (template[i] == '\\' && !escaped) {
            escaped = true;
            continue;
        }
        else if (escaped) {
            replaced += template[i];
            escaped = false;
            continue;
        }
        else if (template[i] == '#' && template[i + 1] == '{') {
            i += 2;
            const startPos = i;
            let level = 1;
            while (level > 0) {
                if (i >= template.length)
                    throw new Error(`Unterminated bracket in Lexicon template \`${template}\``);
                if (template[i] == '{')
                    level++;
                else if (template[i] == '}')
                    level--;
                i++;
            }
            const path = template.substring(startPos, i - 1), value = get_1.default(substitutions, path);
            replaced += value;
            i--;
            continue;
        }
        else {
            replaced += template[i];
        }
    }
    return replaced;
};
