import React from 'react';
import {render} from 'react-dom';
import styled from 'react-emotion';
import pkg from '../package.json';
import JsInspector from './inspector/JsInspector';
import TEST_DATA from './test-data.json';

const Main = styled('div')`
  font-family: monospace;
`;

const mix = {
  boolean: true,
  number: 2,
  string: 'foo',
  function: function doTheThing(x, y) {
    return x + y;
  },
  object: document.location,
  regex: /m | [tn]| b/mi,
  date: new Date(),
  symbol: Symbol('hello'),
  error: new Error('Bad things!'),
};

const App = () => (
  <Main>
    <h2>Demo</h2>
    <JsInspector value={mix} />
    <h2>package.json</h2>
    <JsInspector value={pkg} />
    <h2>Test data</h2>
    <JsInspector value={TEST_DATA.fakePeople} />
  </Main>
);

render(<App />, document.getElementById('root'));
