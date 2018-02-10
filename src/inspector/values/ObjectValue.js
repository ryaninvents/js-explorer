import React from 'react';
import keyBy from 'lodash/keyBy';
import {JsType} from '../constants';
import ObjectMember from './ObjectMember';

export default class ObjectValue extends React.Component {
  state = {
    propertiesLoaded: false,
    propertyKeys: [],
    propertiesByKey: [],
    propertyHeights: {},
  };

  componentDidMount() {
    if (this.props.object.type !== JsType.Object) return;
    this.props.object.getProperties().then(properties => {
      const propertyKeys = properties.map(prop => prop.id);
      const propertiesByKey = keyBy(properties, 'id');
      this.setState({
        propertiesLoaded: true,
        propertyKeys,
        propertiesByKey,
      });
    });
  }

  getProperties = () =>
    this.state.propertyKeys.map(key => this.state.propertiesByKey[key]);

  render() {
    const {propertyKeys} = this.state;
    return (
      <span style={{overflowY: 'hidden'}}>
        {this.getProperties().map(property => (
          <ObjectMember
            key={property.id}
            property={property}
            isEnumerable={property.enumerable}
          />
        ))}
      </span>
    );
  }
}
