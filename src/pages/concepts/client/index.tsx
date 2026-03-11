import React from 'react';

import Anchor from '../../../partials/anchor';
import Name from '../../../partials/name';
import Paragraph from '../../../partials/paragraph';
import VersionTabs, { SemVer } from '../../../partials/version-tabs';

const semver_7_0_0 : SemVer = [ 7, 0, 0 ];

const ConceptClientPage : React.FC<{className? : string}> = ({ className }) => (
    <article className={ `concept-client-page ${ className }` }>
        <h1>Client</h1>
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

export default ConceptClientPage;

function BodyCurrent() {
    return (
        <div>
            <h3>What is a client?</h3>
            <div>
                <Paragraph>
                    A client is any component consuming the <Name />. A client consumes this context by:
                    <ul>
                        <li>either joining the <Name />'s change stream by invoking the context's <Anchor to="/api#usecontext">useStream</Anchor> hook property</li>
                        <li>or connecting itself to the change stream via the connector returned by the context's <Name /> <Anchor to="/api#connect">connect</Anchor> function property</li>
                    </ul>
                </Paragraph>
                <Paragraph>
                    Please see examples respectively in:
                    <ol>
                        <li><Anchor to="/getting-started#usecontext-usage">Joining the <Name /> change stream { '(' }hook with memo method{ ')' }</Anchor></li>
                        <li><Anchor to="/getting-started#connect-usage">Joining the <Name /> change stream { '(' }hoc method{ ')' }</Anchor></li>
                    </ol>
                </Paragraph>
            </div>
        </div>
    );
}

function BodyPre_7_0_0() {
    return (
        <div>
            <h3>What is a client?</h3>
            <div>
                <Paragraph>
                    A client is any component consuming the <Name />. A client consumes the context by:
                    <ul>
                        <li>either using the <Name /> <Anchor to="/api#usecontext">useContext</Anchor> hook</li>
                        <li>or embedding itself within the connector returned by the <Name /> <Anchor to="/api#connect">connect</Anchor> function</li>
                    </ul>
                </Paragraph>
                <Paragraph>
                    Please see examples respectively in:
                    <ol>
                        <li><Anchor to="/getting-started#usecontext-usage">Consuming <Name /> { '(' }hook with memo method{ ')' }</Anchor></li>
                        <li><Anchor to="/getting-started#connect-usage">Consuming <Name /> { '(' }hoc method{ ')' }</Anchor></li>
                    </ol>
                </Paragraph>
            </div>
        </div>
    );
}
