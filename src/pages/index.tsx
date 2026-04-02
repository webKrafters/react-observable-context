import type { HeadFC } from 'gatsby';

import type { PageProps } from '../contexts/page';

import React from 'react';

import { graphql } from 'gatsby';

import Anchor from '../partials/anchor';
import CodeBlock from '../partials/code-block';
import License from '../partials/license-link';
import Name from '../partials/name';
import Paragraph from '../partials/paragraph';

import '../partials/contents/index-page/style.scss';

export type Props = PageProps<{
	site : {
		siteMetadata : {
			url : {
				demo : string,
				npm : string
			}
		}
	}
}>;

const IndexPage : React.FC<Props> = ({ className, data }) => {
	return (
		<article className={ `index-page ${ className }` }>
			<h1>Welcome to <Name /> JS!</h1>
			<Paragraph>An intuitive reactive context based React state manager. No provider component required. Create once: use everywhere both in and out of the React component tree system.</Paragraph>
			<Paragraph>Supports for framework-agnostic state sharing among applications OOB. Simply create an <Anchor to="https://auto-immutable.js.org/intro/">Auto Immutable</Anchor> instance to pass around as the <code>value</code> argument for this or any <Anchor to="https://eagleeye.js.org">Eagle Eye</Anchor> based state manager instances.</Paragraph>
			<Paragraph>
				<label>
					<b>Official:{ ' ' }</b>
					<Anchor to={ data?.site.siteMetadata.url.npm as string }>
						<Name />
					</Anchor>
				</label>
			</Paragraph>
			<Paragraph className="installation">
				<header>Installation:</header>
				<label>
					<b>Main:</b>
					<CodeBlock isInline>
						npm install --save @webkrafters/react-observable-context
					</CodeBlock>
				</label>
				<label>
					<b>Defunct:</b>
					{/* <b>Alternate:</b> */}
					<CodeBlock isInline>
						npm install --save react-eagleeye
					</CodeBlock>
				</label>
			</Paragraph>
			<Paragraph>
				<label>
					<b>Play with a demo app here on:{ ' ' }</b>
					<Anchor to={ data?.site.siteMetadata.url.demo as string }>
						Code Sandbox
					</Anchor>
				</label>
			</Paragraph>
			<Paragraph>
				<label>
					<b>License:{ ' ' }</b>
					<License />
				</label>
			</Paragraph>
			<h2><Name />. Why now?</h2>
			<ul>
				<li>Auto-immutable update-friendly context. See <Anchor to="/concepts/store/setstate"><code>store.setState</code></Anchor>.</li>
				<li>A context bearing an observable consumer <Anchor to="/concepts/store">store</Anchor>.</li>
				<li>Recognizes <strong>negative array indexing</strong>. Please see <Anchor to="/concepts/property-path">Property Path</Anchor> and <code>store.setState</code> <Anchor to="/concepts/store/setstate#indexing">Indexing</Anchor>.</li>
				<li>Only re-renders subscribing components (<Anchor to="/concepts/client">clients</Anchor>) on context state changes.</li>
				<li>Subscribing component decides which context state properties' changes to trigger its update.</li>
			</ul>
			<div>May see features history at <Anchor to="/history/features">What's Changed?</Anchor></div>
		</article>
	);
}

export default IndexPage;

export const query = graphql`
    query IntroTitle {
        site {
            siteMetadata {
                url {
					demo
					npm
				}
            }
        }
    }
`;

export const Head : HeadFC = () => (
	<meta
		content="Welcome to React Observable Context!"
		name="description"
	/>
);
