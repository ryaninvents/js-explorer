import React from 'react';
import {css} from 'emotion';
import toggleOpen from '../toggleOpen';
import Caret from '../../Caret';

const previewRow = css`
  label: value-preview-row;
  flex: 0 0;
  display: flex column;
  padding-left: 1.5ch;
`;

const previewSummary = css`
  label: value-preview-summary;
  margin-left: -1.5ch;
`;

// TODO: handle open/close via inspector context rather than local state

const ValuePreview = toggleOpen(function ValuePreview({
  renderKey,
  renderSummary,
  renderValue,
  isOpen,
  toggleIsOpen,
  dimCaret,
  isExpandable,
}) {
  return (
    <div className={previewRow}>
      <div className={previewSummary}>
        <Caret
          isDim={dimCaret}
          isOpen={isOpen}
          isExpandable={isExpandable}
          onClick={toggleIsOpen}
        />{' '}
        {renderKey({isOpen, toggleIsOpen})} {renderSummary({isOpen})}
      </div>
      {renderValue({isOpen})}
    </div>
  );
});

ValuePreview.defaultProps = {
  isExpandable: true,
};

export default ValuePreview;
