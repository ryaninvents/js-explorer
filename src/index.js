import React from 'react';
import {render} from 'react-dom';
import {css} from 'emotion';
import styled from 'react-emotion';
import {Tab, Container, Grid, Button} from 'semantic-ui-react';
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

const mono = css`
  font-family: monospace;
  width: 100%;
  min-height: 20em;
`;

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


class ExploreDemo extends React.Component {
  state = {
    value: pkg,
  }
  runtime = createJsonInterface(createLocalInterface());
  render() {
    const {value} = this.state;
    let textArea;
    return (
      <Grid>
        <Grid.Row columns={3}>
          <Grid.Column>
            <textarea
              className={mono}
              ref={(ref) => {
                textArea = ref;
              }}
              defaultValue={JSON.stringify(value, null, 2)}
            />
          </Grid.Column>
            <Grid.Column>
              <InspectorContext runtime={this.runtime} inspector={{}}>
                <RootValue title="root" value={{type: 'object', className: 'Object', identifier: value}} />
              </InspectorContext>
            </Grid.Column>
        </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Button
                fluid
                onClick={() => {
                this.setState({
                  value: JSON.parse(textArea.value),
                });
              }}
              >Update</Button>
            </Grid.Column>
          </Grid.Row>
      </Grid>
    );
  }
}

class DiffDemo extends React.Component {
  state = {
    valueA: foo1,
    valueB: foo2,
  }
  runtime = createDiffInterface(createJsonInterface(createLocalInterface()));
  render() {
    const {valueA, valueB} = this.state;
    let textAreaA;
    let textAreaB;
    return (
      <Grid>
        <Grid.Row columns={3}>
          <Grid.Column>
            <textarea
              className={mono}
              ref={(ref) => {
                textAreaA = ref;
              }}
              defaultValue={JSON.stringify(valueA, null, 2)}
            />
          </Grid.Column>
            <Grid.Column>
              <InspectorContext runtime={this.runtime} inspector={{}}>
                <RootValue title="root" value={{type: 'object', className: 'Object', identifier: [valueA, valueB]}} />
              </InspectorContext>
            </Grid.Column>
              <Grid.Column>
                <textarea
                  className={mono}
                  ref={(ref) => {
                textAreaB = ref;
              }}
                  defaultValue={JSON.stringify(valueB, null, 2)}
                />
              </Grid.Column>
        </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Button
                fluid
                onClick={() => {
                this.setState({
                  valueA: JSON.parse(textAreaA.value),
                  valueB: JSON.parse(textAreaB.value),
                });
              }}
              >Update</Button>
            </Grid.Column>
          </Grid.Row>
      </Grid>
    );
  }
}

const KitchenSink = () => (
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

const App = () => (
  <Container>
    <Tab
      menu={{pointing: true}}
      panes={[
        {menuItem: 'Kitchen sink', render: KitchenSink},
        {menuItem: 'JSON inspector', render: () => <ExploreDemo />},
        {menuItem: 'JSON diff', render: () => <DiffDemo />},
      ]}
    />
  </Container>
);

render(<App />, document.getElementById('root'));
