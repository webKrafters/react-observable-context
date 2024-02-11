import { Outlet } from '@remix-run/react';

import SiteNav from '../site-nav';

import './style.css';

declare interface BodyProps {
    children?: React.ReactNode,
    isSiderCollapsed?: boolean
};

const Sider : React.FC<{ isCollapsible?: boolean }> = ({ isCollapsible = true }) => (
    <section className={ `site-body-sider${ isCollapsible ? '' : ' closed' }` }>
        <SiteNav />
    </section>
);

Sider.displayName = 'Site.Body.Sider';

const Component : React.FC<BodyProps> = ({ isSiderCollapsed = false }) => (
    <section className="site-body">
        <Sider isCollapsible={ !isSiderCollapsed } />
        <main><Outlet /></main>
    </section>
);

Component.displayName = 'Site.Body';

export default Component;