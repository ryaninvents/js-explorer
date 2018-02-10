import React from 'react';
import styled from 'react-emotion';
import withStateHandlers from 'recompose/withStateHandlers';
import Caret from '../Caret';
import Key from './Key';
import Value from './Value';
import PropertySummary from './PropertySummary';

const MemberRow = styled('div')`
  flex: 0 0;
  display: flex column;
  padding-left: 1.5ch;
`;

const MemberSummary = styled('div')`
  margin-left: -1.5ch;
`;

export default withStateHandlers(
  {isOpen: false},
  {
    toggleIsOpen: ({isOpen}) => () => ({isOpen: !isOpen}),
  }
)(function ObjectMember({property, style, isOpen, toggleIsOpen, innerRef}) {
  const {value} = property;
  const isExpandable = value.type === 'object';
  return (
    <MemberRow style={style} innerRef={innerRef}>
      <MemberSummary>
        <Caret
          property={property}
          isOpen={isOpen}
          isExpandable={isExpandable}
          onClick={toggleIsOpen}
        />{' '}
        <Key property={property} onClick={toggleIsOpen} />{' '}
        {isOpen ? null : <PropertySummary property={property} />}
      </MemberSummary>
      {isOpen ? <Value value={value} /> : null}
    </MemberRow>
  );
});
