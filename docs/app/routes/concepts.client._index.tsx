import { Link } from '@remix-run/react';

export default function ConceptClient() {
    return (
        <article className="concept-client">
            <h1>Client</h1>
            <div>
                <h3>What is a client?</h3>
                <div>
                    <p>
                        A client is any component consuming the observable context. A client consumes the context by:
                        <ul>
                            <li>Either using the Eagle Eye <Link to="/api#usecontext">useContext</Link> hook</li>
                            <li>Or embedding itself within the connector returned by the Eagle Eye <Link to="/api#connect">connect</Link> function</li>
                        </ul>
                    </p>
                    <p>
                        Please see examples in:
                        <ol>
                            <li><Link to="/getting-started#usecontext-usage">Consuming context { '(' }hook with memo method{ ')' }</Link></li>
                            <li><Link to="/getting-started#connect-usage">Consuming context { '(' }hoc method{ ')' }</Link></li>
                        </ol>
                        respectively.
                    </p>
                </div>
            </div>
        </article>
    );
}