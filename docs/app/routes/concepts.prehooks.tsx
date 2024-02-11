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
                    <li>Prehooks provide a central place for sanitizing, modifying, transforming, validating etc. all related incoming state updates. The context store obtains its prehooks via its context <Link to="/concepts/provider">Provider's</Link> <pre>{ `prehooks` }</pre> optional prop.</li>
                    <li>The context store <strong>2</strong> update operations each adhere to its own user-defined prehook when present. Otherwise, the update operation proceeds normally to completion. Thus, there are <strong>2</strong> prehooks named <strong>resetState</strong> and <strong>setState</strong> - after the store update methods they support.</li>
                    <li>Each prehook returns a <strong>boolean</strong> value { '(' }<pre>{ `true` }</pre> to continue AND <pre>{ `false` }</pre> to abort the update operation{ ')' }. The prehook may modify { '(' }i.e. sanitize, transform, transpose{ ')' } the argument to accurately reflect the intended update value. This is done by mutating part of the argument which holds the next <pre>{ `nextUpdate` }</pre> values.</li>
                </ul>
                <h3>What do Prehooks look like?</h3>
                <ol>
                    <li>
                        <strong>resetState:</strong> 
                        <pre>{ `(resetData: PartialState&lt;State&gt;, state: {current: State, original: State}) => boolean;` }</pre> // <strong><i><pre>{ `resetData` }</pre></i></strong> holds the <pre>{ `nextUpdate` }</pre> values.
                    </li>
                    <li>
                        <strong>setState:</strong> 
                        <pre>{ `(newChanges: PartialState&lt;State&gt;) => boolean;` }</pre> // <strong><i><pre>{ `newChanges` }</pre></i></strong> holds the <pre>{ `nextUpdate` }</pre> values.
                    </li>
                </ol>
                <h3>How are Prehooks wired up to the context store?</h3>
                <div>Please visit the <Link to="/concepts/provider">Provider</Link> concept page.</div>
            </div>
        </article>
    );
}