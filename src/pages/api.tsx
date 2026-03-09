import React from 'react';

import Anchor from '../partials/anchor';
import ListItem from '../partials/list-item';
import VersionTabs, { SemVer } from '../partials/version-tabs';

const semver_7_0_0 : SemVer = [ 7, 0, 0 ];

const ApiPage : React.FC<{className? : string}> = ({ className }) => (
    <article className={ `api-page ${ className }` }>
        <h1>API</h1>
        <VersionTabs
            options={[{
                documentation: ( <BodyCurrent /> ),
                version: semver_7_0_0
            }, {
                documentation: ( <BodyPre_7_0_0 /> ),
                version: 'Legacy'
            }]}
        />
    </article>
);

export default ApiPage;

function BodyCurrent(){
    return (
        <>
            <div id="cache">
                <h3>cache</h3>
                <ListItem><div>is a property provideing access to the underlying immutable cache managed by this context.</div></ListItem>
            </div>
            <div id="closed">
                <h3>closed</h3>
                <ListItem><div>is a boolean property confirming that the context is still active.</div></ListItem>
                <ListItem><div>Use the <Anchor to="/external-access#subscribing-to-context-disposal">"closing"</Anchor> event to be notified right before context deactivation.</div></ListItem>
                <ListItem><div>Please see the <Anchor to="/api#dispose">dispose</Anchor> method below.</div></ListItem>
            </div>
            <div id="connect">
                <h3>connect</h3>
                <ListItem><div>is a function property of the Eagle Eye context object, accepting an optional <Anchor to="/concepts/selector-map">selector map</Anchor> parameter; and returning a reusable connector function.</div></ListItem>
                <ListItem><div>The connector function takes a client as a parameter and returns an HOC.</div></ListItem>
                <ListItem><div>Any client intending to observe similar selector map from within the context object may be passed to this connector.</div></ListItem>
                <ListItem><div>The HOC injects the context's change stream <Anchor to="/concepts/store">store</Anchor> to the client and handles all of the context usage requirements.</div></ListItem>
                <ListItem><div>The injected <Anchor to="/concepts/store">store</Anchor> monitors changes in the underlying state slices referenced by the selector map.</div></ListItem>
                <ListItem><div>A change in any of the referenced state slices automatically triggers an update of the related <code>store.data</code> property and a subsequent render of the client.</div></ListItem>
                <ListItem><div>Any prop name conflicts between the injected <Anchor to="/concepts/store">store properties</Anchor> and the client's own props are resolved in favor of the client's own props. Such a scenario may be remedied by renaming the conflicting key within the <Anchor to="/concepts/selector-map">selector map</Anchor>.</div></ListItem>
            </div>
            <div id="create-context">
                <h3>createEagleEye</h3>
                <ListItem><div>is a function accepting three optional parameters { '(' }to wit: the initial state object or an <Anchor to="https://auto-immutable.js.org/getting-started/">AutoImmutable</Anchor> instance bearing this initial state object, the <Anchor to="/concepts/prehooks">prehooks</Anchor> and the <Anchor to="/concepts/storage">storage</Anchor>{ ')' } and returning an Eagle Eye context object.</div></ListItem>
                <ListItem><div>The returned object is the store-bearing context.</div></ListItem>
                <ListItem><div>The context's <Anchor to="/external-access">store</Anchor> is directly accessible through its <code>store</code> property.</div></ListItem>
                <ListItem><div>A change stream <Anchor to="/concepts/store">store</Anchor> for this <code>context</code> can be obtained either by utilizing its <Anchor to="/api#connect">connect</Anchor> function property or by expressing its <Anchor to="/api#usecontext">useStream</Anchor> property as a react component hook.</div></ListItem>
            </div>
            <div id="dispose">
                <h3>dispose</h3>
                <ListItem><div>is a context method to deactivates this context.</div></ListItem>
                <ListItem><div>Context deactivation is permanent.</div></ListItem>
                <ListItem><div>The context's <Anchor to="/api#closed"><code>closed</code></Anchor> property confirms this status.</div></ListItem>
            </div>
            <div id="usage-error">
                <h3>UsageError</h3>
                <ListItem><div style={{ fontWeight: 700 }}>deprecated.</div></ListItem>
            </div>
            <div id="usecontext">
                <h3>useStream</h3>
                <ListItem><div>is a property of the Eagle Eye context object which can be expressed as a react hook.</div></ListItem>
                <ListItem><div>It accepts an optional <Anchor to="/concepts/selector-map">selector map</Anchor> parameter; and returns a change stream context <Anchor to="/concepts/store">store</Anchor>.</div></ListItem>
                <ListItem><div>The injected <Anchor to="/concepts/store">store</Anchor> monitors changes in the underlying state slices referenced by the selector map.</div></ListItem>
                <ListItem><div>A change in any of the referenced state slices automatically triggers an update of the related <code>store.data</code> property and a subsequent render of the client.</div></ListItem>
                <ListItem><div>The context's <Anchor to="/api#connect">connect</Anchor> property function is axiomatically the more conducive method for consuming this conetxt.</div></ListItem>
                <ListItem><div>In certain user-specific cases, direct access to this method may be preferrable.</div></ListItem>
                <ListItem><div>In such cases, it is advisable to wrap the client in a <code>React.memo() if needed</code>.</div></ListItem>
            </div>
        </>
    );
}

function BodyPre_7_0_0(){
    return (
        <>
            <div id="connect">
                <h3>connect</h3>
                <ListItem><div>is a function taking an Eagle Eye context object and an optional <Anchor to="/concepts/selector-map">selector map</Anchor> parameters; and returning a reusable connector function.</div></ListItem>
                <ListItem><div>The connector function takes a client as a parameter and returns an HOC.</div></ListItem>
                <ListItem><div>Any client using similar context object and selector map may be passed to this connector.</div></ListItem>
                <ListItem><div>The HOC injects the context <Anchor to="/concepts/store">store</Anchor> to the client and handles all of the context usage requirements.</div></ListItem>
                <ListItem><div>The injected <Anchor to="/concepts/store">store</Anchor> monitors changes in the underlying state slices referenced by the selector map.</div></ListItem>
                <ListItem><div>A change in any of the referenced state slices automatically triggers an update of the related <code>store.data</code> property and a subsequent render of the client.</div></ListItem>
                <ListItem><div>Any prop name conflicts between the injected <Anchor to="/concepts/store">store properties</Anchor> and the client's own props are resolved in favor of the client's own props. Such a scenario may be remedied by renaming the conflicting key within the <Anchor to="/concepts/selector-map">selector map</Anchor>.</div></ListItem>
            </div>
            <div id="create-context">
                <h3>createContext</h3>
                <ListItem><div>is a zero-parameter function returning an Eagle Eye context object.</div></ListItem>
                <ListItem><div>The returned object is the store-bearing context.</div></ListItem>
                <ListItem><div>To access the context's <Anchor to="/concepts/store">store</Anchor>, pass the context as a <code>context</code> parameter to either the <Anchor to="/api#connect">connect</Anchor> function or the <Anchor to="/api#usecontext">useContext</Anchor> hook.</div></ListItem>
            </div>
            <div id="usage-error">
                <h3>UsageError</h3>
                <ListItem><div>is the Error type reported for attempts to access this context's store outside of its Provider component tree.</div></ListItem>
            </div>
            <div id="usecontext">
                <h3>useContext</h3>
                <ListItem><div>is a hook taking an Eagle Eye context object and an optional <Anchor to="/concepts/selector-map">selector map</Anchor> parameters; and returning the context <Anchor to="/concepts/store">store</Anchor>.</div></ListItem>
                <ListItem><div>The injected <Anchor to="/concepts/store">store</Anchor> monitors changes in the underlying state slices referenced by the selector map.</div></ListItem>
                <ListItem><div>A change in any of the referenced state slices automatically triggers an update of the related <code>store.data</code> property and a subsequent render of the client.</div></ListItem>
                <ListItem><div>The <Anchor to="/api#connect">connect</Anchor> function is axiomatically the more conducive method for consuming this conetxt.</div></ListItem>
                <ListItem><div>In certain user-specific cases, direct access to this hook may be preferrable.</div></ListItem>
                <ListItem><div>In such cases, it is advisable to wrap the client in a <code>React.memo()</code>.</div></ListItem>
            </div>
        </>
    );
}
