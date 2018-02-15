import keyBy from 'lodash/keyBy';
import {DiffMarker, JsType} from '../../constants';
import diffValues from './diffValues';

const key = (prop, prefix = 'key') => `${prefix}:${prop.name}`;
key.plain = (prop) => key(prop);
key.added = (prop) => key(prop, 'added');
key.removed = (prop) => key(prop, 'removed');

const VALUE_NOT_PRESENT = Symbol('VALUE_NOT_PRESENT');

const added = (prop) => ({
  ...prop,
  name: prop.name,
  id: key.added(prop),
  data: {diff: DiffMarker.Added},
  value: {
    ...prop.value,
    identifier: [VALUE_NOT_PRESENT, prop.value.identifier],
  },
});
const same = (prop) => ({
  ...prop,
  name: prop.name,
  id: key(prop),
  data: {diff: DiffMarker.Same},
  value: {
    ...prop.value,
    identifier: [prop.value.identifier, prop.value.identifier],
  },
});
const changed = (left, right) => ({
  ...right,
  name: right.name,
  id: key(right),
  data: {diff: DiffMarker.Changed},
  value: diffValues(left.value, right.value),
});
const removed = (prop) => ({
  ...prop,
  name: prop.name,
  id: key.removed(prop),
  data: {diff: DiffMarker.Removed},
  value: {
    ...prop.value,
    identifier: [prop.value.identifier, VALUE_NOT_PRESENT],
  },
});

const shouldDiffRecursively = (left, right) => {
  // TODO: probably want to also test `subtype` and `className`, otherwise
  // display will look a bit wonky. Good enough for PoC though

  if (left.value.type !== JsType.Object || right.value.type !== JsType.Object) return false;
  const neitherNull = (left.value.subtype !== 'null') && (right.value.subtype !== 'null');
  const isObject = (left.value.type === JsType.Object);
  return neitherNull && isObject;
};

/**
 * Runtime interface allowing you to diff two elements.
 *
 * Wraps another interface, so you can compare local or remote objects.
 *
 * @example
 *     // Diff two objects, detecting changes if objects are referentially different
 *     import mkLocalInterface from '../local';
 *     import mkDiffInterface from '../diff';
 *
 *     const interface = mkDiffInterface(mkLocalInterface())
 *
 * @example
 *     // Diff two objects, detecting only structural changes
 *     import mkLocalInterface from '../local';
 *     import mkDiffInterface from '../diff';
 *     import mkJsonInterface from '../json';
 *
 *     const interface = mkDiffInterface(mkJsonInterface(mkLocalInterface()))
 */
class DiffRuntimeInterface {
  constructor(src) {
    this.src = src;
    if (typeof src.isEqual === 'function') {
      this.isEqual = src.isEqual.bind(src);
    }
  }

  isEqual(a, b) {
    return a.identifier === b.identifier;
  }

  async getPropertiesFromIdentifier([left, right]) {
    const [leftPropsList, rightPropsList] = await Promise.all([
      left === VALUE_NOT_PRESENT ? Promise.resolve([]) : this.src.getPropertiesFromIdentifier(left),
      right === VALUE_NOT_PRESENT ? Promise.resolve([]) : this.src.getPropertiesFromIdentifier(right),
    ]);
    const leftProps = keyBy(leftPropsList, key);
    const rightProps = keyBy(rightPropsList, key);
    const allProps = [...new Set([...leftPropsList.map(key.plain), ...rightPropsList.map(key.plain)])];
    const resultantPropsByKey = {};

    // TODO: perhaps consider renamed/moved properties?
    allProps.forEach((propKey) => {
      Object.assign(resultantPropsByKey,
        this.changedProps(leftProps[propKey], rightProps[propKey]));
    });

    return Object.keys(resultantPropsByKey).map((key) => resultantPropsByKey[key]);
  }

  changedProps(left, right) {
    if (left) {
      if (right) {
        if (this.isEqual(left.value, right.value)) {
          // Referentially the same value
          return {
            [key(right)]: same(right),
          };
        }

        if (left.value.type === right.value.type) {
          if (shouldDiffRecursively(left, right)) {
            // Display as recursive property diff
            return {
              [key(right)]: changed(left, right),
            };
          }
          // At least one value is a primitive or null value; display as removing of
          // old value and addition of new value.
          // TODO: string diff for string values, and maybe number diff?
          return {
            [key.removed(left)]: removed(left),
            [key.added(right)]: added(right),
          };
        }
        // Switching from one type to another; display as removal of old value and
        // addition of new value
        //
        return {
          [key.removed(left)]: removed(left),
          [key.added(right)]: added(right),
        };
      }
      // `right` value not available; display as removal of old value
      return {
        [key.removed(left)]: removed(left),
      };
    }
    // `left` value not available
    if (right) {
      // Display as addition of new value
      return {
        [key.added(right)]: added(right),
      };
    }
    // Shouldn't reach this code; would mean we somehow obtained a key
    // which is present in neither object, but best to handle these things sensibly
    return {};
  }
}

export default function createInterface(src) {
  return new DiffRuntimeInterface(src);
}
