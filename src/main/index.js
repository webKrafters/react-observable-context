import React, {
	Children,
	cloneElement,
	createContext as _createContext,
	forwardRef,
	memo,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef
} from 'react';

import isEmpty from 'lodash.isempty';
import isEqual from 'lodash.isequal';
import isPlainObject from 'lodash.isplainobject';
import omit from 'lodash.omit';

import { v4 as uuid } from 'uuid';

import * as constants from '../constants';

import { clonedeep } from '../utils';

import useRenderKeyProvider from './hooks/use-render-key-provider';

import useStore from './hooks/use-store';

/**
 * @returns {ObservableContext<T>} Refers to the IObservableContext<T> type of the ObservableContext<T>
 * @template {State} T
 * @see {ObservableContext<T>}
 */
export const createContext = () => {
	const Context = _createContext({
		getState: reportNonReactUsage,
		resetState: reportNonReactUsage,
		setState: reportNonReactUsage,
		subscribe: reportNonReactUsage
	});
	const provider = Context.Provider;
	Context.Provider = makeObservable( provider );
	return Context;
};

/**
 * Actively monitors the store and triggers component re-render if any of the watched keys in the state objects changes
 *
 * @param {ObservableContext<T>} context Refers to the PublicObservableContext<T> type of the ObservableContext<T>
 * @param {SelectorMap<T>} [selectorMap = {}] Key:value pairs where `key` => arbitrary key given to a Store.data property holding a state slice and `value` => property path to a state slice used by this component: see examples below. May add a mapping for a certain arbitrary key='state' and value='@@STATE' to indicate a desire to obtain the entire state object and assign to a `state` property of Store.data. A change in any of the referenced properties results in this component render. When using '@@STATE', note that any change within the state object will result in this component render.
 * @returns {Store<T>}
 * @template {State} T
 * @see {ObservableContext<T>}
 * @example
 * a valid property path follows the `lodash` object property path convention.
 * for a state = { a: 1, b: 2, c: 3, d: { e: 5, f: [6, { x: 7, y: 8, z: 9 } ] } }
 * Any of the following is an applicable selector map.
 * {myData: 'd', count: 'a'} => {
 * 		myData: { e: 5, f: [6, { x: 7, y: 8, z: 9 } ] },
 * 		count: 1
 * }
 * {count: 'a'} => {count: 1} // same applies to {count: 'b'} = {count: 2}; {count: 'c'} = {count: 3}
 * {myData: 'd'} => {mydata: { e: 5, f: [6, { x: 7, y: 8, z: 9 } ] }}
 * {xyz: 'd.e'} => {xyz: 5}
 * {def: 'd.e.f'} => {def: [6, { x: 7, y: 8, z: 9 } ]}
 * {f1: 'd.e.f[0]'} or {f1: 'd.e.f.0'} => {f1: 6}
 * {secondFElement: 'd.e.f[1]'} or {secondFElement: 'd.e.f.1'} => {secondFElement: { x: 7, y: 8, z: 9 }}
 * {myX: 'd.e.f[1].x'} or {myX: 'd.e.f.1.x'} => {myX: 7} // same applies to {myY: 'd.e.f[1].y'} = {myY: 8}; {myZ: 'd.e.f[1].z'} = {myZ: 9}
 * {myData: '@@STATE'} => {myData: state}
 */
export const useContext = ( context, selectorMap = {} ) => {

	/** @type {StoreInternal<T>} */
	const {
		getState,
		resetState: _resetState,
		subscribe,
		unlinkCache,
		setState
	} = React.useContext( context );

	const [ clientId ] = React.useState( uuid );

	const _renderKeys = useRenderKeyProvider( selectorMap );

	/** @type {{[propertyPath: string]: string}} Reverses selectorMap i.e. {selectorKey: propertyPath} => {propertyPath: selectorKey} */
	const selectorMapInverse = useMemo(() => {
		const map = {};
		if( isEmpty( _renderKeys ) ) { return map };
		for( const selectorKey in selectorMap ) {
			map[ selectorMap[ selectorKey ] ] = selectorKey;
		}
		return map;
	}, [ _renderKeys ]);

	/** @type {[Data, Function]} */
	const [ data, setData ] = React.useState(() => {
		const data = {};
		if( isEmpty( _renderKeys ) ) { return data }
		const state = getState( clientId, ..._renderKeys );
		for( const path of _renderKeys ) {
			data[ selectorMapInverse[ path ] ] = state[ path ];
		}
		return data;
	});

	const updateData = () => {
		let hasChanges = false;
		const state = getState( clientId, ..._renderKeys );
		for( const path of _renderKeys ) {
			if( data[ selectorMapInverse[ path ] ] !== state[ path ] ) {
				data[ selectorMapInverse[ path ] ] = state[ path ];
				hasChanges = true;
			}
		}
		hasChanges && setData({ ...data });
	};

	/**
	 * @type {Store<T>["resetState"]}
	 * @template {State} T
	 */
	const resetState = useCallback(( propertyPath = _renderKeys ) => _resetState( propertyPath ), []);

	React.useEffect(() => { // sync data states with new renderKeys
		if( isEmpty( _renderKeys ) ) {
			!isEqual( {}, data ) && setData( {} );
			return;
		}
		for( const selectorKey in data ) {
			if( !( selectorMap[ selectorKey ] in selectorMapInverse ) ) {
				delete data[ selectorKey ];
			}
		}
		const unsubscribe = subscribe( updateData );
		updateData();
		return () => {
			unsubscribe();
			unlinkCache( clientId );
		};
	}, [ _renderKeys ]);

	return useMemo(() => ({ data, resetState, setState }), [ data ]);
};

/**
 * @param {ObservableContext<T>} context Refers to the PublicObservableContext<T> type of the ObservableContext<T>
 * @param {SelectorMap<T>} [selectorMap] Key:value pairs where `key` => arbitrary key given to a Store.data property holding a state slice and `value` => property path to a state slice used by this component: see examples below. May add a mapping for a certain arbitrary key='state' and value='@@STATE' to indicate a desire to obtain the entire state object and assign to a `state` property of Store.data. A change in any of the referenced properties results in this component render. When using '@@STATE', note that any change within the state object will result in this component render.
 * @returns {(WrappedComponent: C) => MemoExoticComponent<P>}
 * @template {State} T
 * @template {PartialStore<T> & {[x:string]:*}} [P=PartialStore<T>]
 * @template {ComponentType<P>|ExoticComponent<P>} C
 * @see {ObservableContext<T>}
 * @see {useContext} for selectorMap sample
 */
export const connect = ( context, selectorMap ) => WrappedComponent => {
	if( !( isPlainObject( WrappedComponent ) && 'compare' in WrappedComponent ) ) {
		WrappedComponent = memo( WrappedComponent );
	}
	const ConnectedComponent = memo( ownProps => {
		const store = useContext( context, selectorMap );
		return( <WrappedComponent { ...store } { ...ownProps } /> );
	} );
	ConnectedComponent.displayName = 'ObservableContext.Connected';
	return ConnectedComponent;
};

/** @example changes = { property: CLEAR_TAG } */
export const CLEAR_TAG = constants.CLEAR_TAG;

/**
 * @example
 * changes = {
 * 	property: {
 * 		[DELETE_TAG]: [keys/indexes to remove from property]
 * 	}
 * }
 */
export const DELETE_TAG = constants.DELETE_TAG;

export const FULL_STATE_SELECTOR = constants.FULL_STATE_SELECTOR;

/**
 * @example
 * changes = {
 * 	arrayProperty: {
 * 		[MOVE_TAG]: [-/+fromIndex, -/+toIndex, +numItems?] // numItems = 1 by default
 * 	}
 * }
 */
export const MOVE_TAG = constants.MOVE_TAG;

/** @example changes = { arrayProperty: { [PUSH_TAG]: [new items to append to array] } } */
export const PUSH_TAG = constants.PUSH_TAG;

/** @example changes = { property: { [REPLACE_TAG]: replacement } } */
export const REPLACE_TAG = constants.REPLACE_TAG;

/**
 * @example
 * changes = {
 * 	property: {
 * 		[SET_TAG]: replacement // or a compute replacement function (i.e. currentProperty => replacement)
 * 	}
 * }
 */
export const SET_TAG = constants.SET_TAG;

/**
 * @example
 * changes = {
 *   arrayProperty: {
 *     [SPLICE_TAG]: [-/+fromIndex, +deleteCount, ...newItems?] // newItems = ...[] by default
 *   }
 * }
 */
export const SPLICE_TAG = constants.SPLICE_TAG;

export class UsageError extends Error {}

/** @type {FC<{child: ReactNode}>} */
const ChildMemo = (() => {
	const useNodeMemo = node => {
		const nodeRef = useRef( node );
		if( !isEqual(
			omit( nodeRef.current, '_owner' ),
			omit( node, '_owner' )
		) ) { nodeRef.current = node }
		return nodeRef.current;
	};
	const ChildMemo = memo(({ child }) => child );
	ChildMemo.displayName = 'ObservableContext.Provider.Internal.Guardian.ChildMemo';
	const Guardian = ({ child }) => ( <ChildMemo child={ useNodeMemo( child ) } /> );
	Guardian.displayName = 'ObservableContext.Provider.Internal.Guardian';
	return Guardian;
})();

/**
 * @readonly
 * @type {Prehooks<T>}
 * @template {State} T
 */
const defaultPrehooks = Object.freeze({});

/** @param {Provider<IStore>} Provider */
function makeObservable( Provider ) {
	/**
	 * @type {ObservableProvider<T>}
	 * @template {State} T
	 */
	const Observable = forwardRef(({
		children = null,
		prehooks = defaultPrehooks,
		storage = null,
		value
	}, storeRef ) => {
		const _store = useStore( prehooks, value, storage );
		const { state, store } = useMemo(() => {
			const { state, ...store } = _store;
			return { state, store };
		}, [ _store ]);
		useImperativeHandle( storeRef, () => ({
			...storeRef?.current ?? {},
			getState: () => clonedeep( state ),
			resetState: store.resetState,
			setState: store.setState,
			subscribe: store.subscribe
		}), [ storeRef?.current, state ] );
		return (
			<Provider value={ store }>
				{ memoizeImmediateChildTree( children ) }
			</Provider>
		);
	} );
	Observable.displayName = 'ObservableContext.Provider';
	return Observable;
}

/** @type {(children: ReactNode) => ReactNode} */
function memoizeImmediateChildTree( children ) {
	return Children.map( children, child => {
		if( typeof child.type === 'object' && 'compare' in child.type ) { return child } // memo element
		if( child.props?.children ) {
			child = cloneElement(
				child,
				omit( child.props, 'children' ),
				memoizeImmediateChildTree( child.props.children )
			);
		}
		return ( <ChildMemo child={ child } /> );
	} );
}

/** @type {NonReactUsageReport} */
function reportNonReactUsage() {
	throw new UsageError( 'Detected usage outside of this context\'s Provider component tree. Please apply the exported Provider component' );
}

/**
 * @typedef {IObservableContext<T>|PublicObservableContext<T>} ObservableContext
 * @template {State} T
 */

/**
 * @typedef {WithObservableProvider<Context<Store<T>>, T>} PublicObservableContext
 * @template {State} T
 */

/**
 * @typedef {WithObservableProvider<Context<IStore>, T>} IObservableContext
 * @template {State} T
 */

/**
 * @typedef {T & {Provider: ObservableProvider<S>}} WithObservableProvider
 * @template T
 * @template {State} S
 */

/**
 * @typedef {ForwardRefExoticComponent<ProviderProps<T>, StoreRef<T>>} ObservableProvider
 * @template {State} T
 */

/**
 * @typedef {{
 * 		children?: ReactNode,
 * 		prehooks?: Prehooks<T>
 * 		storage?: IStorage<T>
 * 		value: PartialState<T>
 * }} ProviderProps
* @template {State} T
 */

/**
 * @typedef {{
 * 		[x: string]: *,
 * 		getState: () => T
 * } & {
 * 		[K in "resetState"|"setState"|"subscribe"]: StoreInternal<T>[K]
 * }} StoreRef
 * @template {State} T
 */

/** @typedef {import("../types").State} State */

/**
 * @typedef {import("../types").PartialState<T>} PartialState
 * @template {State} T
 */

/**
 * @typedef {import("../types").Prehooks<T>} Prehooks
 * @template {State} T
 */

/** @typedef {typeof CLEAR_TAG} CLEAR_TAG */

/** @typedef {typeof DELETE_TAG} DELETE_TAG */

/** @typedef {import("../types").FULL_STATE_SELECTOR} FULL_STATE_SELECTOR */

/** @typedef {typeof MOVE_TAG} MOVE_TAG */

/** @typedef {typeof PUSH_TAG} PUSH_TAG */

/** @typedef {typeof REPLACE_TAG} REPLACE_TAG */

/** @typedef {typeof SET_TAG} SET_TAG */

/** @typedef {typeof SPLICE_TAG} SPLICE_TAG */

/**
 * @typedef {{[dataPropKey: string]: string|keyof T} & {[dataPropKey: string]: FULL_STATE_SELECTOR}} SelectorMap
 * @template {State} T
 */

/**
 * @typedef {import("../types").StoreInternal<T>} StoreInternal
 * @template {State} T
 */

/**
 * @typedef {{[K in keyof Store<T>]?: Store<T>[K]}} PartialStore
 * @template {State} T
 */

/**
 * @typedef {import("../types").Store<T>} Store
 * @template {State} T
 */

/** @typedef {import("../types").IStore} IStore */

/**
 * @typedef {import("../types").IStorage<T>} IStorage
 * @template {State} T
 */

/** @typedef {import("../types").NonReactUsageReport} NonReactUsageReport */

/** @typedef {import("../types").Data} Data */

/** @typedef {import("react").ReactNode} ReactNode */

/**
 * @typedef {import('react').ForwardRefExoticComponent<
 * 	import('react').PropsWithRef<P> & import('react').RefAttributes<T>
 * >} ForwardRefExoticComponent
 * @template P, T
 */

/**
 * @typedef {import('react').MemoExoticComponent<ComponentType<P>} MemoExoticComponent
 * @template {{[x:string]:*}} [P={}]
 */

/**
 * @typedef {import("react").ExoticComponent<ComponentType<P>>} ExoticComponent
 * @template {{[x:string]:*}} [P={}]
 */

/**
 * @typedef {import("react").ComponentType<P>} ComponentType
 * @template [P=any]
 */

/**
 * @typedef {import("react").FC<P>} FC
 * @template [P={}]
 */

/**
 * @typedef {import("react").Provider<T>} Provider
 * @template T
 */

/**
 * @typedef {import("react").Context<T>} Context
 * @template T
 */
