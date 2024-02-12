import { Link } from '@remix-run/react';

export default function ConceptStoreResetState() {
    return (
        <article className="concept-store-resetstate">
            <h1><code>store.resetState</code> Usage</h1>
            <div>
                <h3>What does the store resetState method do?</h3>
                <ul>
                    <li>Resets slices of state to their initial state values as desired.</li>
                    <li>Accepts an array of property paths referencing the desired slices of state to reset.</li>
                    <li>Performs a total state reset when <Link to="/concepts/property-path#fullstate-selectorkey"><code>@@STATE</code></Link> is present in the property paths array.</li>
                    <li>Resets state slices referenced by the calling client's <Link to="/concepts/selector-map">selector map</Link> when invoked with 0 arguments.</li>
                    <li>Performs a total state reset when invoked with 0 arguments and <Link to="/concepts/property-path#fullstate-selectorkey"><code>@@STATE</code></Link> is present in the calling client's <Link to="/concepts/selector-map">selector map</Link>.</li>
                    <li>Performs no state reset when a client with no <Link to="/concepts/selector-map">selector map</Link> invokes this method with 0 arguments.</li>
                </ul>
            </div>
        </article>
    );
}
