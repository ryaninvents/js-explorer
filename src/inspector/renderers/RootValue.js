import React from 'react';
import {css} from 'emotion';
import Value from './';
import {getDisplayName} from './values/PropertySummary';
import ValuePreview from './values/ValuePreview';

const rootTitle = css`
  cursor: pointer;
`;

export default function RootValue({value, title}) {
  return (
    <ValuePreview
      renderKey={({isOpen, toggleIsOpen}) => (
        <span className={rootTitle} onClick={toggleIsOpen}>
          {title}
        </span>
      )}
      renderSummary={({isOpen}) => (isOpen ? null : getDisplayName({value}))}
      renderValue={({isOpen}) => (isOpen ? <Value value={value} /> : null)}
      isExpandable
    />
  );
}
