export default function ConceptStorage() {
    return (
        <article className="concept-storage">
            <h1>Storage</h1>
            <div>
                <h3>About the Storage</h3>
                <div>
                    The Eagle Eye context allows for a user-defined Storage object to be provided for maintaining the integrity of the initial context state at a location of the user's choosing. This, it accepts, via its Provider's <code>storage</code> optional prop. The context defaults to <code>window.sessionstorage</code> in supporting environments. Otherwise, it defaults to its own internal memory-based storage.<br />
                    A valid storage object is of the type: <code>IStorage&lt;State&gt;</code> implementing the following <strong>4</strong> methods:<br />
                    <ol>
                        <li><code>clone: (data: State) =&gt; State; // expects a state clone</code></li>
                        <li><code>getItem: (key: string) =&gt; State;</code></li>
                        <li><code>removeItem: (key: string) =&gt; void;</code></li>
                        <li><code>setItem: (key: string, data: State) =&gt; void;</code></li>
                    </ol>
                </div>
            </div>
        </article>
    );
}