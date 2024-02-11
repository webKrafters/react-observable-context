import { Link } from '@remix-run/react';

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
                    <p><strong>Negative</strong> integer { '(' }<i>-N</i>{ ')' } in a property path indicates an array index derived at runtime by counting <pre>{ `abs(-N)` }</pre> steps backward from array length.</p>
                    <p>
                        <h3 id="property-path-example">Ex. Given the following object:</h3>
                        <pre>{ `{ a: { c: { e: 5, f: [ 0, 2, 4 ] } } }` }</pre>
                        The property path <pre>{ `a.c.e` }</pre> accesses the <pre>{ `e=5` }</pre> property.<br />
                        Either of the property paths <pre>{ `a.c.f.1` }</pre>, <pre>{ `a.c.f.-2` }</pre>, <pre>{ `a.c.f[1]` }</pre> and <pre>{ `a.c.f[-2]` }</pre> is a valid property path to access the <pre>{ `[1]=2` }</pre> property.<br />
                        A special property path <Link to="/concepts/property-path#fullstate-selectorkey">@@STATE</Link> may be used to access the full given object.<br />
                    </p>
                </div>
                <h3 id="fullstate-selectorkey">What is the @@STATE keyword?</h3>
                <div>
                    <strong>@@STATE</strong> is a special property path to access the full state object as a single slice.<br />
                    <WarningIcon /> <strong><i>Caution:</i></strong> When this property path exists in a <Link to="/concepts/selector-map">selector map</Link>, any change in the state object results in an update of its <Link to="/concepts/store"><pre>{ `store.data` }</pre></Link> and a subsequent render of its client{ '(' }s{ ')' }.
                </div>
            </div>
        </article>
    );
}