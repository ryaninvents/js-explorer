import keyBy from 'lodash/keyBy';
import createLocalInterface from './index';

// Semi-mocked version of the local interface which hands out IDs deterministically.
const createInterface = () => {
  let counter = 0;
  const iface = createLocalInterface();
  iface.getNumberOfIdsIssued = () => counter;
  iface.uuid = {
    v4() {
      let id = `object:${counter}`;
      counter++;
      return id;
    },
  };
  return iface;
};

describe('runtime-interface/local', () => {
  describe('getObjectId()', () => {
    it('should retrieve the same ID for the same object', () => {
      const local = createInterface();
      let key = {};
      const id1 = String(local.getObjectId(key));
      const id2 = String(local.getObjectId(key));
      expect(id1).toBe(id2);
      expect(local.getNumberOfIdsIssued()).toBe(1);
    });

    it('should generate a different ID for a different object', () => {
      const local = createInterface();
      let keyA = {};
      const idA = String(local.getObjectId(keyA));
      expect(idA).toBe('object:0');
      let keyB = {};
      const idB = String(local.getObjectId(keyB));
      expect(idB).toBe('object:1');
      expect(local.getNumberOfIdsIssued()).toBe(2);
    });
  });
  describe('getPropertiesFromValue', () => {
    describe('number', () => {
      it('should generate properties', async () => {
        const local = createInterface();
        const props = await local.getPropertiesFromValue(2);
        expect(
          props.map(p => ({name: p.name, id: p.id, enumerable: p.enumerable}))
        ).toEqual([
          {name: '__proto__', id: '@@SPECIAL: __proto__', enumerable: false},
        ]);
      });
    });
    describe('primitives', () => {
      it('should generate properties', async () => {
        const local = createInterface();
        const props = await local.getPropertiesFromValue({
          string: 'string',
          number: 2,
          boolean: true,
          null: null,
        });
        const propsByKey = keyBy(props, 'name');
        expect(
          props.map(p => ({name: p.name, id: p.id, enumerable: p.enumerable}))
        ).toEqual([
          {name: 'string', id: 'string', enumerable: true},
          {name: 'number', id: 'number', enumerable: true},
          {name: 'boolean', id: 'boolean', enumerable: true},
          {name: 'null', id: 'null', enumerable: true},
          {name: '__proto__', id: '@@SPECIAL: __proto__', enumerable: false},
        ]);
        expect(propsByKey.string.value.type).toEqual('string');
        expect(propsByKey.number.value.type).toEqual('number');
        expect(propsByKey.boolean.value.type).toEqual('boolean');
        expect(propsByKey.null.value.type).toEqual('object');
        expect(propsByKey.null.value.subtype).toEqual('null');
      });
    });
  });
});
