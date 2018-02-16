import React from 'react';
import makeAbortable, {AbortController} from "../../make-abortable";
import {withInspectorContext} from "../InspectorContext";

export default (BaseComponent) => withInspectorContext(
  class PropertyFetcher extends React.Component {
    state = {properties: []};

    activePromise = null;
    abortController = new AbortController();

    componentDidMount() {
      const {runtime, value} = this.props;
      this.fetchProperties(runtime, value);
    }

    componentWillReceiveProps({runtime, value}) {
      if (value !== this.props.value) {
        this.fetchProperties(runtime, value);
      }
    }

    fetchProperties = (runtime, value) => {
      if (this.activePromise) {
        this.abortController.abort();
        this.activePromise = null;
      }
      this.activePromise = makeAbortable(
        runtime.getPropertiesFromIdentifier(value.identifier),
        {signal: this.abortController.signal}
      );
      this.activePromise.then(this.receiveProperties);
    };

    receiveProperties = properties => {
      this.setState({properties});
      this.activePromise = null;
    };

    handleValueRequest = async (propertyName) => {
      const descriptor = this.state.properties.find(p => p.name === propertyName);
      if (!descriptor) return;
      try {
        const value = await this.props.runtime.getPropertyValue(
          this.props.value.identifier, descriptor);
        this.setState((state) => ({
          properties: state.properties.map((p) => {
            if (p.name !== propertyName) return p;
            return {
              ...p,
              value,
              wasThrown: false,
            };
          }),
        }));
      } catch (err) {
        console.error(err);
        this.setState((state) => ({
          properties: state.properties.map((p) => {
            if (p.name !== propertyName) return p;
            return {
              ...p,
              wasThrown: true,
            };
          }),
        }));
      }
    }

    render() {
      const {properties} = this.state;
      return <BaseComponent {...this.props} properties={properties} onFetchValue={this.handleValueRequest} />;
    }
  }
);
