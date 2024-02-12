import { useState } from 'react';

import { MetaFunction } from '@remix-run/node';

import CodeBlock from '~/components/code-block';

export const meta: MetaFunction = () => [{
    title: 'eagleeyejs: @@REPLACE'
}];

const getUsageSample = () =>
`import { REPLACE_TAG } from '@webkrafters/react-observable-context'; // REPLACE_TAG = "@@REPLACE"

const state = {
    a: { b: [{ x: 7, y: 8, z: 9 }, { x: 17, y: 18, z: 19 }] },
    j: 10
};

store.setState({ [ REPLACE_TAG ]: { a: 'Demo', j: 17 } }) // rewrites state to { a: 'Demo', j: 17 };

store.setState({ a: { [ REPLACE_TAG ]: { message: 'Testing...' } } }) // rewrites state.a to { message: 'Testing...' }

/* rewrites state.a.b[1] to { x: 97, y: 98, z: 99 }; leaving state.a.b = [{ x: 7, y: 8, z: 9 }, { x: 97, y: 98, z: 99 }] */
store.setState({ a: { b: [ state.a.b[ 0 ], { [ REPLACE_TAG ]: { x: 97, y: 98, z: 99 } } ] } });

/* rewrites state.a.b[1] to { x: 97, y: 98, z: 99 }; leaving state.a.b = [{ x: 7, y: 8, z: 9 }, { x: 97, y: 98, z: 99 }] using indexing (RECOMMENDED) */
store.setState({ a: { b: { 1: { [ REPLACE_TAG ]: { x: 97, y: 98, z: 99 } } } } });`

export default function ConceptStoreSetStateReplaceTag() {
    const [ SAMPLE ] = useState( getUsageSample );
    return (
        <article className="concept-store-setstate-replace-tag-usage">
            <h1><code>store.setState</code> @@REPLACE Tag Usage</h1>
            <div>
                <h3>Example:</h3>
                <CodeBlock>{ SAMPLE }</CodeBlock>
            </div>
        </article>
    );
}