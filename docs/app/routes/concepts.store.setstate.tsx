import { Link } from '@remix-run/react';

import WarningIcon from '../components/icons/warning';

export default function ConceptStoreSetState() {
    return (
        <article className="concept-store-setstate">
            <h1><pre>{ `store.setState` }</pre> Usage</h1>
            <div>
                <h3>About the store setState method</h3>
                <div>
                    <blockquote>
                        [This store's] internal state is <strong><u>immutable</u></strong> and <strong><u>private</u></strong>.<br />
                        Direct mutation attempts on its properties have no effect.
                    </blockquote>
                    New updates are merged into state by default. 
                    So only supply the exact changes to be merged <strong><i>{ '(' }i.e. do not spread the new state changes into the current state as is commonly done in React development{ ')' }</i></strong>. 
                    And to overwrite a slice of state, use the <Link to="/concepts/store/setstate/tags">tag</Link> command.<br />
                    <WarningIcon /> <strong><i>Do this:</i></strong> <pre>{ `setState({stateKey0: changes0});` }</pre><br />
                    <WarningIcon /> <strong><i>Not this:</i></strong> <pre>{ `setState({...state, stateKey0: {...state.stateKey0, ...changes0}});` }</pre><br />
                </div>
                <h3 id="batched-update">Batched Update</h3>
                <div>
                    provides a way to update the state as a transaction of several state changes. This can be achieved by collecting a series of state changes in an array and passing that array as an argument to the <pre>{ `store.setState` }</pre> method. 
                    The state changes are resolved sequentially from <pre>{ `index 0` }</pre> to the <pre>{ `last index` }</pre>. <Link to="/concepts/client">Clients</Link> are only notified at batched update completion.<br />
                    <WarningIcon /> <strong><i>Do this:</i></strong> 
                    <pre>
                    {
                        `setState([
                            {stateKey0: changes0},
                            {stateKey1: changes1},
                            // et cetera ... et cetera
                        ]);`
                    }
                    </pre>
                    <br />
                    <WarningIcon /> <strong><i>Not this:</i></strong> 
                    <pre>
                    {
                        `setState([
                            {...state, stateKey0: {...state.stateKey0, ...changes0}},
                            {...state, stateKey1: {...state.stateKey1, ...changes1}},
                            // et cetera ... et cetera
                        ]);`
                    }
                    </pre>
                </div>
                <h3 id="indexing">Indexing</h3>
                <div>
                    Traditionally, array state properties are updated by a new array replacement. This overwrites the existing state property.<br />
                    Hence the need for <pre>{ `indexing` }</pre>. Indexing provides a mechanism for updating array state properties at specific indexes using an indexed state change object.<br />
                    The store also recognizes and resolves negative indexes when present in the indexed state change object. See additional <Link to="/concepts/store/setstate#neg-idx-tip">tip</Link> below.<br />
                    <strong>Example:</strong>
                    <pre>
                    {
                    `// Given the following array bearing state object:
                    const state = { a: { b: [ { x: 7, y: 8, z: 9 } ] }, j: 10 };

                    // The following will override the existing array.
                    store.setState({ a: { b: [ { y: 30 }, 22 ] } });
                    // updates the state to: { a: { b: [ { y: 30 }, 22 ] }, j: 10 };

                    // The followinng will update the existing array at indexes.
                    store.setState({ a: { b: { 0: { y: 30 }, 1: 22 } } });
                    // updates the state to: { a: { b: [ { x: 7, y: 30, z: 9 }, 22 ] }, j: 10 };

                    // The followinng will update the existing array at indexes.
                    store.setState({ a: { b: { '-1': { y: 30 }, 1: 22 } } });
                    // updates the state to: { a: { b: [ { x: 7, y: 30, z: 9 }, 22 ] }, j: 10 };

                    // The previous 2 statements are functionally equivalent to the following:
                    const [ first, second, ...rest ] = state.a.b;
                    store.setState({ ...state, a: { ...state.a, b: [ { ...first, y: 30 }, 22, ...rest ] } });
                    // Refrain from doing this, please!`
                    }
                    </pre>
                </div>
                <div id="neg-idx-tip"><WarningIcon /><strong><i>Tip:</i></strong> Negative indexing pointing at an out-of-bounds index is ignored.</div>
                <h3 id="setstate-tags">Overwriting state using the tag commands</h3>
                <div>Please see full info on tag commands <Link to="/concepts/store/setstate/tags">here</Link>.</div>
            </div>
        </article>
    );
}