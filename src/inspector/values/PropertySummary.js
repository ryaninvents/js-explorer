import React from 'react';
import styled from 'react-emotion';

const COLLAPSED_OBJECT = '{…}';
const COLLAPSED_ARRAY = '[…]';

const P = styled('div')`
  display: inline-block;
  &[data-non-enumerable='true'] {
    opacity: 0.5;
  }
  &[data-value-type='string'],
  &[data-value-type='symbol'] {
    color: #e45649;
  }
  &[data-value-type='number'],
  &[data-value-type='boolean'] {
    color: #4078f2;
  }
  &[data-value-type='undefined'] {
    opacity: 0.5;
  }
  &[data-value-subtype='regexp'] {
    color: #50a14f;
  }
`;

const getDisplayName = property => {
  const {value} = property;
  // TODO: `render` should not be attached to the data, instead a callback
  // passed down via context
  if (typeof value.render === 'function') return value.render();
  if (value.type === 'null' || value.type === 'undefined') return value.type;

  // Should not live here! This would break if we were looking at remote data
  if (value.type === 'function') {
    if (typeof value.value === 'function')
      return Function.prototype.toString.call(value.value);
    return value.value.toString();
  }
  if (value.type === 'symbol') {
    return String(value.value);
  }
  if (value.type !== 'object') {
    const str = JSON.stringify(value.value);
    return str;
  }
  const hasInterestingClassName =
    value.className &&
    value.className !== 'Object' &&
    value.className !== 'Array';
  if (hasInterestingClassName || property.name === '__proto__')
    return value.className;
  if (value.className === 'Array') return COLLAPSED_ARRAY;
  return COLLAPSED_OBJECT;
};

export default function PropertySummary({property}) {
  return (
    <P
      data-non-enumerable={!property.enumerable}
      data-value-type={property.value.type}
      data-value-subtype={property.value.subtype}
    >
      {getDisplayName(property)}
    </P>
  );
}
