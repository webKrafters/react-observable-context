import { useMemo } from 'react';

import { Link } from '@remix-run/react';

import { clientOnly$, serverOnly$ } from 'vite-env-only';

import CloseOutlined from '@ant-design/icons/CloseOutlined';
import MenuOutlined from '@ant-design/icons/MenuOutlined';

import Anchor from '../anchor';

import DarkModeSetting from '../dark-mode-settings';
import type { Props as DKMProps } from '../dark-mode-settings';

import SiteTags from '../site-tags';

import { Button } from 'antd';

import './style.css';

let CloseOutlinedIcon : typeof CloseOutlined;
let MenuOutlinedIcon : typeof MenuOutlined;

clientOnly$((() => {
  CloseOutlinedIcon = CloseOutlined;
  MenuOutlinedIcon = MenuOutlined;
})());

serverOnly$((() => {
  CloseOutlinedIcon = ( CloseOutlined as any ).default;
  MenuOutlinedIcon = ( MenuOutlined as any ).default;
})());

interface Props {
  defaultDarkModeSetting?: DKMProps["defaultValue"],   
  isSiderCollapsed?: boolean,
  onToggleSider?: VoidFunction,
  onDarkModeChange?: DKMProps["onChange"]
};

const Component : React.FC<Props> = ({
  defaultDarkModeSetting,
  isSiderCollapsed,
  onToggleSider,
  onDarkModeChange
}) => {
  const siderSwitchProps = useMemo(() => {
    const props: {
      className: string,
      icon: React.ReactNode,
      onClick?: Props[ "onToggleSider" ]
    } = {
      className: 'sider-toggle-btn',
      icon: isSiderCollapsed ? ( <MenuOutlinedIcon /> ) : ( <CloseOutlinedIcon /> )
    };
    if( onToggleSider ) { props.onClick = onToggleSider }
    return props;
  }, [ isSiderCollapsed, onToggleSider ]);

  return (
    <header className="site-heading">
      <Button { ...siderSwitchProps } />
      <div className="branding">
        <Link className="logo-link" to="/">
          <img alt="Logo" className="logo" src="/img/logo.png" />
        </Link>
        <div className="text">
          <span className="brand">
            <Anchor
              hideIcon
              href="https://github.com/webKrafters/eagleeye"
              rel="noopener noreferrer"
              target="_blank"
            >
              Eagle Eye
            </Anchor>
          </span>
          <span className="name">
            <Anchor
              hideIcon
              href="https://www.npmjs.com/package/@webkrafters/react-observable-context"
              rel="noopener noreferrer"
              target="_blank"
            >
              React-Observable-Context
            </Anchor>
          </span>
        </div>
      </div>
      <SiteTags />
      <DarkModeSetting
        defaultValue={ defaultDarkModeSetting }
        onChange={ onDarkModeChange }
      />
    </header>
  );
};

Component.displayName = 'Site.Heading';

export default Component;