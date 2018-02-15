import React from 'react';
import {css} from 'emotion';
import fetchProperties from '../fetchProperties';

const emptyValue = css`
  opacity: 0.4;
  font-style: italic;
  padding-left: 2ch;
`;

export function DomNode({properties}) {
  if (properties.length === 0) {
    return <span className={emptyValue}>Empty node</span>;
  }
  return <span>{'<HTMLElement>'}</span>;
}

DomNode.defaultProps = {
  properties: [],
};

export default fetchProperties(DomNode);
