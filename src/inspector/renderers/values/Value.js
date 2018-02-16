import React from 'react';
import get from 'lodash/get';
import ObjectValue from './ObjectValue';
import DomNode from './DomNode';

const htmlElementRegex = /^HTML.*Element$/;

export default function Value({value}) {
  if (!value) return '';
  if (value.type !== 'object') return String(value.value);
  if (get(value, 'className', '').match(htmlElementRegex)) {
    return <DomNode object={value} />;
  }
  return <ObjectValue object={value} />;
}
