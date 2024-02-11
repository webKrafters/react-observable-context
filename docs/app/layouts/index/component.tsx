import { useCallback, useState } from 'react';
import SiteBody from '~/components/site-body';
import SiteFooting from '~/components/site-footing';
import SiteHeading from '~/components/site-heading';

import './style.css';

const Layout : React.FC = () => {
  const [ isSiderCollapsed, setCollapsedSiderFlag ] = useState( false );
  const toggleSiderSwitch = useCallback(() => setCollapsedSiderFlag( f => !f ), []);
  return (
    <div className="index-layout">
      <SiteHeading
        isSiderCollapsed={ isSiderCollapsed }
        onToggleSider={ toggleSiderSwitch }
      />
      <SiteBody { ...{ isSiderCollapsed } } />
      <SiteFooting />
    </div>
  );
};

export default Layout;