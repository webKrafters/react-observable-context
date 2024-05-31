import type { PropertyInfo, Transform } from '@webkrafters/data-distillery';
import type { Connection, UpdatePayload } from '@webkrafters/auto-immutable';

import type {
	Changes,
	IStorage,
	Listener,
	PartialState,
	Prehooks,
	State,
	StoreInternal
} from '../../..';

import { useCallback, useEffect, useRef, useState } from 'react';

import isBoolean from 'lodash.isboolean';
import isEmpty from 'lodash.isempty';

import mapPathsToObject from '@webkrafters/data-distillery';
import stringToDotPath from '@webkrafters/path-dotize';
import AutoImmutable from '@webkrafters/auto-immutable';

import {
	CLEAR_TAG,
	DELETE_TAG,
	FULL_STATE_SELECTOR,
	GLOBAL_SELECTOR,
	REPLACE_TAG
} from '../../../constants';

import Storage from '../../../model/storage';

import usePrehooksRef from '../use-prehooks-ref';

let iCount = -1;
const createStorageKey = () => `${ ++iCount }:${ Date.now() }:${ Math.random() }`;
// to facilitate testing
export const deps = { createStorageKey };

interface CurrentStorage<T extends State> extends IStorage<T> { isKeyRequired? : boolean }

function runPrehook <T extends State>( prehooks : Prehooks<T>, name : "resetState", args : [
	PartialState<T>, {
		current : T;
		original : T;
	}
] ) : boolean; 
function runPrehook <T extends State>( prehooks : Prehooks<T>, name : "setState", args : [ Changes<T>] ) : boolean; 
function runPrehook <T extends State>( prehooks, name, args ) : boolean {
	if( !( name in prehooks ) ) { return true }
	const res = prehooks[ name ]( ...args );
	if( !isBoolean( res ) ) {
		throw new TypeError( `\`${ name }\` prehook must return a boolean value.` );
	}
	return res;
}

/** @param storage - is Closed to modification post-initialization */
const useStore = <T extends State>(
	prehooks : Prehooks<T>,
	value : PartialState<T>,
	storage? : CurrentStorage<T>
) => {

	const mounted = useRef( false );

	const prehooksRef = usePrehooksRef( prehooks );

	const storageKey = useRef<string>();

	const [[ cache, ownConnection ]] = useState<[
		AutoImmutable<Partial<T>>,
		Connection<T>
	]>(() => {
		const cache = new AutoImmutable( value );
		return [ cache, cache.connect() ];
	});

	const [ listeners ] = useState<Set<Listener>>(() => new Set());

	const [ _storage ] = useState<CurrentStorage<T>>(() => {
		let isKeyRequired = true;
		let _storage = storage;
		if( !storage ) {
			_storage = new Storage();
			isKeyRequired = _storage.isKeyRequired;
		}
		storageKey.current = isKeyRequired
			? deps.createStorageKey()
			: null
		return _storage;
	});

	const onChange : Listener = changes => listeners.forEach( listener => listener( changes ) );

	const resetState = useCallback<StoreInternal<T>["resetState"]>((
		connection : Connection<T>,
		propertyPaths : string[] = []
	) => {
		const original = _storage.clone( _storage.getItem( storageKey.current ) );
		let resetData;
		if( !propertyPaths.length ) {
			resetData = {};
		} else if( propertyPaths.includes( FULL_STATE_SELECTOR ) ) {
			resetData = isEmpty( original ) ? CLEAR_TAG : { [ REPLACE_TAG ]: original };
		} else {
			const visitedPathMap = {};
			const transformer = ({ trail, value } : PropertyInfo ) => {
				visitedPathMap[ trail.join( '.' ) ] = null;
				return { [ REPLACE_TAG ]: value };
			} 
			resetData = mapPathsToObject( original, propertyPaths, transformer as Transform );
			if( Object.keys( visitedPathMap ).length < propertyPaths.length ) {
				for( let path of propertyPaths ) {
					path = stringToDotPath( path );
					if( path in visitedPathMap ) { continue }
					let trail = path.split( '.' );
					const keyTuple = trail.slice( -1 );
					trail = trail.slice( 0, -1 );
					let node = resetData;
					for( const t of trail ) {
						if( isEmpty( node[ t ] ) ) {
							node[ t ] = {};
						}
						node = node[ t ];
					}
					if( DELETE_TAG in node ) {
						node[ DELETE_TAG ].push( ...keyTuple );
					} else {
						node[ DELETE_TAG ] = keyTuple;
					}
				}
			}
		}
		runPrehook( prehooksRef.current, 'resetState', [
			resetData, {
				current: connection.get( GLOBAL_SELECTOR )[ GLOBAL_SELECTOR ],
				original
			}
		] ) && connection.set( resetData, onChange );
	}, []);

	function transformPayload ( payload : UpdatePayload<T> ) {
		if( isEmpty( payload ) || !( FULL_STATE_SELECTOR in payload ) ) { return payload }
		payload = { ...payload, [ GLOBAL_SELECTOR ]: payload[ FULL_STATE_SELECTOR ] };
		delete payload[ FULL_STATE_SELECTOR ];
		return payload;
	}

	const setState = useCallback<StoreInternal<T>["setState"]>((
		connection : Connection<T>,
		changes : Changes<T>
	) => {
		if( !runPrehook( prehooksRef.current, 'setState', [ changes ] ) ) { return }
		if( !Array.isArray( changes ) ) {
			return connection.set( transformPayload( changes ), onChange );
		}
		changes = changes.slice();
		for( let c = changes.length; c--; ) {
			changes[ c ] = transformPayload( changes[ c ] );
		}
		connection.set( changes, onChange );
	}, []);

	const subscribe = useCallback<StoreInternal<T>["subscribe"]>(( listener : Listener ) => {
		listeners.add( listener );
		return () => listeners.delete( listener );
	}, []);

	useEffect(() => {
		const sKey = storageKey.current;
		_storage.setItem( sKey, _storage.clone( value as T ) );
		return () => _storage.removeItem( sKey );
	}, []);

	useEffect(() => {
		if( !mounted.current ) {
			mounted.current = true;
			return;
		}
		setState( ownConnection, value as T );
	}, [ value ]);

	useEffect(() => () => {
		ownConnection.disconnect();
		cache.close();
		listeners.clear();
	}, []);

	return useState<StoreInternal<T>>(() => ({ cache, resetState, setState, subscribe }))[ 0 ];
};

export default useStore;
