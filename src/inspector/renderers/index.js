import React from 'react';
import get from 'lodash/get';
import {JsType} from '../constants';
import ObjectValue from './values/ObjectValue';
import DomNode from './values/DomNode';

const htmlElementRegex = /^HTML.*Element$/;

export default function renderValue({value, path}) {
  if (value === null) return '<unknown>';

  switch (value.subtype) {
    case 'null': return 'null';
    default: break;
  }

  if (get(value, 'className', '').match(htmlElementRegex)) {
    return <DomNode value={value} />;
  }
  switch (value.type) {
    case JsType.Object:
      return <ObjectValue value={value} />;
    default: return String(value.description || value.unserializableValue);
  }
}
