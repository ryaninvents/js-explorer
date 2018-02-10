import {JsType, JS_SUBTYPES} from './constants';

const isEnumerable = {}.propertyIsEnumerable;

/**
 * Restructure a JavaScript value into the Chrome Remote Dev Tools `RemoteObject` type.
 *
 * @see https://chromedevtools.github.io/devtools-protocol/v8/Runtime#type-RemoteObject
 */

export function getPropertiesOfObject(value, keys) {
  const properties = [];
  let addProto = true;
  if (keys) {
    addProto = false;
  } else {
    keys = Object.getOwnPropertyNames(value).filter(k => k !== '__proto__');
  }
  keys.forEach(key => {
    const prop = {
      name: key,
      id: key,
      value: formatJsValue(value[key]),
      enumerable: isEnumerable.call(value, key),
    };
    properties.push(prop);
  });
  if (addProto && value.__proto__ && value.__proto__ !== Function.prototype) {
    // Not entirely standard, but super-widely supported and useful for dev tools.
    const prop = {
      name: '__proto__',
      value: formatJsValue(value.__proto__),
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

/** Local "id"... why not just use the object itself? */
const createId = obj => ({...obj, objectId: obj.value});

export default function formatJsValue(value) {
  const type = typeof value;
  switch (type) {
    case JsType.Object: {
      if (value === null) {
        return {type, subtype: 'null', value};
      }
      // Not sure how this would be possible, but let's be safe
      if (!value.constructor) {
        return createId({type, value});
      }
      const className = value.constructor.name;
      let subtype;
      // TODO: find out how to really get the `subtype`
      if (JS_SUBTYPES.indexOf(className.toLowerCase()) !== -1) {
        subtype = className.toLowerCase();
      }
      const result = {
        type,
        className,
        value,
        getProperties: () => Promise.resolve(getPropertiesOfObject(value)),
      };
      const isProto = value.constructor.prototype === value;
      if (!isProto) {
        if (subtype) result.subtype = subtype;
        switch (subtype) {
          case 'regexp':
          case 'date':
          case 'error':
            result.render = () => value.toString();
            break;
          default:
            break;
        }
        switch (type) {
          case 'symbol':
            result.render = () => String(value);
            break;
          default:
            break;
        }
      }
      return createId(result);
    }
    default:
      return {type, value};
  }
}
