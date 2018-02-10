import React from 'react';
import ObjectValue from './ObjectValue';

export default function Value({value}) {
  if (!value || value.type !== 'object') return String(value.value);
  return <ObjectValue object={value} />;
}
