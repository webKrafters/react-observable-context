import { forwardRef, useEffect, useRef } from 'react';
import { Outlet } from '@remix-run/react';

import SiteTags from '../site-tags';
import SiteNav from '../site-nav';

import './style.css';

interface ElementWithCSS extends Element { css: { display: string } }

declare interface BodyProps {
    children?: React.ReactNode,
    isSiderCollapsed?: boolean,
    onSiderVisibilityChange: ( isCollapsed: boolean ) => void
};

const Sider : React.ForwardRefExoticComponent<
    React.PropsWithoutRef<{ isCollapsible?: boolean }> &
    React.RefAttributes<ElementWithCSS>
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
    const siderRef = useRef<ElementWithCSS>( null );
    useEffect(() => {
        let timer : NodeJS.Timeout | void;
        const collapseSider = () => {
            timer && clearTimeout( timer );
            timer = setTimeout(() => {
                onSiderVisibilityChange?.( siderRef.current?.css?.display === 'none' );
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
        </section>
    );
};

Component.displayName = 'Site.Body';

export default Component;