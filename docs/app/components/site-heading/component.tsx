import { useMemo } from 'react';

import { Link } from '@remix-run/react';

import { clientOnly$, serverOnly$ } from 'vite-env-only';

import CloseOutlined from '@ant-design/icons/CloseOutlined';
import MenuOutlined from '@ant-design/icons/MenuOutlined';

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
  isSiderCollapsed?: boolean,
  onToggleSider?: VoidFunction
};

const Component : React.FC<Props> = ({ isSiderCollapsed, onToggleSider }) => {
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
          <span className="brand"><a href="https://github.com/webKrafters/eagleeye" target="_blank" rel="noopener noreferrer">Eagle Eye</a></span>
          <span className="name"><a href="https://www.npmjs.com/package/@webkrafters/react-observable-context" target="_blank" rel="noopener noreferrer">React-Observable-Context</a></span>
        </div>
      </div>
      <SiteTags />
    </header>
  );
};

Component.displayName = 'Site.Heading';

export default Component;