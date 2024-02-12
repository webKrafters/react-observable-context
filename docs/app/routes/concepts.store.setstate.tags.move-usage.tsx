import { useState } from 'react';

import { MetaFunction } from '@remix-run/node';
import CodeBlock from '~/components/code-block';

export const meta: MetaFunction = () => [{
    title: 'eagleeyejs: @@MOVE'
}];

const getUsageSample = () =>
`import { MOVE_TAG } from '@webkrafters/react-observable-context'; // MOVE_TAG = "@@MOVE"

const state = {
    a: { b: [{ x: 7, y: 8, z: 9 }, { x: 17, y: 18, z: 19 }] },
    j: 10,
    q: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
};

store.setState({ a: { [ MOVE_TAG ]: [ 0, 1 ] } }) // assigning a '@@MOVE' command to a non-array property has no effect.

/* moves state.a.b[0] into index 1; leaving state.a.b = [{ x: 17, y: 18, z: 19 }, { x: 7, y: 8, z: 9 }] */
store.setState({ a: { b: { [ MOVE_TAG ]: [ 0, 1 ] } } }) // or store.setState({ a: { b: { [ MOVE_TAG ]: [ -2, -1 ] } } })

/* moves state.q[4] - [7] into indexes 1 - 4; leaving state.q = [ 1, 5, 6, 7, 8, 2, 3, 4, 9 ] */
store.setState({ a: { q: { [ MOVE_TAG ]: [ 4, 1, 4 ] } } }) // or store.setState({ a: { q: { [ MOVE_TAG ]: [ -5, -8, 4 ] } } })`;

export default function ConceptStoreSetStateMoveTag() {
    const [ SAMPLE ] = useState( getUsageSample );
    return (
        <article className="concept-store-setstate-move-tag-usage">
            <h1><code>store.setState</code> @@MOVE Tag Usage</h1>
            <div>
                <h3>Example:</h3>
                <CodeBlock>{ SAMPLE }</CodeBlock>
            </div>
        </article>
    );
}