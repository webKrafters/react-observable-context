import { Link } from '@remix-run/react';

export default function ConceptProvider() {
    return (
        <article className="concept-provider">
            <h1>Provider</h1>
            <div>
                <h3>What is the Provider?</h3>
                <div>
                    <p>The Provider component is a property of the Eagle Eye context object. As a <pre>{ `React.Context` }</pre> API based provider, it accepts the customary <pre>{ `children` }</pre> and <pre>{ `value` }</pre> props. It also accepts <strong>2</strong> optional props: <Link to="/concepts/prehooks"><pre>prehooks</pre></Link> and <Link to="/concepts/storage"><pre>storage</pre></Link>.</p>
                    <p>External direct access to the context store may be obtained via the <pre>{ `ref` }</pre> attribute. Please see a <Link to="/getting-started#provider-usage">Provider Usage</Link> sample.</p>
                    <p>Routinely, the <pre>{ `value` }</pre> prop is initialized with the full initial state. It may only be updated with parts of the state which are changing. Please see a <Link to="/getting-started#provider-usage">Provider Usage</Link> sample.</p>
                </div>
            </div>
        </article>
    );
};