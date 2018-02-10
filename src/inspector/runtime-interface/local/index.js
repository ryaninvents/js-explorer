import uuid from 'uuid-base62';
import {JsType, JS_SUBTYPES} from '../../constants.js';

const isEnumerable = {}.propertyIsEnumerable;

class LocalRuntimeInterface {
  uuid = uuid;
  objectIdMap = new WeakMap();

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
    if (typeof data !== JsType.Object || data === null) return remoteObject;
    const objectId = this.getObjectId(data);
    return {...remoteObject, objectId};
  }

  /** Given a `RemoteObject`, return its properties. */
  // Clunky and inelegant, but I can't create a map of object IDs => values without
  // horribly breaking garbage collection. Going the other way, Chrome DevTools Protocol
  // requires the ability to reference an object using _only_ its string ID. So I'm
  // stuck having to write two implementations.
  async getPropertiesFromRemoteObject(remoteObject) {
    // For local runtime-interface, `data` prop on `RemoteObject` is literally the object itself.
    return this.getPropertiesFromValue(remoteObject.data);
  }

  async getPropertiesFromValue(value) {
    const properties = [];
    Object.getOwnPropertyNames(value)
      .filter(k => k !== '__proto__')
      .forEach(key => {
        const prop = {
          name: key,
          id: key,
          value: this.toRemoteValue(value[key]),
          enumerable: isEnumerable.call(value, key),
        };
        properties.push(prop);
      });

    if (value.__proto__ && value.__proto__ !== Function.prototype) {
      // Not entirely standard, but super-widely supported and useful for dev tools.
      const prop = {
        name: '__proto__',
        value: this.toRemoteValue(value.__proto__),
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
          return {type, subtype: 'null', data};
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
        return {type, data};
    }
  }
}

export default function createInterface() {
  return new LocalRuntimeInterface();
}
