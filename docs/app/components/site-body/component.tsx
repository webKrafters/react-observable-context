import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet } from '@remix-run/react';

import { clientOnly$, serverOnly$ } from 'vite-env-only';


import SiteFaqs from '../site-faqs';
import SiteNav from '../site-nav';
import SiteTags from '../site-tags';

import './style.css';

declare interface BodyProps {
    children?: React.ReactNode,
    isSiderCollapsed?: boolean,
    onSiderVisibilityChange: ( isCollapsed: boolean ) => void
};

interface TargetElement extends EventTarget {
    tagName: string
}
type EventHandler = (this: HTMLElement, ev: MouseEvent) => any

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

const BREAKPOINT = 991;

const Component : React.FC<BodyProps> = ({ isSiderCollapsed = false, onSiderVisibilityChange }) => {
    const siderRef = useRef<Element>( null );
    const [ isHandheld, setHandheldFlag ] = (
        clientOnly$( useState<boolean>( () => window.innerWidth <= BREAKPOINT ) ) ??
        serverOnly$( useState<boolean>( false ) )
    ) as [boolean, React.Dispatch<React.SetStateAction<boolean>>];
    useEffect(() => {
        let timer : NodeJS.Timeout | void;
        const collapseSider = () => {
            timer && clearTimeout( timer );
            timer = setTimeout(() => {
                setHandheldFlag( window.innerWidth <= BREAKPOINT );
                timer = undefined;
            }, 500 );
        };
        window.addEventListener( 'resize', collapseSider );
        return () => window.removeEventListener( 'resize', collapseSider );
    }, []);
    useEffect(() => onSiderVisibilityChange( isHandheld ), [ isHandheld ]);
    clientOnly$(
        useLayoutEffect(() => {
            if( !isHandheld ) { return }
            const notifyOnHandHeldNavigate : EventHandler = e => {
                ( e.currentTarget as TargetElement ).tagName === 'NAV' &&
                onSiderVisibilityChange( true )
            };
            const siteNav = siderRef.current?.querySelector( ':scope .site-nav' ) as HTMLElement;
            siteNav.addEventListener( 'click', notifyOnHandHeldNavigate );
            return () => siteNav.removeEventListener( 'click', notifyOnHandHeldNavigate );
        }, [ isHandheld, onSiderVisibilityChange ])
    );
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