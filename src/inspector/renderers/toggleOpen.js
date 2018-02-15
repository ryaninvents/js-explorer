
import withStateHandlers from 'recompose/withStateHandlers';

export default withStateHandlers(
  {isOpen: false},
  {
    toggleIsOpen: ({isOpen}) => () => ({isOpen: !isOpen}),
  }
);
