import { useState, useCallback } from 'react';

import { Links, Meta, Scripts, ScrollRestoration } from '@remix-run/react';

import { DARKMODE_LOCALSTORAGE_KEY } from './constants';

import IndexLayout from './layouts/index';

import './root.css';

export default function App() {
  let [ _isDarkMode ] = useState<boolean>();
  const [ classProps, setClassProps ] = useState(() => {
    _isDarkMode = typeof window !== 'undefined'
      ? localStorage?.getItem( DARKMODE_LOCALSTORAGE_KEY ) === 'true'
      : false;
    return _isDarkMode ? { className: 'dark' } : {};
  });
  const updateDmClass = useCallback(( isDarkMode: boolean ) => {
    _isDarkMode = isDarkMode;
    setClassProps( p => isDarkMode
      ? `className` in p ? p : { className: 'dark' }
      : `className` in p ? {} : p
    )
  }, []);
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
      <body { ...classProps }>
        <IndexLayout defaultDarkModeSetting={ _isDarkMode } onDarkModeChange={ updateDmClass } />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};
