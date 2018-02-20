import React from "react";
import {css} from 'emotion';
import ObjectMember from "./ObjectMember";
import fetchProperties from '../fetchProperties';

const objValueStyles = css`
  font-family: monospace;
`;

const emptyValue = css`
  opacity: 0.4;
  font-style: italic;
  padding-left: 2ch;
  font-family: monospace;
`;

export function ObjectValue({properties}) {
  if (properties.length === 0) {
    return <span className={emptyValue}>Empty object</span>;
  }
  return (
    <span className={objValueStyles}>
      {properties.map(property => (
        <ObjectMember key={property.id} property={property} />
      ))}
    </span>
  );
}
ObjectValue.defaultProps = {
  properties: [],
};

export default fetchProperties(ObjectValue);
