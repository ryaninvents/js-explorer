import React from 'react';
import {render} from 'react-dom';
import styled from 'react-emotion';
import pkg from '../package.json';
import InspectorContext from './inspector/InspectorContext';
import createLocalInterface from './inspector/runtime-interface/local';
import createJsonInterface from './inspector/runtime-interface/json';
import createDiffInterface from './inspector/runtime-interface/diff';
import RootValue from './inspector/renderers/RootValue';
import TEST_DATA from './test-data.json';

TEST_DATA.diffB = TEST_DATA.fakePeople.map((p) => {
  if (p.id !== 3) return p;
  return {
    ...p,
    address: {
      ...p.address,
      street: 'Main Street',
      suite: '456-B',
    },
  };
});

const orig = {};

const foo1 = {
  x: {
    a: 1,
    b: true,
    c: 'sky',
    d: 'blue',
    orig,
    removedNested: {
      some: 'value',
    },
  },
};
const foo2 = {
  x: {
    1: 'fish',
    a: 1,
    red: 'fish',
    d: true,
    b: false,
    c: 'one fish two fish',
    orig: {},
    newNested: {
      foo: 'bar',
      baz: 'quux',
    },
  },
};

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
    <h2>package.json</h2>
    <InspectorContext runtime={createJsonInterface(createLocalInterface())} inspector={{}}>
      <RootValue title="package.json" value={{type: 'object', className: 'Object', identifier: pkg}} />
    </InspectorContext>
    <h2>Datatypes demo</h2>
    <InspectorContext runtime={createLocalInterface()} inspector={{}}>
      <RootValue title="Object" value={{type: 'object', className: 'Object', identifier: mix}} />
    </InspectorContext>
    <h2>Fake data</h2>
    <InspectorContext runtime={createLocalInterface()} inspector={{}}>
      <RootValue value={{type: 'object', className: 'Array', identifier: TEST_DATA.fakePeople}} />
    </InspectorContext>
    <h2>Small change in data</h2>
    <InspectorContext runtime={createDiffInterface(createJsonInterface(createLocalInterface()))} inspector={{}}>
      <RootValue title="Array" value={{type: 'object', className: 'Array', identifier: [TEST_DATA.fakePeople, TEST_DATA.diffB]}} />
    </InspectorContext>
    <h2>Compare only JSON</h2>
    <InspectorContext runtime={createDiffInterface(createJsonInterface(createLocalInterface()))} inspector={{}}>
      <RootValue title="Object" value={{type: 'object', className: 'Object', identifier: [foo1, foo2]}} />
    </InspectorContext>
    <h2>Referentially different</h2>
    <InspectorContext runtime={createDiffInterface(createLocalInterface({hideNonEnumerable: true}))} inspector={{}}>
      <RootValue title="Object" value={{type: 'object', className: 'Object', identifier: [foo1, foo2]}} />
    </InspectorContext>
    <h2>Because why the hell not: <code>document.body</code></h2>
    <InspectorContext runtime={createLocalInterface()} inspector={{}}>
      <RootValue title="document.body" value={{type: 'object', className: 'HTMLBodyElement', identifier: document.body}} />
    </InspectorContext>
  </Main>
);

render(<App />, document.getElementById('root'));
