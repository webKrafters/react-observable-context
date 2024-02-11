import { Link } from '@remix-run/react';

export default function ConceptStoreResetState() {
    return (
        <article className="concept-store-resetstate">
            <h1><pre>{ `store.resetState` }</pre> Usage</h1>
            <div>
                <h3>What does the store resetState method do?</h3>
                <ul>
                    <li>Resets slices of state to their initial state values as desired.</li>
                    <li>Accepts an array of property paths referencing the desired slices of state to reset.</li>
                    <li>Performs a total state reset when <pre>{ `@@STATE` }</pre> is present in the property paths array.</li>
                    <li>Resets state slices referenced by the calling client's selector map when invoked with 0 arguments.</li>
                    <li>Performs a total state reset when <pre>{ `@@STATE` }</pre> is present in the calling client's selector map.</li>
                    <li>Performs no state reset when a client with no selector map invokes this method with 0 arguments.</li>
                </ul>
            </div>
        </article>
    );
}
