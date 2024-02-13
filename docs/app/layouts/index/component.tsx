import { useCallback, useState } from 'react';

import SiteBody from '~/components/site-body';
import SiteFooting from '~/components/site-footing';
import SiteHeading from '~/components/site-heading';

import './style.css';

const Layout : React.FC<{
  defaultDarkModeSetting?: boolean,
  onDarkModeChange?: (isDarkMode: boolean) => void
}> = ({ defaultDarkModeSetting, onDarkModeChange }) => {
  const [ isSiderCollapsed, setCollapsedSiderFlag ] = useState( false );
  const toggleSiderSwitch = useCallback(() => setCollapsedSiderFlag( f => !f ), []);
  return (
    <div className="index-layout">
      <SiteHeading
        defaultDarkModeSetting={ defaultDarkModeSetting }
        isSiderCollapsed={ isSiderCollapsed }
        onToggleSider={ toggleSiderSwitch }
        onDarkModeChange={ onDarkModeChange }
      />
      <SiteBody { ...{ isSiderCollapsed, onSiderVisibilityChange: setCollapsedSiderFlag  } } />
      <SiteFooting />
    </div>
  );
};

export default Layout;