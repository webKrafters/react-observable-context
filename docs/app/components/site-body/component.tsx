import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { Outlet } from '@remix-run/react';


import SiteFaqs from '../site-faqs';
import SiteNav from '../site-nav';
import SiteTags from '../site-tags';

import './style.css';

declare interface BodyProps {
    children?: React.ReactNode,
    isSiderCollapsed?: boolean,
    onSiderVisibilityChange: ( isCollapsed: boolean ) => void
};

const Sider : React.ForwardRefExoticComponent<
    React.PropsWithoutRef<{ isCollapsible?: boolean }> &
    React.RefAttributes<Element>
> = forwardRef(({ isCollapsible = true }, ref ) => (
    <section
        className={ `site-body-sider${ isCollapsible ? '' : ' closed' }` }
        ref={ ref as React.LegacyRef<HTMLElement> }
    >
        <SiteNav />
    </section>
));

Sider.displayName = 'Site.Body.Sider';

const Component : React.FC<BodyProps> = ({ isSiderCollapsed = false, onSiderVisibilityChange }) => {
    const siderRef = useRef<Element>( null );
    const runToggleAuto = useCallback(() => onSiderVisibilityChange( window.innerWidth <= 991 ), [ onSiderVisibilityChange ]);
    useEffect( runToggleAuto, [] );
    useEffect(() => {
        let timer : NodeJS.Timeout | void;
        const collapseSider = () => {
            timer && clearTimeout( timer );
            timer = setTimeout(() => {
                runToggleAuto();
                timer = undefined;
            }, 500 );
        };
        window.addEventListener( 'resize', collapseSider );
        return () => window.removeEventListener( 'resize', collapseSider );
    }, [ onSiderVisibilityChange ]);
    return (
        <section className="site-body">
            <Sider isCollapsible={ !isSiderCollapsed } ref={ siderRef } />
            <main>
                <SiteTags />
                <Outlet />
            </main>
            <SiteFaqs />
        </section>
    );
};

Component.displayName = 'Site.Body';

export default Component;