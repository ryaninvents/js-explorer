import React from 'react';
import {css} from 'emotion';
import get from 'lodash/get';
import Value from './';
import {htmlElementRegex} from './values/Value';
import {getDisplayName} from './values/PropertySummary';
import ValuePreview from './values/ValuePreview';

const rootTitle = css`
  cursor: pointer;
`;

export default function RootValue({value, title}) {
  // TODO: put this in an appropriate place; this is cheating
  if (get(value, 'className', '').match(htmlElementRegex)) {
    return <Value value={value} />;
  }

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
