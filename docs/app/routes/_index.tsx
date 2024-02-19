import { Link } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/node';

import Anchor from '~/components/anchor';

export const meta: MetaFunction = () => [{
  title: 'eagleeyejs'
}, {
  content: 'Welcome to Eagle Eye context!',
  name: 'description'
}];

export default function Index() {
  return (
    <article>
      <h1>Welcome to Eagle Eye JS!</h1>
      <p>An intuitive reactive context based React state manager. </p>
      <div>
        <label>Official:{ ' ' }
          <Anchor
            href="https://www.npmjs.com/package/@webkrafters/react-observable-context"
            rel="noopener noreferrer"
            target="_blank"
          >
            React-Observable-Context
          </Anchor>
        </label>
      </div>
      <div>
        <label>NPM Install: <span>npm install --save @webkrafters/react-observable-context</span></label>
      </div>
      <div>
        <label>Play with a demo app here on:{ ' ' }
          <Anchor
            href="https://codesandbox.io/s/github/webKrafters/react-observable-context-app"
            rel="noopener noreferrer"
            target="_blank"
          >
            Code Sandbox
          </Anchor>
        </label>
      </div>
      <div>
        <label>License: <span>MIT</span></label>
      </div>
      <h2>Eagle Eye. Why now?</h2>
      <ul>
        <li> Auto-immutable update-friendly context. See <Link to="/concepts/store/setstate"><code>store.setState</code></Link>.</li>
        <li> A context bearing an observable consumer <Link to="/concepts/store">store</Link>.</li>
        <li> Recognizes <b>negative array indexing</b>. Please see <Link to="/concepts/property-path">Property Path</Link> and <code>store.setState</code> <Link to="/concepts/store/setstate/indexing">Indexing</Link>.</li>
        <li> Only re-renders subscribing components (<Link to="/concepts/client">clients</Link>) on context state changes.</li>
        <li> Subscribing component decides which context state properties' changes to trigger its update.</li>
      </ul>
      <div>May see features history at <Link to="/history/features">What's Changed?</Link></div>
    </article>
  );
};
