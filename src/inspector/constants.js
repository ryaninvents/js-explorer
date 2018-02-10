/** Specially handled JS value subtypes. */
export const JS_SUBTYPES = [
  'array',
  'null',
  'node',
  'regexp',
  'date',
  'map',
  'set',
  'weakmap',
  'weakset',
  'iterator',
  'generator',
  'error',
  'proxy',
  'promise',
  'typedarray',
];

/** Possible results of `typeof`. */
export const JsType = {
  Object: 'object',
  Function: 'function',
  Undefined: 'undefined',
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Symbol: 'symbol',
};
