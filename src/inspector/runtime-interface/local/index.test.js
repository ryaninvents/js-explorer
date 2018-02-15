import keyBy from 'lodash/keyBy';
import pick from 'lodash/pick';
import chai from 'chai';
import jestDiffs from 'chai-jest-diff';
import createLocalInterface from './index';

chai.use(jestDiffs());
const {expect} = chai;

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
      const id1 = local.getObjectId(key);
      const id2 = local.getObjectId(key);
      expect(id1).to.equal(id2);
      expect(local.getNumberOfIdsIssued()).to.equal(1);
    });

    it('should generate a different ID for a different object', () => {
      const local = createInterface();
      let keyA = {};
      const idA = local.getObjectId(keyA);
      expect(idA).to.equal('object:0');
      let keyB = {};
      const idB = local.getObjectId(keyB);
      expect(idB).to.equal('object:1');
      expect(local.getNumberOfIdsIssued()).to.equal(2);
    });
  });
  describe('getPropertiesFromIdentifier', () => {
    describe('number', () => {
      it('should generate properties', async () => {
        const local = createInterface();
        const props = await local.getPropertiesFromIdentifier(2);
        expect(
          props.map(p => ({name: p.name, id: p.id, enumerable: p.enumerable}))
        ).to.deep.equal([
          {name: '__proto__', id: '@@SPECIAL: __proto__', enumerable: false},
        ]);
      });
    });
    describe('primitives', () => {
      it('should generate properties', async () => {
        const local = createInterface();
        const props = await local.getPropertiesFromIdentifier({
          string: 'string',
          number: 2,
          boolean: true,
          null: null,
        });
        const propsByKey = keyBy(props, 'name');
        expect(
          props.map(p => ({name: p.name, id: p.id, enumerable: p.enumerable}))
        ).to.deep.equal([
          {name: 'string', id: 'string', enumerable: true},
          {name: 'number', id: 'number', enumerable: true},
          {name: 'boolean', id: 'boolean', enumerable: true},
          {name: 'null', id: 'null', enumerable: true},
          {name: '__proto__', id: '@@SPECIAL: __proto__', enumerable: false},
        ]);
        expect(propsByKey.string.value.type).to.deep.equal('string');
        expect(propsByKey.number.value.type).to.deep.equal('number');
        expect(propsByKey.boolean.value.type).to.deep.equal('boolean');
        expect(propsByKey.null.value.type).to.deep.equal('object');
        expect(propsByKey.null.value.subtype).to.deep.equal('null');
      });
    });
  });
  describe('toRemoteValue', () => {
    it('should generate metadata correctly', () => {
      const x = {};
      const local = createInterface();
      const remoteX = local.toRemoteValue(x);
      expect(pick(remoteX, 'type', 'subtype', 'objectId', 'identifier')).to.deep.equal({
        type: 'object',
        objectId: 'object:0',
        identifier: x,
      });
    });
    it('should attach the value itself as `data`', () => {
      const x = {};
      const local = createInterface();
      expect(local.toRemoteValue(x).data).to.equal(x);
    });
    it('should give the same objectId for same object', () => {
      const x = {};
      const y = {};
      const local = createInterface();
      const remoteX = local.toRemoteValue(x.__proto__);
      const remoteY = local.toRemoteValue(y.__proto__);
      expect(remoteX.objectId).to.equal(remoteY.objectId);
      expect(remoteX.identifier).to.equal(remoteY.identifier)
        .and.to.equal(x.__proto__);
    });
  });
});
