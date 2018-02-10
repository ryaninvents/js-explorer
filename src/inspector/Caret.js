import React from 'react';
import styled from 'react-emotion';

import Icon from '@fortawesome/react-fontawesome';
import {faCaretRight} from '@fortawesome/fontawesome-free-solid';

const C = styled('div')({
  color: 'gray',
  cursor: 'pointer',
  display: 'inline-block',
  transform: 'rotate(0deg)',
  transition: 'transform 200ms, opacity 200ms',
  '&[data-is-open=true]': {
    transform: 'rotate(90deg)',
  },
  '&[data-hide=true]': {
    pointerEvents: 'none',
    '&, &[data-non-enumerable=true]': {
      opacity: 0,
    },
  },
  '&[data-non-enumerable=true]': {
    opacity: 0.3,
  },
});

export default function Caret({
  isOpen,
  property: {enumerable},
  isExpandable,
  ...rest
}) {
  return (
    <C
      data-is-open={isOpen}
      data-hide={!isExpandable}
      data-non-enumerable={!enumerable}
      {...rest}
    >
      <Icon icon={faCaretRight} />
    </C>
  );
}
