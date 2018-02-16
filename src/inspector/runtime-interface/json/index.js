import {digest as jsonHash} from 'json-hash';

const getHashable = (value) => {
  if (value.value !== undefined) return value.value;
  if (value.identifier !== undefined) return value.identifier;
  if (value.description !== undefined) return value.description;
  return undefined;
};

/**
 * Permits interfacing with objects which may be structurally equal but not
 * referentially equal; for instance, comparing two JSON trees for structure differences.
 *
 * @example
 *     import mkLocalInterface from '../local';
 *     import mkJsonInterface from '../json';
 *
 *     const interface = mkJsonInterface(mkLocalInterface())
 */
class JsonRuntimeInterface {
  constructor(src, {ignorePrototype = true} = {}) {
    this.src = src;
    this.opts = {ignorePrototype};
  }

  isEqual(a, b) {
    const hashA = jsonHash(getHashable(a));
    const hashB = jsonHash(getHashable(b));
    return hashA === hashB;
  }

  async getPropertyValue(...args) {
    return this.src.getPropertyValue(...args);
  }

  async getPropertiesFromIdentifier(identifier) {
    const props = await this.src.getPropertiesFromIdentifier(identifier);
    if (this.opts.ignorePrototype) {
      return props.filter(p => p.enumerable !== false);
    }
    return props;
  }
}

export default function createInterface(src) {
  return new JsonRuntimeInterface(src);
}
