import { useState } from 'react';

import parseCookies from 'set-cookie-parser';

import { json } from '@remix-run/node';

import type { AppLoadContext, LoaderFunctionArgs, TypedResponse } from '@remix-run/node';

import { Links, Meta, Scripts, ScrollRestoration, useRouteLoaderData } from '@remix-run/react';

import { DARKMODE_LOCALSTORAGE_KEY } from './constants';

import storage from './util/universal-storage';

import IndexLayout from './layouts/index';

import './root.css';

export interface RootContext extends AppLoadContext {
  cookies: {[key: string]: string}
};

export const loader = async ({ context, request } : LoaderFunctionArgs ) => {
  context.cookies = parseCookies( request.headers.get( 'Cookie' ) as string )?.[ 0 ];
  return json( context ) as TypedResponse<RootContext>;
}

export const useLoaderData = () => useRouteLoaderData<typeof loader>( 'root' );

export default function App() {
  const context = useLoaderData();
  const [ isDarkMode, setDarkModeFlag ] = useState(() => {
    const f = storage.getItem( DARKMODE_LOCALSTORAGE_KEY, context );
    return typeof f === 'undefined' ? false : f === 'true';
  });
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
      <body className={ isDarkMode ? 'dark' : '' }>
        <IndexLayout
          defaultDarkModeSetting={ isDarkMode }
          onDarkModeChange={ setDarkModeFlag }
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
};
