import { NavLink } from '@remix-run/react';

import Anchor from '../anchor';

import './style.css';

const Component : React.FC = () => (
    <nav className="site-faqs">
        <NavLink to="/getting-started">Installation</NavLink>
        <NavLink to="/external-access">Can I observe this state externally?</NavLink>
        <NavLink to="/concepts/store/setstate">Is true that the state can never be mutated?</NavLink>
		<NavLink to="/concepts/selector-map">How to observe state.</NavLink>
        <NavLink to="/concepts/property-path#fullstate-selectorkey">About the <strong><code>@@STATE</code></strong> keyword.</NavLink>
        <NavLink to="/concepts/store/setstate#indexing">Can I use negative array indexing?</NavLink>
		<NavLink to="/getting-started#connect-usage">How to read state with <strong>hoc</strong>.</NavLink>
        <NavLink to="/getting-started#usecontext-usage">How to read state with <strong>hook</strong>.</NavLink>
        <NavLink to="/concepts/store/setstate">How to set state.</NavLink>
		<NavLink to="/concepts/store/setstate">Why not use the spread operator for incoming state?</NavLink>
		<NavLink to="/concepts/store/setstate#indexing">How do I update my array exactly at a specific index?</NavLink>
        <NavLink to="/concepts/store/setstate/tags">What is the use of <strong>setstate @@ tags</strong>?</NavLink>
        <NavLink to="/concepts/store/setstate#batched-update">How to set multiple states sequentially.</NavLink>
    </nav>
);

export default Component;