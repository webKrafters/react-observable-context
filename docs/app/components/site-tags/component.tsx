
import Anchor from '../anchor';

import './style.css';

const Component : React.FC = () => (
    <section className="site-tags">
        <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/webKrafters/react-observable-context" />
        <Anchor
            href="https://typescriptlang.org"
            rel="noopener noreferrer"
            target="_blank"
        >
            <img alt="TypeScript" src="https://badgen.net/badge/icon/typescript?icon=typescript&label" />
        </Anchor>
        <img alt="NPM" src="https://img.shields.io/npm/l/@webkrafters/react-observable-context" />
    </section>
)

export default Component;