import { Link } from '@remix-run/react';

import CodeBlock from '../components/code-block';

import WarningIcon from '~/components/icons/warning/components';

export default function ConceptPropertyPath() {
    return (
        <article className="concept-property-path">
            <h1>Property Path</h1>
            <div>
                <h3>What is a Property Path?</h3>
                <div>
                    <p>
                        A property path is a dot-notation string leading to a specific property within an object.<br />
                        The Eagle Eye context recognizes any property path abiding by the <strong><i><u>Lodash</u></i></strong> property path specifications. Such property paths may also contain negative integers.
                    </p>
                    <p><strong>Negative</strong> integer { '(' }<i>-N</i>{ ')' } in a property path indicates an array index derived at runtime by counting <code>abs(-N)</code> steps backward from array length.</p>
                    <p>
                        <h3 id="property-path-example">Ex. Given the following object:</h3>
                        <CodeBlock>{ '{ a: { c: { e: 5, f: [ 0, 2, 4 ] } } }' }</CodeBlock>
                        The property path<code>a.c.e</code> accesses the <code>e=5</code> property.<br />
                        Either of the property paths <code>a.c.f.1</code>, <code>a.c.f.-2</code>, <code>a.c.f[1]</code> and <code>a.c.f[-2]</code> is a valid property path to access the <code>[1]=2</code> property.<br />
                        A special property path <Link to="/concepts/property-path#fullstate-selectorkey">@@STATE</Link> may be used to access the full given object.<br />
                    </p>
                </div>
                <h3 id="fullstate-selectorkey">What is the @@STATE keyword?</h3>
                <div>
                    <strong>@@STATE</strong> is a special property path to access the full state object as a single slice.<br />
                    <WarningIcon /> <strong><i>Caution:</i></strong> When this property path exists in a <Link to="/concepts/selector-map">selector map</Link>, any change in the state object results in an update of its <Link to="/concepts/store"><code>store.data</code></Link> and a subsequent render of its client{ '(' }s{ ')' }.
                </div>
            </div>
        </article>
    );
}