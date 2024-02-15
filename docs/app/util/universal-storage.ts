import { clientOnly$, serverOnly$ } from 'vite-env-only';

import type { RootContext } from '~/root';

import jsCookie from 'js-cookie';
import { DARKMODE_LOCALSTORAGE_KEY } from '~/constants';

enum ENVIRONMENT {
    CLIENT = 'Client',
    SERVER = 'Server'
}

interface DualStorage<E extends ENVIRONMENT = ENVIRONMENT.SERVER> {
    getItem: E extends ENVIRONMENT.SERVER
        ? (key : string, rootContext? : RootContext) => string|void
        : (key : string) => string|void;
    removeItem: (key : string) => E extends ENVIRONMENT.SERVER ? never : void;
    setItem: <T = any>(key : string, value : T) => E extends ENVIRONMENT.SERVER ? never : void;
}

let storage : DualStorage<ENVIRONMENT>;

serverOnly$((() => {
    storage = {
        getItem: ( key : string, rootContext? : RootContext ) => (
            rootContext?.cookies?.[ DARKMODE_LOCALSTORAGE_KEY.toLowerCase() ] as string|void
        ),
        removeItem: ( key : string ) => {
            throw new Error( 'Cannot remove a serer response cookie from here.' );
        },
        setItem: <T = any>( key : string, value : T ) => {
             throw new Error( 'Cannot set a serer response cookie from here.' );   
        }
    }
})());

clientOnly$((() => {
    storage = {
        getItem: ( key : string ) => {
            let val = jsCookie.get( key ) as string;
            if( typeof val !== 'undefined' ) {
                window.localStorage && setTimeout(
                    () => window.localStorage.setItem( key , val ),
                    0
                );
                return val;
            }
            val = window?.localStorage?.getItem( key ) as string;
            if( typeof val === 'undefined' ) { return 'false' };
            setTimeout( () => jsCookie.set( key, val ), 0 );
            return val;
        },
        removeItem: ( key : string ) => {
            jsCookie.remove( key, { path: '/' } );
            window?.localStorage?.removeItem( key );
        },
        setItem: <T = any>( key : string, value : T ) => {
            const val = `${ value }`;
            jsCookie.set( key, val, { path: '/' } );
            window?.localStorage?.setItem( key, val );
        }
    }
})());

export default storage;