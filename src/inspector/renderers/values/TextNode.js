import React from 'react';
import {css} from 'emotion';
import get from 'lodash/get';
import fetchProperties from '../fetchProperties';
import {propFinder} from '../../util/properties';
import HtmlCollection from './HtmlCollection';
import ValuePreview from './ValuePreview';

const indentedValue = css`
  font-style: italic;
  padding-left: 2ch;
  display: block;
`;

const emptyValue = css`
  opacity: 0.4;
  font-style: italic;
  padding-left: 2ch;
  display: block;
`;

const findTextContent = propFinder('textContent');

export class TextNode extends React.Component {
  componentDidMount() {
    this.props.onFetchValue('textContent');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.properties === this.props.properties) return;
    const nextChildren = findTextContent(nextProps.properties);

    // TODO: streamline... this is an absolute mess!
    (() => {
      if (nextChildren === findTextContent(this.props.properties)) return;
      if (!nextChildren || nextChildren.value !== null || nextChildren.wasThrown) return;
      setTimeout(() => this.props.onFetchValue('textContent'), 0);
    })();
  }

  getChildren() {
    return get(
      findTextContent(this.props.properties),
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
    const {properties, value} = this.props;
    const className = get(value, 'className');
    let textContent = get(
      findTextContent(properties),
      'value.description',
      '...'
    );
    if (className === 'Comment') {
      return (<div className={emptyValue}>{`<!-- ${textContent} -->`}</div>);
    }
    return <div className={indentedValue}>{textContent}</div>;
  }
}

TextNode.defaultProps = {
  properties: [],
};

export default fetchProperties(TextNode);
