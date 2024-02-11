import { Link } from '@remix-run/react';

export default function ConceptStore() {
    return (
        <article className="concept-store">
            <h1>Store</h1>
            <div>
                <h3>What is the store?</h3>
                <div>
					An Eagle Eye context <pre>{ `store` }</pre> is the client's portal into the context's underlying state. It exposes <strong>3</strong> properties namely:
					<ol>
						<li>
							<strong>data:</strong> 
							<span>
								which is an object holding resolved state slices as declared in the selector map. <Link to="/concepts/selector-map#selector-map-example">See selector map to store data example here</Link>
							</span>
						</li>
						<li>
							<Link to="/concepts/store/resetstate"><strong>resetState:</strong></Link> 
							<pre>{ `(propertyPaths?: Array&lt;string&gt;) => void // resets slices of state referenced by the property paths to their initial values.` }</pre>
						</li>
						<li>
							<Link to="/concepts/store/setstate"><b>setState:</b></Link> 
							<pre>{ `(changes: Changes&lt;State&gt;) => void // merges only new/changed state slices.` }</pre>
						</li>
					</ol>
                </div>
            </div>
        </article>
    );
}