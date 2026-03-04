import type { HeadFC } from 'gatsby';

import type { PageProps } from '../../page-context';

import React from 'react';

import Anchor from '../../partials/anchor';

const TRow : React.FC<{children: React.ReactNode}> = ({ children }) => ( <tr className="vertical-top">{ children }</tr> );
TRow.displayName = 'featuresHistory.TRow';

const TCol : React.FC<{children: React.ReactNode}> = ({ children }) => ( <td className="top-barred" style={{ paddingRight: '2rem' }}>{ children }</td> );

const THCol : React.FC<{children: React.ReactNode}> = ({ children }) => ( <th colSpan={ 2 } style={{ paddingRight: '2rem', textAlign: 'left' }}>{ children }</th> );

const FeaturesHistoryPage : React.FC<PageProps> = ({ className }) => (
    <article className={ `features-history-page ${ className }` }>
        <h1 id="changes">What's Changed?</h1>
        <table>
            <thead><TRow><THCol>v7.0.0</THCol></TRow></thead>
            <tbody>
                <TRow><TCol><b>1.</b></TCol><TCol>Migrating to Object Oriented first standalone state manager.</TCol></TRow>
                <TRow><td><b>2.</b></td><td>Expanded external subscriptions adding <code>data-updated</code> and <code>closing</code> events.</td></TRow>
               </tbody>
            <thead><TRow><THCol>v6.0.0</THCol></TRow></thead>
            <tbody>
                <TRow><TCol><b>1.</b></TCol><TCol>Upgraded data store to auto-immutable v2.</TCol></TRow>
                <TRow><td><b>2.</b></td><td>Updated <Anchor to="/external-access">external</Anchor> store subscriber signature.</td></TRow>
                <TRow><td><b>3.</b></td><td>Increased to a more targeted <Anchor to="/external-access">external</Anchor> store getState feature.</td></TRow>
                <TRow><td><b>4.</b></td><td>Equipped <Anchor to="/external-access">external</Anchor> store resetState feature with a zero-param function overload signature resulting in no-op.</td></TRow>
                <TRow><td><b>5.</b></td><td>Updated Typescript bindings.</td></TRow>
            </tbody>
            <thead><TRow><THCol>v5.0.0</THCol></TRow></thead>
            <tbody>
                <TRow><TCol><b>1.</b></TCol><TCol>Converted to full Typescript.</TCol></TRow>
            </tbody>
            <thead><TRow><THCol>v4.7.0</THCol></TRow></thead>
            <tbody>
                <TRow><TCol><b>1.</b></TCol><TCol><Anchor to="/concepts/store/setstate"><code>store.setState</code></Anchor> can now accept an array of updates for gurranteed orderly processing.</TCol></TRow>
            </tbody>
            <thead><TRow><THCol>v4.6.0</THCol></TRow></thead>
            <tbody>
                <TRow><TCol><b>1.</b></TCol><TCol><Anchor to="/concepts/store/resetstate"><code>store.resetState</code></Anchor> can now update reset current state even when initial state does not exist. Formerly, a resetState call on a non-existent initial state had no effect.</TCol></TRow>
            </tbody>
            <thead><TRow><THCol>v4.5.0</THCol></TRow></thead>
            <tbody>
                <TRow><TCol><b>1.</b></TCol><TCol><Anchor to="/concepts/store/setstate/tags">Tags</Anchor> to update non-existent state slices are now recognized. <b>Previously,</b> they had resulted in no-ops. <b>From now on,</b> they will result in new default slices matching the result of the given tag operation.</TCol></TRow>
            </tbody>
            <thead><TRow><THCol>v4.4.0</THCol></TRow></thead>
            <tbody>
                <TRow><TCol><b>1.</b></TCol><TCol>Returns <code>undefined</code> for selector map pointing at a non-existent state slice. <i>(Previously returned <code>null</code>)</i>.</TCol></TRow>
            </tbody>
            <thead><TRow><THCol>v4.3.0</THCol></TRow></thead>
            <tbody>
                <TRow><TCol><b>1.</b></TCol><TCol>Added <code>React.Ref</code> forwarding to <code>connect</code>ed hoc client components.</TCol></TRow>
            </tbody>
            <thead><TRow><THCol>v4.1.0</THCol></TRow></thead>
            <tbody>
                <TRow><TCol><b>1.</b></TCol><TCol>Added new setState <Anchor to="/concepts/store/setstate/tags">tags</Anchor> to facilitate state update operations.</TCol></TRow>
                <TRow><td><b>2.</b></td><td>Added negative indexing capabilities.</td></TRow>
                <TRow><td><b>3.</b></td><td>Exposing the store via its Context Provider <code>ref</code> attribute.</td></TRow>
                <TRow><td><b>4.</b></td><td>Exporting crucial constants such as <b>@@STATE</b> and setState <Anchor to="/concepts/store/setstate/tags">tags</Anchor> such as <b>@@CLEAR</b>, <b>@@MOVE</b> etc.</td></TRow>
            </tbody>
            <thead><TRow><THCol>v4.0.0</THCol></TRow></thead>
            <tbody>
                <TRow><TCol><b>1.</b></TCol><TCol>Added the <Anchor to="/api#connect"><code>connect</code></Anchor> function to facilitate the encapsulated context-usage method.</TCol></TRow>
                <TRow><td><b>2.</b></td><td>Added stronger support for deeply nested state structure. See <Anchor to="/concepts/store/setstate"><code>store.setState</code></Anchor></td></TRow>
                <TRow><td><b>3.</b></td><td>Replaced the <Anchor to="/api#usecontext"><code>useContext</code></Anchor> watchedKeys array parameter with a <Anchor to="/concepts/selector-map"><code>selectorMap</code></Anchor> object.</td></TRow>
                <TRow><td><b>4.</b></td><td>Removed the necessity for direct store subscription.</td></TRow>
                <TRow><td><b>5.</b></td><td><Anchor to="/concepts/store/resetstate"><code>store.resetState</code></Anchor> can now take a <Anchor to="/concepts/property-path">property path</Anchor> array targeting which state slices to reset.</td></TRow>
                <TRow><td><b>6.</b></td><td>Context provider accepts an optional <Anchor to="/concepts/storage">storage</Anchor> prop for memorizing initial state.</td></TRow>
                <TRow><td><b>7.</b></td><td>Removed the need for <code>store.getState</code>. <code>store.data</code> now holds the state slices used at the client. Changes in any of the slices held by the <code>store.data</code> are automatically updated as they occur. The client is immediately notified of the update.</td></TRow>
            </tbody>
        </table>
    </article>
);

export default FeaturesHistoryPage;

export const Head : HeadFC = () => ( 
    <meta
        content="What's changed?"
        name="description"
    />
);
