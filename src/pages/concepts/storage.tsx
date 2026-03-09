import React from 'react';
import VersionTabs, { SemVer } from '../../partials/version-tabs';

const semver_7_0_0 : SemVer = [ 7, 0, 0 ];

const ConceptStoragePage : React.FC<{className? : string}> = ({ className }) => (
    <article className={ `concept-storage-page ${ className }` }>
        <h1>Storage</h1>
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

export default ConceptStoragePage;

function BodyCurrent(){
    return (
        <>
            <h3>About the Storage</h3>
            <p>The Eagle Eye context allows for a user-defined Storage object to be provided for maintaining the integrity of the initial context state at a location of the user's choosing.</p>
            <p>This, it accepts, either via its <code>createEagleEye{ '(...)' }</code> optional third parameter or by setting its <code>prehooks</code> property.</p>
            <Common />
        </>
    );
}

function BodyPre_7_0_0(){
    return (
        <>
            <h3>About the Storage</h3>
            <p>The Eagle Eye context allows for a user-defined Storage object to be provided for maintaining the integrity of the initial context state at a location of the user's choosing.</p>
            <p>This, it accepts, via its Provider's <code>storage</code> optional prop.</p>
            <Common />
        </>
    );
}

function Common() {
    return (
        <>
            <p>The context defaults to <code>window.sessionstorage</code> in supporting environments. Otherwise, it defaults to its own internal memory-based storage.</p>
            <p>
                A valid storage object is of the type: <code>IStorage&lt;State&gt;</code> implementing the following <strong>4</strong> methods:<br />
                <ol>
                    <li><code>clone: (data: State) =&gt; State; // expects a state clone</code></li>
                    <li><code>getItem: (key: string) =&gt; State;</code></li>
                    <li><code>removeItem: (key: string) =&gt; void;</code></li>
                    <li><code>setItem: (key: string, data: State) =&gt; void;</code></li>
                </ol>
            </p>
        </>
    );
}
