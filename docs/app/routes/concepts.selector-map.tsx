import { Link } from '@remix-run/react';

export default function ConceptSelectorMap() {
    return (
        <article className="concept-selector-map">
            <h1>Selector Map</h1>
            <div>
                <h3>What is a Selector Map?</h3>
                <div>
                    A selector map is an object holding key:value pairs.<br />
                    <i><strong>An array of <Link to="/concepts/property-path">property paths</Link> is also acceptable:</strong> indexes serve as keys for this purpose.</i><br />
                    <ul>
                        <li><pre>{ `key` }</pre> refers to an arbitrary name to be assigned to a given property in the <Link to="/concepts/store"><pre>{ `store.data` }</pre></Link>.</li>
                        <li><pre>{ `value` }</pre> refers to the <Link to="/concepts/property-path">property path</Link> leading to a state slice whose value will be assigned to and observed by this <Link to="/concepts/store"><pre>{ `store.data` }</pre></Link> property.</li>
                        <li>A special '<Link to="/concepts/property-path#fullstate-selectorkey">@@STATE</Link>' value may be used to access and observe the full state object.</li>
                    </ul>
                </div>
                <div>
                    <h3 id="selector-map-example">Example:</h3>
                    <pre>
                        {
                        `// Given the following state object:
                        const state = {
                            a: 1, b: 2, c: 3, d: {
                                e: 5,
                                f: [ 6, {
                                    x: 7,
                                    y: 8,
                                    z: 9
                                } ]
                            }
                        };
                        
                        /* --------------------------------------------- */
                        /* a client observing the following selector map */
                        /* --------------------------------------------- */
                        const selectorMap = {
                            all: '@@STATE',
                            myData: 'd',
                            secondFElement: 'd.f[1]'
                        };
                        
                        // will receive the following store data
                        store.data = {
                            all: state,
                            myData: state.d,
                            secondFElement: state.d.f[1]
                        };
                        
                        /* --------------------------------------------------- */
                        /* a client observing the following property path list */
                        /* --------------------------------------------------- */
                        const propertyPaths = [ '@@STATE', 'd', 'd.f[1]' ];
                        
                        // will receive the following store data
                        store.data = {
                            0: state,
                            1: state.d,
                            2: state.d.f[1]
                        };`
                        }
                    </pre>
                </div>
            </div>
        </article>
    );
}
