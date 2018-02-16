import React from 'react';
import {css} from 'emotion';
import get from 'lodash/get';
import fetchProperties from '../fetchProperties';
import {propFinder} from '../../util/properties';
import DomNode from './DomNode';
import TextNode from './TextNode';

const emptyValue = css`
  opacity: 0.4;
  font-style: italic;
  padding-left: 2ch;
  display: block;
`;

const findLength = propFinder('length');

export class HtmlCollection extends React.Component {
  componentDidMount() {
    this.props.onFetchValue('length');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.properties === this.props.properties) return;
    const nextLength = findLength(nextProps.properties);

    // TODO: streamline... this is an absolute mess!
    (() => {
      if (nextLength === findLength(this.props.properties)) return;
      if (!nextLength || nextLength.value !== null || nextLength.wasThrown) return;
      setTimeout(() => this.props.onFetchValue('length'), 0);
    })();
  }

  getLength() {
    return get(
      findLength(this.props.properties),
      'value.description',
      null
    );
  }

  getNodes() {
    const lengthValue = this.getLength();
    if (lengthValue === null) {
      return [];
    }
    const length = Number(lengthValue);
    const {properties} = this.props;
    return Array.from({length}, (_, i) => propFinder(String(i))(properties))
      .map(p => get(p, 'value'));
  }

  render() {
    const {properties} = this.props;
    const lengthValue = this.getLength();
    if (lengthValue === null) {
      return <span className={emptyValue}>...</span>;
    }
    const length = Number(lengthValue);
    if (length === 0) {
      return <span className={emptyValue}>Empty node</span>;
    }
    return (
      <div>
        {this.getNodes().map((node, i) => {
          if (!node) return <span className={emptyValue}>...</span>;
          if (node.className === 'Text' || node.className === 'Comment') {
            return (
              <TextNode key={i} value={node} />
            );
          }
          return (
            <DomNode key={i} value={node} />
          );
        })}
      </div>
    );
  }
}

export default fetchProperties(HtmlCollection);
