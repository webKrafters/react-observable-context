import { Link } from '@remix-run/react';

export default function Api() {
    return (
        <article className="api">
            <h1>API</h1>
            <div id="connect">
                <h3>connect</h3>
                <ul>
                    <li>is a function taking an Eagle Eye context object and an optional <Link to="/concepts/selector-map">selector map</Link> parameters; and returning a reusable connector function.</li>
                    <li>The connector function takes a client as a parameter and returns an HOC.</li>
                    <li>Any client using similar context object and selector map may be passed to this connector.</li>
                    <li>The HOC injects the context <Link to="/concepts/store">store</Link> to the client and handles all of the context usage requirements.</li>
                    <li>The injected <Link to="/concepts/store">store</Link> monitors changes in the underlying state slices referenced by the selector map.</li>
                    <li>A change in any of the referenced state slices automatically triggers an update of the related <pre>{ `store.data` }</pre> property and a subsequent render of the client.</li>
                    <li>Any prop name conflicts between injected <Link to="/concepts/store">store properties</Link> and the client's own props are resolved in favor of the client's own props.</li>
                </ul>
            </div>
            <div id="create-context">
                <h3>createContext</h3>
                <ul>
                    <li>is a zero-parameter function returning an Eagle Eye context object.</li>
                    <li>The returned object is the store-bearing context.</li>
                    <li>To access the context's <Link to="/concepts/store">store</Link>, pass the context as a <pre>{ `context` }</pre> parameter to either the <Link to="/api#connect">connect</Link> function or the <Link to="/api#usecontext">useContext</Link> hook.</li>
                </ul>
            </div>
            <div id="usage-error">
                <h3>UsageError</h3>
                <ul><li>is the Error type reported for attempts to access this context's store outside of its Provider component tree.</li> </ul>
            </div>
            <div id="usecontext">
                <h3>useContext</h3>
                <ul>
                    <li>is a hook taking an Eagle Eye context object and an optional <Link to="/concepts/selector-map">selector map</Link> parameters; and returning the context <Link to="/concepts/store">store</Link>.</li>
                    <li>The injected <Link to="/concepts/store">store</Link> monitors changes in the underlying state slices referenced by the selector map.</li>
                    <li>A change in any of the referenced state slices automatically triggers an update of the related <pre>{ `store.data` }</pre> property and a subsequent render of the client.</li>
                    <li>The <Link to="/api#connect">connect</Link> function is axiomatically the more conducive method for consuming this conetxt.</li>
                    <li>In certain user-specific cases, direct access to this hook may be preferrable.</li>
                    <li>In such cases, it is advisable to wrap the client in a <pre>{ `React.memo()` }</pre>.</li>
                </ul>
            </div>
        </article>
    );
}