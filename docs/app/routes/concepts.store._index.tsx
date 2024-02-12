import { Link } from '@remix-run/react';

export default function ConceptStore() {
    return (
        <article className="concept-store">
            <h1>Store</h1>
            <div>
                <h3>What is the store?</h3>
                <div>
					An Eagle Eye context <code>store</code> is the client's portal into the context's underlying state. It exposes <strong>3</strong> properties namely:
					<ol>
						<li>
							<strong style={{ marginRight: '0.25rem' }}>data:</strong> 
							which is an object holding resolved state slices as declared in the selector map. <Link to="/concepts/selector-map#selector-map-example">See selector map to store data example here</Link>
						</li>
						<li>
							<Link style={{ marginRight: '0.25rem' }} to="/concepts/store/resetstate"><strong>resetState:</strong></Link>
							<code>(propertyPaths?: Array&lt;string&gt;) =&gt; void // resets slices of state referenced by the property paths to their initial values.</code>
						</li>
						<li>
							<Link style={{ marginRight: '0.25rem' }} to="/concepts/store/setstate"><strong>setState:</strong></Link>
							<code>(changes: Changes&lt;State&gt;) =&gt; void // merges only new/changed state slices.</code>
						</li>
					</ol>
                </div>
            </div>
        </article>
    );
}