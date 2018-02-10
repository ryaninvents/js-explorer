import React from 'react';
import {getPropertiesOfObject} from './formatJsValue';
import ObjectMember from './values/ObjectMember';

export default function JsInspector({value, name}) {
  const [prop] = getPropertiesOfObject({value}, ['value']);
  prop.isTopLevel = true;
  prop.name = name || prop.value.className || prop.value.type;
  return <ObjectMember property={prop} />;
}
