import React from 'react';
import {css} from 'emotion';
import get from 'lodash/get';

const COLLAPSED_OBJECT = '{…}';
const COLLAPSED_ARRAY = '[…]';

const propStyle = css`
  display: inline-block;
  label: property-summary;
  &[data-non-enumerable='true'] {
    opacity: 0.5;
  }
  &[data-value-type='string'],
  &[data-value-type='symbol'] {
    color: #e45649;
  }
  &[data-value-type='string'] {
    &::before, &::after {
      content: '"';
      color: currentColor;
    }
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

export const getDisplayName = property => {
  const {value} = property;

  if (value === null) return '(...)';

  // TODO: does the below logic more properly live in the runtime interfaces,
  // specifically generation of `value.description`?
  if (value.type === 'null' || value.type === 'undefined') return value.type;
  const description = get(value, 'description');
  if (description) return description;

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
  const type = get(property, 'value.type');
  const subtype = get(property, 'value.subtype');
  return (
    <div
      className={propStyle}
      data-non-enumerable={!property.enumerable}
      data-value-type={type}
      data-value-subtype={subtype}
    >
      {getDisplayName(property)}
    </div>
  );
}
