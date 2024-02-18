import { Link } from '@remix-run/react';

export default function ConceptClient() {
    return (
        <article className="concept-client">
            <h1>Client</h1>
            <div>
                <h3>What is a client?</h3>
                <div>
                    A client is any component consuming the observable context. A client consumes the context either by using the Eagle Eye <Link to="/api#usecontext">useContext</Link> hook or by embedding itself within the connector returned by the Eagle Eye <Link to="/api#connect">connect</Link> function. Please see examples in <Link to="/getting-started#usecontext-usage">Consuming context { '(' }hook with memo method{ ')' }</Link> and <Link to="/getting-started#connect-usage">Consuming context { '(' }hoc method{ ')' }</Link> respectively.
                </div>
            </div>
        </article>
    );
}