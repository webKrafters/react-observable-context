export default function ConceptStorage() {
    return (
        <article className="concept-storage">
            <h1>Storage</h1>
            <div>
                <h3>About the Storage</h3>
                <div>
                    The Eagle Eye context allows for a user-defined Storage object to be provided for maintaining the integrity of the initial context state at a location of the user's choosing. This, it accepts, via its Provider's <pre>{ `storage` }</pre> optional prop. The context defaults to <pre>{ `window.sessionstorage` }</pre> in supporting environments. Otherwise, it defaults to its own internal memory-based storage.<br />
                    A valid storage object is of the type: <pre>{ `IStorage<State>` }</pre> implementing the following <strong>4</strong> methods:<br />
                    <ol>
                        <li><pre>{ `clone: (data: State) => State; // expects a state clone` }</pre></li>
                        <li><pre>{ `getItem: (key: string) => State;` }</pre></li>
                        <li><pre>{ `removeItem: (key: string) => void;` }</pre></li>
                        <li><pre>{ `setItem: (key: string, data: State) => void;` }</pre></li>
                    </ol>
                </div>
            </div>
        </article>
    );
}