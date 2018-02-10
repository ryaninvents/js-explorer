import React from 'react';
import styled from 'react-emotion';

const K = styled('div')`
  display: inline-block;
  color: #a626a4;

  &[data-non-enumerable='true'] {
    opacity: 0.5;
  }
  &[data-value-type='object'] {
    cursor: pointer;
  }
  &[data-is-top-level='true'] {
    color: currentColor;
  }
`;

export default function Key({
  property: {name, enumerable, value: {type}, isTopLevel},
  onClick,
}) {
  return (
    <K
      data-non-enumerable={!enumerable}
      data-value-type={type}
      data-is-top-level={isTopLevel}
      onClick={type === 'object' ? onClick : undefined}
      title={type}
    >
      {name}
      {isTopLevel ? '' : ':'}
    </K>
  );
}
