import { useState } from 'react';

import { MetaFunction } from '@remix-run/node';
import CodeBlock from '~/components/code-block';

export const meta: MetaFunction = () => [{
    title: 'eagleeyejs: @@CLEAR'
}];

const getUsageSamples = () =>
`import { CLEAR_TAG } from '@webkrafters/react-observable-context'; // CLEAR_TAG = "@@CLEAR"

const state = {
    a: { b: [{ x: 7, y: 8, z: 9 }, { x: 17, y: 18, z: 19 }] },
    j: 10
};

/* empties the state; sets state = {} */
store.setState( CLEAR_TAG ) // or store.setState({ [ CLEAR_TAG ]: <anything> })

/* empties the value at state.a.b; sets state.a.b = [] */
store.setState({ a: { b: CLEAR_TAG } }) // or store.setState({ a: { b: { [ CLEAR_TAG ]: <anything> } } })

/* empties the value at state.a.j; sets state.a.j = null */
store.setState({ a: { j: CLEAR_TAG } }) // or store.setState({ a: { j: { [ CLEAR_TAG ]: <anything> } } })

/* empties the value at state.a.b[ 0 ]; sets state.a.b = [{}] */
store.setState({ a: { b: [ CLEAR_TAG ] } }) // or store.setState({ a: { b: [ { [ CLEAR_TAG ]: <anything> } ] } })

/* empties the value at state.a.b[0]; sets state.a.b = [{}, state.a.b[1]] */
store.setState({ a: { b: [ CLEAR_TAG, state.a.b[1] ] } }) // or store.setState({ a: { b: [ { [ CLEAR_TAG ]: <anything> }, state.a.b[1] ] } })

/* empties the value at state.a.b[0]; sets state.a.b = [{}, a.b[1]] using indexing (RECOMMENDED) */
store.setState({ a: { b: { 0: CLEAR_TAG } } }) // or store.setState({ a: { b: { 0: { [ CLEAR_TAG ]: <anything> } } } })`;

export default function ConceptStoreSetStateClearTag() {
    const [ SAMPLE ] = useState( getUsageSamples );
    return (
        <article className="concept-store-setstate-clear-tag-usage">
            <h1><code>store.setState</code> @@CLEAR Tag Usage</h1>
            <div>
                <h3>Example:</h3>
                <CodeBlock>{ SAMPLE }</CodeBlock>
            </div>
        </article>
    );
}