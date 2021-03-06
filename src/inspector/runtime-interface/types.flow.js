
// Represents a JavaScript value: any type (primitive or object)
// despite the name.
export type RemoteObject = {
  type: string,
  subtype?: string,
  className?: string,
  value: any,
  identifier: any,
  unserializableValue?: string,
  objectId: string,
  description?: string,
};

// Represents a property attached to an object.
export type PropertyDescriptor = {
  name: string,
  value: RemoteObject | null,
  writable?: boolean,
  get?: RemoteObject,
  set?: RemoteObject,
  configurable: boolean,
  enumerable: boolean,
  wasThrown?: boolean,
  isOwn?: boolean,
  symbol?: RemoteObject,
};

export interface RuntimeInterface {
  getPropertyValue(parentValueIdentifier, propertyDescriptor): Promise<RemoteObject>
}
