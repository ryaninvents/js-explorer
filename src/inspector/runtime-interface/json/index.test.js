import chai from 'chai';
import jestDiffs from 'chai-jest-diff';
import createJsonInterface from '../json';
import createLocalInterface from '../local';

chai.use(jestDiffs());
const {expect} = chai;

describe('runtime-interface/json', () => {
  describe('getPropertiesFromIdentifier', () => {
    it('should use the same value ID for structurally equal values', async () => {
      const json = createJsonInterface(createLocalInterface());
      const left = {
        a: {
          foo: true,
          bar: 'blue',
          baz: 2,
        },
      };
      const right = {
        a: {
          foo: true,
          bar: 'blue',
          baz: 2,
        },
      };
      const propertiesLeft = await json.getPropertiesFromIdentifier(left);
      const propertiesRight = await json.getPropertiesFromIdentifier(right);

      const leftA = propertiesLeft.find(({name}) => name === 'a');
      const rightA = propertiesRight.find(({name}) => name === 'a');

      expect(leftA.value.identifier).to.equal(rightA.value.identifier);
    });

    it('should use a different value ID for different values', async () => {
      const json = createJsonInterface(createLocalInterface());
      const left = {
        a: {
          foo: true,
          bar: 'blue',
          baz: 2,
        },
      };
      const right = {
        a: null,
      };
      const propertiesLeft = await json.getPropertiesFromIdentifier(left);
      const propertiesRight = await json.getPropertiesFromIdentifier(right);

      const leftA = propertiesLeft.find(({name}) => name === 'a');
      const rightA = propertiesRight.find(({name}) => name === 'a');

      expect(leftA.value.identifier).not.to.equal(rightA.value.identifier);
    });
  });
});
