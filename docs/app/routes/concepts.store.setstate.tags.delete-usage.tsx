import { useState } from 'react';
import { MetaFunction } from '@remix-run/node';
import CodeBlock from '~/components/code-block';

export const meta: MetaFunction = () => [{
    title: 'eagleeyejs: @@DELETE'
}];

const getUsageSample = () =>
`import { DELETE_TAG } from '@webkrafters/react-observable-context'; // DELETE_TAG = "@@DELETE"

const state = {
    a: { b: [{ x: 7, y: 8, z: 9 }, { x: 17, y: 18, z: 19 }] },
    j: 10
};

store.setState({ [ DELETE_TAG ]: [ 'a' ] }) // removes state.a; sets state = {j: 10}

store.setState({ a: { [ DELETE_TAG ]: [ 'b' ] } }) // removes state.a.b; sets state.a = {}

/* removes state.a.b[0]; leaving state.a.b = [{ x: 17, y: 18, z: 19 }] */
store.setState({ a: { b: { [ DELETE_TAG ]: [ 0 ] } } }) // or store.setState({ a: { b: { [ DELETE_TAG ]: [ -2 ] } } })

/* removes \`x\` and \`z\` properties from state.a.b[1]; sets state.a.b = [{ x: 7, y: 8, z: 9 }, {y: 18}] */
store.setState({ a: { b: [ state.a.b[ 0 ], { [ DELETE_TAG ]: [ 'x', 'z' ] } ] } })

/* removes \`x\` and \`z\` properties from state.a.b[1]; sets state.a.b = [{ x: 7, y: 8, z: 9 }, {y: 18}] using indexing (RECOMMENDED) */
store.setState({ a: { b: { 1: { [ DELETE_TAG ]: [ 'x', 'z' ] } } } })`;

export default function ConceptStoreSetStateDeleteTag() {
    const [ SAMPLE ] = useState( getUsageSample );
    return (
        <article className="concept-store-setstate-delete-tag-usage">
            <h1><code>store.setState</code> @@DELETE Tag Usage</h1>
            <div>
                <h3>Example:</h3>
                <CodeBlock>{ SAMPLE }</CodeBlock>
            </div>
        </article>
    );
}