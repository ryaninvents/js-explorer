import React from 'react';
import {css} from 'emotion';
import get from 'lodash/get';
import fetchProperties from '../fetchProperties';
import {propFinder} from '../../util/properties';
import HtmlCollection from './HtmlCollection';
import ValuePreview from './ValuePreview';

const tagDisplay = css`
  color: #a626a4;
  cursor: pointer;
`;

const emptyValue = css`
  opacity: 0.4;
  font-style: italic;
  padding-left: 2ch;
  display: block;
`;

const findChildren = propFinder('childNodes');
const findTagName = propFinder('tagName');

export class DomNode extends React.Component {
  componentDidMount() {
    this.props.onFetchValue('childNodes');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.properties === this.props.properties) return;
    const nextChildren = findChildren(nextProps.properties);
    const nextTagName = findTagName(nextProps.properties);

    // TODO: streamline... this is an absolute mess!
    (() => {
      if (nextChildren === findChildren(this.props.properties)) return;
      if (!nextChildren || nextChildren.value !== null || nextChildren.wasThrown) return;
      setTimeout(() => this.props.onFetchValue('childNodes'), 0);
    })();
    (() => {
      if (nextTagName === findTagName(this.props.properties)) return;
      if (!nextTagName || nextTagName.value !== null || nextTagName.wasThrown) return;
      setTimeout(() => this.props.onFetchValue('tagName'), 0);
    })();
  }

  getChildren() {
    return get(
      findChildren(this.props.properties),
      'value',
      null
    );
  }

  renderChildren() {
    const children = this.getChildren();
    if (children === null) {
      return <span className={emptyValue}>...</span>;
    }

    return <HtmlCollection value={children} />;
  }

  render() {
    const {properties} = this.props;
    const tagName = get(
      findTagName(properties),
      'value.description',
      '...'
    );
    return (
      <ValuePreview
        renderKey={({toggleIsOpen}) => (
          <span className={tagDisplay} onClick={toggleIsOpen}>{`<${tagName.toLowerCase()}>`}</span>
        )}
        renderSummary={() => null}
        renderValue={({isOpen, toggleIsOpen}) => (
          isOpen ? (
            <div>
              {this.renderChildren()}
                <span className={tagDisplay} onClick={toggleIsOpen}>
                  {`</${tagName.toLowerCase()}>`}
                </span>
            </div>
          ) : null
        )}
        isExpandable
      />
    );
  }
}

DomNode.defaultProps = {
  properties: [],
};

export default fetchProperties(DomNode);
