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
      if (!value) {
        debugger;
      }
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

    render() {
      const {properties} = this.state;
      return <BaseComponent properties={properties} />;
    }
  }
);
