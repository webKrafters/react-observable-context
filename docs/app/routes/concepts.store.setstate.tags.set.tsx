import { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => [{
    title: 'eagleeyejs: @@SET'
}];

export default function ConceptStoreSetStateSetTag() {
    return (
        <article className="concept-store-setstate-set-tag-usage">
            <h1><pre>{ `store.setState` }</pre> @@SET Tag Usage</h1>
            <div>
                <h3>Example:</h3>
                <pre>{
                    `/*
                    This tag is for handling edge cases only. Please use sparingly. In most cases, store.setState with or without any of the other tags is sufficient and most efficient.
                    
                    This and the '@@REPLACE' tags are functionally equivalent when used with a replacement value argument.
                    
                    Be aware that the compute function argument may be \`undefined\` for properties which do not yet exist in the state.
                    */
                   
                    import { SET_TAG } from '@webkrafters/react-observable-context'; // SET_TAG = "@@SET"
                   
                    const state = {
                        a: { b: [{ x: 7, y: 8, z: 9 }, { x: 17, y: 18, z: 19 }] },
                        j: 10
                    };
                   
                    store.setState({ [ SET_TAG ]: currentValue => ({ ...currentValue, a: 'Demo', j: 17 }) }) // rewrites state to { ...state, a: 'Demo', j: 17 };
                    
                    store.setState({ a: { [ SET_TAG ]: currentValue => ({ ...currentValue, message: 'Testing...' }) } }) // rewrites state.a to { ...state, message: 'Testing...' }
                    
                    /* rewrites state.a.b[1] to { x: 97, y: 98, z: 99 }; leaving state.a.b = [{ x: 7, y: 8, z: 9 }, { x: 97, y: 98, z: 99 }] */
                    store.setState({ a: { b: [ state.a.b[ 0 ], { [ SET_TAG ]: currentValue => ({ ...currentValue, x: 97, y: 98, z: 99 }) } ] } })
                    
                    /* rewrites state.a.b[1] to { x: 97, y: 98, z: 99 }; leaving state.a.b = [{ x: 7, y: 8, z: 9 }, { x: 97, y: 98, z: 99 }] using indexing (RECOMMENDED) */
                    store.setState({ a: { b: { 1: { [ SET_TAG ]: currentValue => ({ ...currentValue, x: 97, y: 98, z: 99 }) } } } })`
                }
                </pre>
            </div>
        </article>
    );
}