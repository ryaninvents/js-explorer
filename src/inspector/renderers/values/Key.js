import React from 'react';
import {css} from 'emotion';
import get from 'lodash/get';
import {DiffMarker} from '../../constants';

const keyStyle = css`
  display: inline-block;
  color: #a626a4;
  label: property-key;

  &[data-non-enumerable='true'] {
    opacity: 0.5;
  }
  &[data-value-type='object'] {
    cursor: pointer;
  }
  &[data-is-top-level='true'] {
    color: currentColor;
  }

  &[data-diff-marker='${DiffMarker.Added}'] {
    color: #2db448;
    font-weight: bold;
    &::before {
      ${'' /* content: '+'; */}
    }
  }
  &[data-diff-marker='${DiffMarker.Changed}'] {
    color: #d5880b;
    font-style: italic;
    font-weight: bold;
    &::before {
      ${'' /* content: '~'; */}
    }
  }
  &[data-diff-marker='${DiffMarker.Removed}'] {
    color: #f42a2a;
    font-style: italic;
    position: relative;
    &::before {
      ${'' /* content: '-'; */}
    }
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      opacity: 0.2;
      border-top: 1px solid #f42a2a;
    }
  }
  &[data-diff-marker='${DiffMarker.Same}'] {
    &::before {
      ${'' /* content: '\00a0'; */}
    }
  }
`;

export default function Key({
  property: {name, enumerable, value, isTopLevel, data},
  onClick,
}) {
  const type = get(value, 'type');
  return (
    <div
      className={keyStyle}
      data-non-enumerable={!enumerable}
      data-value-type={type}
      data-is-top-level={isTopLevel}
      data-diff-marker={get(data, 'diff')}
      onClick={type === 'object' ? onClick : undefined}
      title={type}
    >
      {name}
      {isTopLevel ? '' : ':'}
    </div>
  );
}
