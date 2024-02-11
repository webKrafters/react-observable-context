import { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => [{
    title: 'eagleeyejs: @@SPLICE'
}];

export default function ConceptStoreSetStateSpliceTag() {
    return (
        <article className="concept-store-setstate-+++[[XXXXXX]]+++-tag-usage">
            <h1><pre>{ `store.setState` }</pre> @@SPLICE Tag Usage</h1>
            <div>
                <h3>Example:</h3>
                <pre>{
                    `import { SPLICE_TAG } from '@webkrafters/react-observable-context'; // SPLICE_TAG = "@@SPLICE"

                    const state = {
                        a: { b: [{ x: 7, y: 8, z: 9 }, { x: 17, y: 18, z: 19 }] },
                        j: 10,
                        q: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
                    };
                    
                    store.setState({ a: { [ SPLICE_TAG ]: [ 0, 1 ] } }) // assigning a '@@SPLICE' command to a non-array property has no effect.
                    
                    /* removes state.a.b[0]; leaving state.a.b = [{ x: 17, y: 18, z: 19 }] */
                    store.setState({ a: { b: { [ SPLICE_TAG ]: [ 0, 1 ] } } }) // or store.setState({ a: { b: { [ SPLICE_TAG ]: [ -2, -1 ] } } })
                    
                    /* replaces state.q[4] - [7] with 2 items; leaving state.q = [ 1, 2, 3, 4, 33, 88, 9 ] */
                    store.setState({ a: { q: { [ SPLICE_TAG ]: [ 4, 4, 33, 88 ] } } }) // or store.setState({ a: { q: { [ SPLICE_TAG ]: [ -5, 4, 33, 88 ] } } })`
                }
                </pre>
            </div>
        </article>
    );
}
