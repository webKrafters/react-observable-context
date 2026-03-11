import React from 'react';

import Anchor from '../../partials/anchor';
import Paragraph from '../../partials/paragraph';
import ListItem from '../../partials/list-item';
import Name from '../../partials/name';
import VersionTabs, { SemVer } from '../../partials/version-tabs';

const semver_7_0_0 : SemVer = [ 7, 0, 0 ];

const PREHOOKS_DECL = `
interface Prehook<T>{
    resetState?: (
        resetData: Partial<T>, // resetData holds nextUpdate data.
        state: {
            current: T,
            original: T
        }
    ) => boolean;
    setState?: (
        newChanges: Partial<T> // newChanges holds nextUpdate data.
    ) => boolean;
}`;

const ConceptPrehooksPage : React.FC<{className? : string}> = ({ className }) => (
    <article className={ `concept-prehooks-page ${ className }` }>
        <h1>Prehooks</h1>
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

export default ConceptPrehooksPage;

function BodyCurrent() {
    return (
        <>
            <div>
                <h3>What are Prehooks?</h3>
                <div>Prehooks are user functions which are invoked by the <Name /> prior to executing its state operations.</div>
                <h3>Why Prehooks?</h3>
                <ListItem><div>Prehooks provide a central place for sanitizing, modifying, transforming, validating etc. all related incoming state updates. The context store obtains its prehooks via its context's optional <code>prehooks</code> property.</div></ListItem>
                <ListItem><div>The context store administers <strong>2</strong> update operations, each adhering to its own user-defined prehook when present. Otherwise, the update operation proceeds normally to completion. Thus, there are <strong>2</strong> prehooks named <strong>resetState</strong> and <strong>setState</strong> - after the store update methods they support.</div></ListItem>
                <ListItem><div>Each prehook returns a <strong>boolean</strong> value { '(' } <code>true</code> to continue AND <code>false</code> to abort the update operation{ ')' }. The prehook may modify { '(' }i.e. sanitize, transform, transpose{ ')' } the argument to accurately reflect the intended update value. This is done by mutating part of the argument which holds the next <code>nextUpdate</code> values.</div></ListItem>
                <h3 style={{ marginBottom: 0 }}>
                    What do Prehooks look like?
                </h3>
                <pre>{ PREHOOKS_DECL }</pre>
                <h3>How are Prehooks wired up to the <Name /> store?</h3>
                <Paragraph style={{ margin: '0 0 5px 10px' }}>
                    <h4>Method 1: At <Name /> creation</h4>
                    <pre style={{ margin: '10px 5px' }}>
                        const context = createEagleEye( T|AutoImmutable{ '<' }T{ '>' }?, Prehooks{ '<' }T{ '>' }?, IStorage{ '<' }T{ '>' }? )
                    </pre>
                </Paragraph>
                <Paragraph style={{ margin: '0 0 5px 10px' }}>
                    <h4>Method 2: Updating <Name /> prehooks property</h4>
                    <pre style={{ margin: '10px 5px' }}>
                        context.prehooks = Prehooks{ '<' }T{ '>' };
                    </pre>
                </Paragraph>
            </div>
        </>
    );
}

function BodyPre_7_0_0() {
    return (
        <>
            <div>
                <h3>What are Prehooks?</h3>
                <div>Prehooks are user functions which are invoked by the <Name /> prior to executing its state operations.</div>
                <h3>Why Prehooks?</h3>
                <ListItem><div>Prehooks provide a central place for sanitizing, modifying, transforming, validating etc. all related incoming state updates. The context store obtains its prehooks via its context <Anchor to="/concepts/provider">Provider's</Anchor> <code>prehooks</code> optional prop.</div></ListItem>
                <ListItem><div>The context store administers <strong>2</strong> update operations, each adhering to its own user-defined prehook when present. Otherwise, the update operation proceeds normally to completion. Thus, there are <strong>2</strong> prehooks named <strong>resetState</strong> and <strong>setState</strong> - after the store update methods they support.</div></ListItem>
                <ListItem><div>Each prehook returns a <strong>boolean</strong> value { '(' } <code>true</code> to continue AND <code>false</code> to abort the update operation{ ')' }. The prehook may modify { '(' }i.e. sanitize, transform, transpose{ ')' } the argument to accurately reflect the intended update value. This is done by mutating part of the argument which holds the next <code>nextUpdate</code> values.</div></ListItem>
                <h3 style={{ marginBottom: 0 }}>
                    What do Prehooks look like?
                </h3>
                <pre>{ PREHOOKS_DECL }</pre>
                <h3>How are Prehooks wired up to the context store?</h3>
                <div>Please visit the <Anchor to="/concepts/provider">Provider</Anchor> concept page.</div>
            </div>
        </>
    );
}
