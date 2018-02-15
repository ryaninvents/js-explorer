import uuid from 'uuid-base62';
import get from 'lodash/get';
import {JsType, JS_SUBTYPES} from '../../constants.js';

const isEnumerable = {}.propertyIsEnumerable;

const asGetter = (value) => ({
  ...value,
  type: 'special',
  description: '(...)',
  unserializableValue: '(...)',
});

const applyGetter = (propertyDescriptor, value) => Reflect.apply(propertyDescriptor.get, value, []);

class LocalRuntimeInterface {
  uuid = uuid;
  objectIdMap = new WeakMap();

  constructor({hideNonEnumerable = false} = {}) {
    this.opts = {hideNonEnumerable};
  }

  /** Get an ID for an object, which will uniquely identify the object. */
  getObjectId(object) {
    if (this.objectIdMap.has(object)) {
      return this.objectIdMap.get(object);
    }
    const id = this.uuid.v4();
    this.objectIdMap.set(object, id);
    return id;
  }

  /** Utility for quickly adding an ID to the object. */
  identified(remoteObject) {
    const {data} = remoteObject;
    let returnedObject = {...remoteObject, identifier: data};
    if (typeof data === JsType.Object && data !== null) {
      const objectId = this.getObjectId(data);
      returnedObject = {...returnedObject, objectId};
    }
    return returnedObject;
  }

  carefullyGetPropertyValue(value, key, propertyDescriptor) {
    if (Object.hasOwnProperty(value, key)) {
      return this.toRemoteValue(value[key]);
    }
    if (propertyDescriptor && typeof propertyDescriptor.get === 'function' && value !== value.constructor.prototype) {
      return this.toRemoteValue(applyGetter(propertyDescriptor, value));
    }
    return this.identified(asGetter(this.toRemoteValue(undefined)));
  }

  async getPropertiesFromIdentifier(value) {
    const properties = [];
    const filterEnum = this.opts.hideNonEnumerable ? (
      (k => isEnumerable.call(value, k))
    ) : (x => true);

    Object.getOwnPropertyNames(value)
      .filter(k => k !== '__proto__')
      .filter(filterEnum)
      .forEach(key => {
        const propDesc = Reflect.getOwnPropertyDescriptor(value, key);
        const prop = {
          name: key,
          id: key,
          value: Reflect.has(propDesc, 'value') ? this.toRemoteValue(propDesc.value) : this.identified(asGetter(this.toRemoteValue(undefined))),
          enumerable: propDesc.enumerable,
          configurable: propDesc.configurable,
          data: {
            propertyDescriptor: propDesc,
          },
        };
        properties.push(prop);
      });

    if (value.__proto__ && value.__proto__ !== Function.prototype && !this.opts.hideNonEnumerable) {
      const protoValue = this.toRemoteValue(value.__proto__);

      // TODO: maybe extend runtime interface API to lazy-load a prop with a getter?
      if (value.__proto__.__proto__) {
        const protoProps = await this.getPropertiesFromIdentifier(value.__proto__);

        protoProps
          .filter((prop) => prop.name !== '__proto__' && !properties.some(p => p.name === prop.name))
          .forEach((newProp) => {
            const propDesc = get(newProp, 'data.propertyDescriptor');
            properties.push({
              ...newProp,
              isOwn: false,
              value: this.carefullyGetPropertyValue(value, newProp.name, propDesc),
              enumerable: false,
              data: {
                propertyDescriptor: propDesc,
              },
            });
          });
      }

      // Not entirely standard, but super-widely supported and useful for dev tools.
      const prop = {
        name: '__proto__',
        value: protoValue,
        // It cost me an embarrassing amount of time before I realized
        // the mayhem that ensues when you set `someObj[name] = someValue`
        // if `name === '__proto__'`... such a pain!
        id: '@@SPECIAL: __proto__',
        enumerable: false,
      };
      properties.push(prop);
    }
    return properties;
  }

  toRemoteValue(data) {
    const type = typeof data;
    switch (type) {
      case JsType.Object: {
        if (data === null) {
          return this.identified({type, subtype: 'null', data});
        }
        // Not sure how this would be possible, but let's be safe
        if (!data.constructor) {
          return this.identified({type, data});
        }
        const className = data.constructor.name;
        let subtype;
        // TODO: find out how to really get the `subtype`
        if (JS_SUBTYPES.indexOf(className.toLowerCase()) !== -1) {
          subtype = className.toLowerCase();
        }
        const result = {
          type,
          className,
          data,
        };
        // If we're looking at a prototype, the expression below will be true.
        const isProto = data.constructor.prototype === data;

        if (!isProto) {
          if (subtype) result.subtype = subtype;
          switch (subtype) {
            case 'regexp':
            case 'date':
            case 'error':
              result.unserializableValue = data.toString();
              break;
            default:
              break;
          }
          switch (type) {
            case 'symbol':
              result.unserializableValue = String(data);
              break;
            default:
              break;
          }
        }
        return this.identified(result);
      }
      default:
        return this.identified({type, data, description: String(data)});
    }
  }
}

export default function createInterface(opts) {
  return new LocalRuntimeInterface(opts);
}
