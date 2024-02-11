import { Link } from '@remix-run/react';

export default function ConceptStoreSetStateTagsCombination() {
    return (
        <article className="concept-store-setstate-tags-combination-usage">
            <h1>Combination Tags Usage:</h1>
            <div>
                <div>Tags may be used in combination with the default usage where all top-level tag command results in property are sequentially merged into state followed by the merging of the rest of the property changes.</div>
                <h3>Example:</h3>
                <pre>{
                    `import * as ctx from '@webkrafters/react-observable-context';

                    const state = {
                        a: { b: [{ x: 7, y: 8, z: 9 }, { x: 17, y: 18, z: 19 }] },
                        j: 10,
                        q: [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
                    };
                    
                    store.setState({
                        a: {
                            b: {
                                /* evaluated 1st */ [ ctx.DELETE_TAG ]: [ 0 ], // upon deleting state.a.b[0] -> state.a.b[1] becomes the new state.a.b[0]
                                /* evaluated 3rd */ 0: ctx.CLEAR_TAG, // clear the new state.a.b[0]
                                /* evaluated 4th */ 2: { x: 47, y: 48, z: 49 }, // add new item at state.a.b[2],
                                /* evaluated 2md */ [ ctx.PUSH_TAG ]: [{ x: 107, y: 108, z: 109 }] // appends state.a.b[1]
                            }
                        },
                        j: { [ ctx.SET_TAG ]: currentValue => currentValue < 10 ? currentValue : 0 },
                        q: {
                            /* evaluated 1st */ [ ctx.MOVE_TAG ]: [ 5, 3, 2 ],
                            /* evaluated 2md */ 12: 11
                        }
                    })
                    // => {
                    //      a: { b: [{}, { x: 107, y: 108, z: 109 }, { x: 47, y: 48, z: 49 }] },
                    //      j: 0,
                    //      q: [ 1, 2, 3, 6, 7, 4, 5, 8, 9, <empty>, <empty>, <empty>, 11 ]
                    // }`
                }
                </pre>
            </div>
        </article>
    );
}