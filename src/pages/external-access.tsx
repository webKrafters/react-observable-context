import React, { ReactNode } from 'react';

import CodeBlock from '../partials/code-block';

import Alert from '../partials/alert';
import Anchor from '../partials/anchor';
import Header from '../partials/segment-header';
import ListItem from '../partials/list-item';
import Paragraph from '../partials/paragraph';
import VersionTabs, { SemVer } from '../partials/version-tabs';

const semver7_0_0 : SemVer = [ 7, 0, 0 ];
const semver6_0_0 : SemVer = [ 6, 0, 0 ];

const providerCode =
`import React, { forwardRef } from 'react';
import ObservableContext from './context'; // using example from the "Getting Started Page"
import Ui from './ui'; // using example from the "Getting Started Page"

const initState = {a: { b: { x: { y: { z: [ 2022 ] } } } }};

const ProviderDemo = forwardRef(( props, ref ) => {
    // signify to parent the exit of the storeRef Provider on component unmount.
    useEffect(() => () => setTimeout( () => props?.onDismount(), 0 ), []);
    return (
        <ObservableContext.Provider ref={ ref } value={ initState }>
            <Ui />
        </ObservableContext.Provider>
    );
};
ProviderDemo.displayName = 'ProviderDemo';

export default ProviderDemo;`

const setupCode =
`import React, { useCallback, useEffect, useRef, useState } from 'react';
import ProviderDemo from './provider-demo';
import StoreMonitor from './debug-monitor';
const App = () => {
    const storeRef = useRef();
    const [ refChangeCount, setRefChangeCount ] = useState( 0 );
    const updateMonitor = useCallback(() => setRefChangeCount( c => c + 1 ), []);
    const [ monitor ] = useState(() => new StoreMonitor( d => console.log( d ) ));
    useEffect(() => {
        monitor.source = storeRef.current;
        return () => monitor.cleanup();
    }, [ refChangeCount ]);
    return (
        <ProviderDemo
            onDismount={ updateMonitor }
            ref={ storeRef }
        />
    );
}
export default App;`

const setupCode_7_0_0 =
`import React, { useCallback, useEffect, useRef, useState } from 'react';
import ObservableContext from './context'; // using example from the "Getting Started Page"
import Ui from './ui'; // using example from the "Getting Started Page"
import StoreMonitor from './debug-monitor';
const App = () => {
    const [ monitor ] = useState(() => new StoreMonitor(
        d => console.log( d ),
        ObservableContext.store
    ));
    useEffect(() => {})
    useEffect(() => () => monitor.cleanup(), []);
    return ( <Ui /> );
}
export default App;`

const externalAccessCode =
`class Monitor {
    private _onEvent;
    private _store;
    private _unsub;
    constructor( onEvent, store ) {
        this._onEvent = onEvent;
        this._source = store;
    }
    set onEvent( handler ) { this._onEvent = handler }
    get source() { return this._store }
    set source( store ) {
        if( store === this._store ) { return }
        this.cleanup();
        if( !store ) { return }
        this._store = store;
        this._onEvent( this._store.getState() );
        this._unsub = store.subscribe(
            () => this._onEvent( this._store.getState() )
        );
    }
    cleanup() {
        this._unsub?.();
        this._store = null;
    }
}
export default Monitor;`

const RESET_STATE_SAMPLE =
`store.subscribe((
    changes: Changes<State>
) => void ) // => VoidFunction`

const RESET_STATE_SAMPLE_v6_0_0 =
`store.subscribe((
    changes : Changes<State>,
    changedPaths : Array<Array<string>>,
    netChanges : Partial<State>,
    mayHaveChangesAt : (tokenizedPath : string[]) => boolean
) => void) // => VoidFunction`

const RESET_STATE_SAMPLE_v7_0_0 =
`store.subscribe(
    'data-updated', (
        changes : Changes<State>,
        changedPaths : Array<Array<string>>,
        netChanges : Partial<State>,
        mayHaveChangesAt : (tokenizedPath : string[]) => boolean
    ) => void
); // => VoidFunction`

const ExternalAccessPage : React.FC<{className : string}> = ({ className }) => (
    <article className={ `external-access-page ${ className }` }>
        <h1>External Access</h1>
        <VersionTabs
            options={[{
                documentation: ( <BodyCurrent /> ),
                version: semver7_0_0
            }, {
                documentation: (
                    <BodyPre7_0_0>
                        <pre>{ RESET_STATE_SAMPLE_v6_0_0 }</pre>
                        <b>Observer Callback Params</b><br />
                        <ol>
                            <li><u>changes:</u> an object or array holding the original change request payload(s).</li>
                            <li><u>changedPaths:</u> an array of tokenized property paths belonging to state properties changed during this request.</li>
                            <li><u>netChanges:</u> an object of the final state of all properties in state changed.</li>
                            <li><u>mayHaveChangesAt:</u> a function to confirm that a given property path is among the new changes. This path is to be supplied as a tokenized string (i.e. supply <code>['a', 'b', 'c', '0', 'r']</code> for <code>'a.b.c[0].r'</code>).</li>
                        </ol>
                    </BodyPre7_0_0>
                ),
                version: semver6_0_0
            }, {
                documentation: (
                    <BodyPre7_0_0>
                        <pre>{ RESET_STATE_SAMPLE }</pre>
                        <b>Observer Callback Params</b><br />
                        <ol>
                            <li><u>changes:</u> an object or array holding the original change request payload(s).</li>
                        </ol>
                    </BodyPre7_0_0>
                ),
                version: 'Legacy'
            }]}
        />
    </article>
);

export default ExternalAccessPage;

function BodyCurrent() {
    return (
        <>  
            <Paragraph>The context, once created, has a store property which is accessible from any where whether within the react component tree or in a native runtime environment.</Paragraph>
            <h3>How do I access the store externally?</h3>
            <Paragraph>This is done by simply utilizing the context <code>store</code> property.</Paragraph>
            <Paragraph>For external access to the context, <strong>4</strong> store methods have been exposed. Namely:</Paragraph>
            <ol id="external-apis">
                <li><strong><code>store.getState()</code>:</strong> Provides a static snapshot of the current state. Since v6.0.0, may accept a list of property paths to target properties within the state to fetch and return</li>
                <li><strong><code>store.resetState()</code>:</strong> Please see descriptions in the <Anchor to="/concepts/store/resetstate">store</Anchor> page. Since v6.0.0, may accept a parameterless invocation resulting in a noop.</li>
                <li><strong><code>store.setState()</code>:</strong> Please see descriptions in the <Anchor to="/concepts/store/setstate">store</Anchor> page.</li>
                <li>
                    <strong><code>store.subscribe(...)</code></strong><br />
                    <table>
                        <tr>
                            <td style={{ paddingRight: '0.5rem', verticalAlign: 'top' }}>-</td>
                            <td>Provides the API for manual subscription to the context's change and close events.</td>
                        </tr>
                        <tr>
                            <td style={{ paddingRight: '0.5rem', verticalAlign: 'top' }}>-</td>
                            <td>Returns a parameterless void function - the <b><u>unsubcriber</u></b>.</td>
                        </tr>
                        <tr id="subscribing-to-context-disposal">
                            <td style={{ paddingRight: '0.5rem', verticalAlign: 'top' }}>-</td>
                            <td>Accepts a <b>"closing"</b> event type and an observer function to be called before context deactivation.</td>
                        </tr>
                        <tr id="subscribing-to-context-state-update">
                            <td style={{ paddingRight: '0.5rem', verticalAlign: 'top' }}>-</td>
                            <td>Accepts a <b>"data-updated"</b> event type and an observer function for state changes.</td>
                        </tr>
                    </table>
                    <pre>{ RESET_STATE_SAMPLE_v7_0_0 }</pre>
                    <b><u>"data-updated"</u>  event listener params</b><br />
                    <ol>
                        <li><u>changes:</u> an object or array holding the original change request payload(s).</li>
                        <li><u>changedPaths:</u> an array of tokenized property paths belonging to state properties changed during this request.</li>
                        <li><u>netChanges:</u> an object of the final state of all properties in state changed.</li>
                        <li><u>mayHaveChangesAt:</u> a function to confirm that a given property path is among the new changes. This path is to be supplied as a tokenized string (i.e. supply <code>['a', 'b', 'c', '0', 'r']</code> for <code>'a.b.c[0].r'</code>).</li>
                    </ol>
                </li>
            </ol>
            <h4>Let's see some code!</h4>
            <div className="snippet-box">
                <Header>app.js</Header>
                <div>Sharing the store with a class.</div>
                <CodeBlock>{ setupCode_7_0_0 }</CodeBlock>
            </div>
            <div className="snippet-box">
                <Header>debug-monitor.js</Header>
                <div>Using a simple class instance to montor and report changes in the store in realtime.</div>
                <CodeBlock>{ externalAccessCode }</CodeBlock>
            </div>
            <Alert title="Pro Tips">
                <Paragraph>State references are always snapshots of the state at the time of access. In essence, the state returned by <code>context.store.getState(...)</code> are not affected by subsequent updates to the store's state. Any updates to this acquired state never affects the context's state. So therefore, the <strong>4</strong> considerations:</Paragraph>
                <ListItem><div>use only the <code>context.store.setState(...)</code> to update the context internal store.</div></ListItem>
                <ListItem><div><code>context.store.getState(...)</code> must be used to obtain the current state value.</div></ListItem>
                <ListItem><div>use your <code>context.store.subscribe(...)</code> to manually subscribe to state changes and refresh your current state value in realtime.</div></ListItem>
                <ListItem><div>use the <code>unsubscriber</code> returned by your context store's <code>subscribe(...)</code> to unsubscribe from the store when needed.</div></ListItem>
            </Alert>
        </>

    );
}

function BodyPre7_0_0({ children } : { children : ReactNode }) {
    return (
        <>  
            <Paragraph>Normally, the context must be rendered within the component tree in order to make its store accessible - any attempt to the contrary leads to a <code>UsageError</code>.</Paragraph>
            <Paragraph>However, once rendered, its store becomes accessible both within its context component tree and externally.</Paragraph>
            <h3>How do I access the store externally?</h3>
            <Paragraph>This is done by obtaining a reference to the Provider component. Once obtained, its <code>current</code> property { '(' }i.e. which holds the referenced store object{ ')' } can be passed around to other parts of the application.</Paragraph>
            <Paragraph>When the reference is no longer needed, be sure to unsubscribe all observers attached through this store reference during this phase.</Paragraph>
            <Paragraph>For external access to the context, <strong>4</strong> store methods have been exposed. Namely:</Paragraph>
            <ol id="external-apis">
                <li><strong><code>store.getState()</code>:</strong> Provides a static snapshot of the current state. Since v6.0.0, may accept a list of property paths to target properties within the state to fetch and return</li>
                <li><strong><code>store.resetState()</code>:</strong> Please see descriptions in the <Anchor to="/concepts/store/resetstate">store</Anchor> page. Since v6.0.0, may accept a parameterless invocation resulting in a noop.</li>
                <li><strong><code>store.setState()</code>:</strong> Please see descriptions in the <Anchor to="/concepts/store/setstate">store</Anchor> page.</li>
                <li>
                    <strong><code>store.subscribe(...)</code></strong>
                    <table>
                        <tr>
                            <td style={{ paddingRight: '0.5rem', verticalAlign: 'top' }}>-</td>
                            <td>Provides an API for manual subscription to the state.</td>
                        </tr>
                        <tr>
                            <td style={{ paddingRight: '0.5rem', verticalAlign: 'top' }}>-</td>
                            <td>Accepts an observer function.</td>
                        </tr>
                        <tr>
                            <td style={{ paddingRight: '0.5rem', verticalAlign: 'top' }}>-</td>
                            <td>Returns a parameterless void function - the <b><u>unsubcriber</u></b>.</td>
                        </tr>
                    </table>
                    { children }
                </li>
            </ol>
            <h4>Let's see some code!</h4>
            <div className="snippet-box">
                <Header>provider-demo.js</Header>
                <div>Making our Provider accessible to the parent component.</div>
                <CodeBlock>{ providerCode }</CodeBlock>
            </div>
            <div className="snippet-box">
                <Header>app.js</Header>
                <div>Grabbing a ref to the Provider component and sharing it with a class.</div>
                <CodeBlock>{ setupCode }</CodeBlock>
            </div>
            <div className="snippet-box">
                <Header>debug-monitor.js</Header>
                <div>Using a simple class instance to montor and report changes in the store in realtime.</div>
                <CodeBlock>{ externalAccessCode }</CodeBlock>
            </div>
            <Alert title="Pro Tips">
                <Paragraph>Store references are simply ReactJS references to the Eagle Eye Provider component. Therefore, after <code>unmounting</code> the <code>Provider</code> component, the <code>storeRef.current</code> becomes empty. So therefore:</Paragraph>
                <ListItem><div>if the need exists to maintain the store beyond the life of the Provider, then keep a reference to the state snapshot returned by the last valid <code>storeRef.current.getState()</code> call.</div></ListItem>
                <ListItem><div>be sure to unsubscribe all external subscribers attached to the <code>Provider</code>'s store reference, at or prior to the <code>unmount</code> phase of the <code>Provider</code> component.</div></ListItem>
                <Paragraph>State references are always snapshots of the state at the time of access. In essence, the state returned by <code>storeRef.current.getState()</code> are not affected by subsequent updates to the store's state. Any updates to this acquired state never affects the context's state. So therefore, the <strong>4</strong> considerations:</Paragraph>
                <ListItem><div>use only the <code>storeRef.current.setState(...)</code> to update the context internal store.</div></ListItem>
                <ListItem><div><code>storeRef.current.getState()</code> must be used to obtain the current state value.</div></ListItem>
                <ListItem><div>use your <code>storeRef.current.subscribe(...)</code> to manually subscribe to state changes and refresh your current state value in realtime.</div></ListItem>
                <ListItem><div>use the <code>unsubscriber</code> returned by your storeRef's <code>subscribe(...)</code> to unsubscribe from the store when needed.</div></ListItem>
            </Alert>
        </>
    );
}
