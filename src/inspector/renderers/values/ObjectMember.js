import React from 'react';
import Key from './Key';
import Value from '../';
import PropertySummary from './PropertySummary';
import ValuePreview from './ValuePreview';
import {JsType} from '../../constants';

export default function ObjectMember({property}) {
  return (
    <ValuePreview
      renderKey={({isOpen, toggleIsOpen}) => <Key property={property} onClick={toggleIsOpen} />}
      renderSummary={({isOpen}) => (isOpen ? null : <PropertySummary property={property} />)}
      renderValue={({isOpen}) => (isOpen ? <Value value={property.value} /> : null)}
      dimCaret={!property.enumerable}
      isExpandable={property.value.type === JsType.Object}
    />
  );
}
