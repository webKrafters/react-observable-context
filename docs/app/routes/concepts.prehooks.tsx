import { Link } from '@remix-run/react';

export default function ConceptPrehooks() {
    return (
        <article className="concept-prehooks">
            <h1>Prehooks</h1>
            <div>
                <h3>What are Prehooks?</h3>
                <div>Prehooks are user functions which are invoked by the Eagle Eye context prior to executing context state operations.</div>
                <h3>Why Prehooks?</h3>
                <ul>
                    <li>Prehooks provide a central place for sanitizing, modifying, transforming, validating etc. all related incoming state updates. The context store obtains its prehooks via its context <Link to="/concepts/provider">Provider's</Link> <code>prehooks</code> optional prop.</li>
                    <li>The context store <strong>2</strong> update operations each adhere to its own user-defined prehook when present. Otherwise, the update operation proceeds normally to completion. Thus, there are <strong>2</strong> prehooks named <strong>resetState</strong> and <strong>setState</strong> - after the store update methods they support.</li>
                    <li>Each prehook returns a <strong>boolean</strong> value { '(' } <code>true</code> to continue AND <code>false</code> to abort the update operation{ ')' }. The prehook may modify { '(' }i.e. sanitize, transform, transpose{ ')' } the argument to accurately reflect the intended update value. This is done by mutating part of the argument which holds the next <code>nextUpdate</code> values.</li>
                </ul>
                <h3>What do Prehooks look like?</h3>
                <ol>
                    <li>
                        <p style={{ margin: '0 0 5px 10px' }}>
                            <b>resetState:</b> 
                            <code style={{ margin: '10px 5px' }}>(resetData: PartialState&lt;State&gt;, state: &#10100;current: State, original: State&#10101;) =&gt; boolean;</code> // <b><i><code>resetData</code></i></b> holds the <code>nextUpdate</code> values.
                        </p>
                    </li>
                    <li>
                        <p style={{ margin: '0 0 5px 10px' }}>
                            <b>setState:</b> 
                            <code style={{ margin: '10px 5px' }}>(newChanges: PartialState&lt;State&gt;) =&gt; boolean;</code> // <b><i><code>newChanges</code></i></b> holds the <code>nextUpdate</code> values.
                        </p>
                    </li>
                </ol>
                <h3>How are Prehooks wired up to the context store?</h3>
                <div>Please visit the <Link to="/concepts/provider">Provider</Link> concept page.</div>
            </div>
        </article>
    );
}