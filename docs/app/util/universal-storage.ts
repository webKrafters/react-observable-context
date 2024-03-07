import {
    getClientStorage,
    getServerStorage
} from 'universal-storage';

import {
    clientOnly$,
    serverOnly$
} from 'vite-env-only';

import type { RootContext } from '~/root';

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

clientOnly$((() => { storage = getClientStorage().current })());

serverOnly$((() => {
    const serverStorage = getServerStorage();
    storage = {
        getItem: ( key : string, rootContext? : RootContext ) => (
            serverStorage.current.getItem( key.toLowerCase(), rootContext )
        ),
        removeItem: ( key : string ) => {
            throw new Error( 'Cannot remove a serer response cookie from here.' );
        },
        setItem: <T = any>( key : string, value : T ) => {
            throw new Error( 'Cannot set a serer response cookie from here.' );   
        }
    }
})());

export default storage;