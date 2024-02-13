import { Link } from '@remix-run/react';

import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => [{
    content: 'What\'s changed?',
    name: 'description'
}];

const TRow : React.FC<{children: React.ReactNode}> = ({ children }) => ( <tr className="vertical-top">{ children }</tr> );
TRow.displayName = 'eaturesHistory.TRow';

const TCol : React.FC<{children: React.ReactNode}> = ({ children }) => ( <td className="top-barred">{ children }</td> );

export default function FeaturesHistory() {
    return (
        <article className="features-history">
            <h1 id="changes">What's Changed?</h1>
            <table>
                <thead><TRow><th>v4.7.0</th></TRow></thead>
                <tbody>
                    <TRow><TCol><b>1.</b></TCol><TCol><Link to="/concepts/store/setstate"><code>store.setState</code></Link> can now accept an array of updates for gurranteed orderly processing.</TCol></TRow>
                </tbody>
                <thead><TRow><th>v4.6.0</th></TRow></thead>
                <tbody>
                    <TRow><TCol><b>1.</b></TCol><TCol><Link to="/concepts/store/resetstate"><code>store.resetState</code></Link> can now update reset current state even when initial state does not exist. Formerly, a resetState call on a non-existent initial state had no effect.</TCol></TRow>
                </tbody>
                <thead><TRow><th>v4.5.0</th></TRow></thead>
                <tbody>
                    <TRow><TCol><b>1.</b></TCol><TCol><Link to="/concepts/store/setstate/tags">Tags</Link> to update non-existent state slices are now recognized. <b>Previously,</b> they had resulted in no-ops. <b>From now on,</b> they will result in new default slices matching the result of the given tag operation.</TCol></TRow>
                </tbody>
                <thead><TRow><th>v4.4.0</th></TRow></thead>
                <tbody>
                    <TRow><TCol><b>1.</b></TCol><TCol>Returns <code>undefined</code> for selector map pointing at a non-existent state slice. <i>(Previously returned <code>null</code>)</i>.</TCol></TRow>
                </tbody>
                <thead><TRow><th>v4.3.0</th></TRow></thead>
                <tbody>
                    <TRow><TCol><b>1.</b></TCol><TCol>Added <code>React.Ref</code> forwarding to <code>connect</code>ed hoc client components.</TCol></TRow>
                </tbody>
                <thead><TRow><th>v4.1.0</th></TRow></thead>
                <tbody>
                    <TRow><TCol><b>1.</b></TCol><TCol>Added new setState <Link to="/concepts/store/setstate/tags">tags</Link> to facilitate state update operations.</TCol></TRow>
                    <TRow><td><b>2.</b></td><td>Added negative indexing capabilities.</td></TRow>
                    <TRow><td><b>3.</b></td><td>Exposing the store via its Context Provider <code>ref</code> attribute.</td></TRow>
                    <TRow><td><b>4.</b></td><td>Exporting crucial constants such as <b>@@STATE</b> and setState <Link to="/concepts/store/setstate/tags">tags</Link> such as <b>@@CLEAR</b>, <b>@@MOVE</b> etc.</td></TRow>
                </tbody>
                <thead><TRow><th>v4.0.0</th></TRow></thead>
                <tbody>
                    <TRow><TCol><b>1.</b></TCol><TCol>Added the <Link to="/api#connect"><code>connect</code></Link> function to facilitate the encapsulated context-usage method.</TCol></TRow>
                    <TRow><td><b>2.</b></td><td>Added stronger support for deeply nested state structure. See <Link to="/concepts/store/setstate"><code>store.setState</code></Link></td></TRow>
                    <TRow><td><b>3.</b></td><td>Replaced the <Link to="/api#usecontext"><code>useContext</code></Link> watchedKeys array parameter with a <Link to="/concepts/selector-map"><code>selectorMap</code></Link> object.</td></TRow>
                    <TRow><td><b>4.</b></td><td>Removed the necessity for direct store subscription.</td></TRow>
                    <TRow><td><b>5.</b></td><td><Link to="/concepts/store/resetstate"><code>store.resetState</code></Link> can now take a <Link to="/concepts/property-path">property path</Link> array targeting which state slices to reset.</td></TRow>
                    <TRow><td><b>6.</b></td><td>Context provider accepts an optional <Link to="/concepts/storage">storage</Link> prop for memorizing initial state.</td></TRow>
                    <TRow><td><b>7.</b></td><td>Removed the need for <code>store.getState</code>. <code>store.data</code> now holds the state slices used at the client. Changes in any of the slices held by the <code>store.data</code> are automatically updated as they occur. The client is immediately notified of the update.</td></TRow>
                </tbody>
            </table>
        </article>
    );
};