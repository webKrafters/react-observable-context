import { useMemo } from 'react';

import { CloseSquareOutlined, MenuOutlined } from '@ant-design/icons';

import { Button } from 'antd';

import './style.css';

interface Props {
  isSiderCollapsed?: boolean,
  onToggleSider?: VoidFunction
};

const Component : React.FC<Props> = ({ isSiderCollapsed, onToggleSider }) => {
  const siderSwitchProps = useMemo(() => {
    const props: {
      className: string,
      icon: JSX.Element,
      onClick?: Props[ "onToggleSider" ]
    } = {
      className: 'sider-toggle-btn',
      icon: isSiderCollapsed ? ( <MenuOutlined /> ) : ( <CloseSquareOutlined /> )
    };
    if( onToggleSider ) { props.onClick = onToggleSider }
    return props;
  }, [ isSiderCollapsed, onToggleSider ]);
  return (
    <header className="site-heading">
      <Button { ...siderSwitchProps } />
      <div>
        <img alt="Logo" src="assets/img/logo.png" />
        <span className="brand">Eagle Eye</span>
        <span className="name">React-Observable-Context</span>
      </div>
      <div>
        <a href="https://typescriptlang.org" target="_blank" rel="noopener noreferrer">
          <img alt="TypeScript" src="https://badgen.net/badge/icon/typescript?icon=typescript&label" />
        </a>
        <a href="https://github.com/webKrafters/react-observable-context/actions" target="_blank" rel="noopener noreferrer">
          <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/webKrafters/react-observable-context/test.yml" />
        </a>
        <a href="https://coveralls.io/github/webKrafters/react-observable-context" target="_blank" rel="noopener noreferrer">
          <img alt="coverage" src="https://img.shields.io/coveralls/github/webKrafters/react-observable-context" />
        </a>
        <img alt="NPM" src="https://img.shields.io/npm/l/@webkrafters/react-observable-context" />
        <img alt="Maintenance" src="https://img.shields.io/maintenance/yes/2032" />
        <img alt="build size" src="https://img.shields.io/bundlephobia/minzip/@webkrafters/react-observable-context?label=bundle%20size" />
        <a href="https://www.npmjs.com/package/@webKrafters/react-observable-context" target="_blank" rel="noopener noreferrer">
          <img alt="Downloads" src="https://img.shields.io/npm/dt/@webkrafters/react-observable-context.svg" />
        </a>
        <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/webKrafters/react-observable-context" />
      </div>
    </header>
  );
};

Component.displayName = 'Site.Heading';

export default Component;