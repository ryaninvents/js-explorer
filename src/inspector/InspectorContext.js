import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import withContext from 'recompose/withContext';
import getContext from 'recompose/getContext';

// `InspectorContext` tracks a few things:
// - `runtime`: means of interacting with JS values
// - `inspector.collapseState`: keep track of which elements are folded
// - `inspector.theme`: details on how to render different values

export const InspectorPropTypes = {
  runtime: PropTypes.shape({
    getPropertiesFromIdentifier: PropTypes.func.isRequired,
  }).isRequired,
  inspector: PropTypes.object.isRequired,
};

export const withInspectorContext = getContext(InspectorPropTypes);

export default compose(
  withContext(
    InspectorPropTypes,
    ({runtime, inspector}) => ({runtime, inspector})
  )
)(({children}) => children);
