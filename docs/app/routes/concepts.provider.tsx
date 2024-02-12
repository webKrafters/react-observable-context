import { Link } from '@remix-run/react';

export default function ConceptProvider() {
    return (
        <article className="concept-provider">
            <h1>Provider</h1>
            <div>
                <h3>What is the Provider?</h3>
                <div>
                    <p>The Provider component is a property of the Eagle Eye context object. As a <code>React.Context</code> API based provider, it accepts the customary <code>children</code> and <code>value</code> props. It also accepts <strong>2</strong> optional props: <Link to="/concepts/prehooks"><code>prehooks</code></Link> and <Link to="/concepts/storage"><code>storage</code></Link>.</p>
                    <p>External direct access to the context store may be obtained via the <code>ref</code> attribute. Please see a <Link to="/getting-started#provider-usage">Provider Usage</Link> sample.</p>
                    <p>Routinely, the <code>value</code>  prop is initialized with the full initial state. It may only be updated with parts of the state which are changing. Please see a <Link to="/getting-started#provider-usage">Provider Usage</Link> sample.</p>
                </div>
            </div>
        </article>
    );
};