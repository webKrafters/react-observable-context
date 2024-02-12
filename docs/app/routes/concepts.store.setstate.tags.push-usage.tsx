import { useState } from 'react';

import { MetaFunction } from '@remix-run/node';
import CodeBlock from '~/components/code-block';

export const meta: MetaFunction = () => [{
    title: 'eagleeyejs: @@PUSH'
}];

const getUsageSample = () =>
`import { PUSH_TAG } from '@webkrafters/react-observable-context'; // PUSH_TAG = "@@PUSH"

const state = {
    a: { b: [{ x: 7, y: 8, z: 9 }, { x: 17, y: 18, z: 19 }] },
    j: 10
};

store.setState({ a: { [ PUSH_TAG ]: [{ n: 5 }] } }); // assigning a '@@PUSH' command to a non-array property has no effect.

/* appends 2 new items into state.a.b; leaving state.a.b = [...state.a.b, { x: 27, y: 28, z: 29 }, { x: 37, y: 38, z: 39 }] */
store.setState({ a: { b: { [ PUSH_TAG ]: [{ x: 27, y: 28, z: 29 }, { x: 37, y: 38, z: 39 }] } } });`

export default function ConceptStoreSetStatePushTag() {
    const [ SAMPLE ] = useState( getUsageSample );
    return (
        <article className="concept-store-setstate-push-tag-usage">
            <h1><code>store.setState</code> @@PUSH Tag Usage</h1>
            <div>
                <h3>Example:</h3>
                <CodeBlock>{ SAMPLE }</CodeBlock>
            </div>
        </article>
    );
}