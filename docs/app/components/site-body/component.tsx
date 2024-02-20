import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet } from '@remix-run/react';

import { clientOnly$ } from 'vite-env-only';

import hasHandheldWidth from '~/util/is-handheld-portrait';

import SiteFaqs from '../site-faqs';
import SiteNav from '../site-nav';
import SiteTags from '../site-tags';

import './style.css';

declare interface BodyProps {
    children?: React.ReactNode,
    isSiderCollapsed?: boolean,
    onSiderVisibilityChange: ( isCollapsed: boolean ) => void
};

interface TargetElement extends EventTarget { tagName: string }
type EventHandler = (this: HTMLElement, ev: MouseEvent) => any

const Sider : React.ForwardRefExoticComponent<
    React.PropsWithoutRef<{ isCollapsible?: boolean }> &
    React.RefAttributes<Element>
> = forwardRef(({ isCollapsible = true }, ref ) => {
    clientOnly$( useLayoutEffect(() => {
        ( ref as React.RefObject<HTMLElement> ).current?.classList[ isCollapsible ? 'remove' : 'add' ]( 'closed' );
    }, [ isCollapsible ]) );
    return (
        <section
            className={ `site-body-sider${ isCollapsible ? '' : ' closed' }` }
            ref={ ref as React.LegacyRef<HTMLElement> }
        >
            <SiteNav />
        </section>
    );
});

Sider.displayName = 'Site.Body.Sider';

const Component : React.FC<BodyProps> = ({ isSiderCollapsed, onSiderVisibilityChange }) => {
    const siderRef = useRef<Element>( null );
    const [ isHandheld, setHandheldFlag ] = useState<boolean>(() => isSiderCollapsed ?? hasHandheldWidth());
    useEffect(() => {
        let timer : NodeJS.Timeout | void;
        const collapseSider = () => {
            timer && clearTimeout( timer );
            timer = setTimeout(() => {
                setHandheldFlag( hasHandheldWidth );
                timer = undefined;
            }, 500 );
        };
        window.addEventListener( 'resize', collapseSider );
        return () => window.removeEventListener( 'resize', collapseSider );
    }, []);
    useEffect(() => onSiderVisibilityChange( isHandheld ), [ isHandheld ]);
    clientOnly$( useLayoutEffect(() => {
        if( !isHandheld ) { return }
        const notifyOnHandHeldNavigate : EventHandler = e => {
            ( e.currentTarget as TargetElement ).tagName === 'NAV' &&
            onSiderVisibilityChange( true )
        };
        const siteNav = siderRef.current?.querySelector( ':scope .site-nav' ) as HTMLElement;
        siteNav.addEventListener( 'click', notifyOnHandHeldNavigate );
        return () => siteNav.removeEventListener( 'click', notifyOnHandHeldNavigate );
    }, [ isHandheld, onSiderVisibilityChange ]) );
    return (
        <section className="site-body">
            <Sider isCollapsible={ !( isSiderCollapsed ?? isHandheld ) } ref={ siderRef } />
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