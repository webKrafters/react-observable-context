import { useRef, useState, useLayoutEffect } from 'react';

import { Links, Meta, Scripts, ScrollRestoration } from '@remix-run/react';

import { DARKMODE_LOCALSTORAGE_KEY } from './constants';

import IndexLayout from './layouts/index';

import './root.css';

export default function App() {
  const bodyRef = useRef<Element>();
  const [ isDarkMode, setDarkModeFlag ] = useState(() => (
    typeof window === 'undefined' ? false : (
      window.localStorage?.getItem( DARKMODE_LOCALSTORAGE_KEY ) === 'true'
    )
  ));
  useLayoutEffect(() => { bodyRef.current?.classList?.[ isDarkMode ? 'add' : 'remove' ]( 'dark' ) }, [ isDarkMode ]);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#1890ff"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16"/>
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32"/>
        <link rel="icon" href="/favicon-192x192.png" sizes="192x192"/>
        <Meta />
        <Links />
      </head>
      <body ref={ bodyRef as React.LegacyRef<HTMLBodyElement> }>
        <IndexLayout defaultDarkModeSetting={ isDarkMode } onDarkModeChange={ setDarkModeFlag } />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};
