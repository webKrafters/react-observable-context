import type {
	ComponentType,
	Context,
	FC,
	MutableRefObject,
	NamedExoticComponent,
	Provider,
	ReactNode
} from 'react';

import type {
	ConnectedComponent,
	ConnectedComponentProps,
	Data,
	IObservableContext,
	IStore,
	NonReactUsageReport,
	ObservableContext,
	ObservableProvider,
	OwnProps,
	PartialState,
	Prehooks,
	ProviderProps,
	SelectorMap,
	State,
	Store,
	StoreInternal,
	StoreRef,
	StorePlaceholder
} from '..';

import React, {
	Children,
	cloneElement,
	createContext as _createContext,
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState
} from 'react';

import isEmpty from 'lodash.isempty';
import isEqual from 'lodash.isequal';
import isPlainObject from 'lodash.isplainobject';
import omit from 'lodash.omit';

import * as constants from '../constants';

import useRenderKeyProvider from './hooks/use-render-key-provider';

import useStore from './hooks/use-store';

const reportNonReactUsage : NonReactUsageReport  = () => {
	throw new UsageError( 'Detected usage outside of this context\'s Provider component tree. Please apply the exported Provider component' );
};

export function createContext  <T extends State>() : ObservableContext<T> {
	const Context = _createContext({
		getState: reportNonReactUsage,
		resetState: reportNonReactUsage,
		setState: reportNonReactUsage,
		subscribe: reportNonReactUsage
	});
	const provider = Context.Provider;
	Context.Provider = makeObservable( provider ) as unknown as Provider<StorePlaceholder>;
	return Context as unknown as IObservableContext<T>;
};

/** 
 * Actively monitors the store and triggers component re-render if any of the watched keys in the state objects changes
 * 
 * @param context - Refers to the PublicObservableContext<T> type of the ObservableContext<T>
 * @param [selectorMap = {}] - Key:value pairs where `key` => arbitrary key given to a Store.data property holding a state slice and `value` => property path to a state slice used by this component: see examples below. May add a mapping for a certain arbitrary key='state' and value='@@STATE' to indicate a desire to obtain the entire state object and assign to a `state` property of Store.data. A change in any of the referenced properties results in this component render. When using '@@STATE', note that any change within the state object will result in this component render.
 * @see {ObservableContext<STATE,SELECTOR_MAP>}
 * 
 * @example
 * a valid property path follows the `lodash` object property path convention.
 * for a state = { a: 1, b: 2, c: 3, d: { e: 5, f: [6, { x: 7, y: 8, z: 9 } ] } }
 * Any of the following is an applicable selector map.
 * ['d', 'a'] => {
 * 		0: { e: 5, f: [6, { x: 7, y: 8, z: 9 } ] },
 * 		1: 1
 * }
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
export const useContext = <
	STATE extends State,
	SELECTOR_MAP extends SelectorMap<STATE> = SelectorMap<STATE>,
>(
	context : ObservableContext<STATE, SELECTOR_MAP>,
	selectorMap : SELECTOR_MAP = {} as SELECTOR_MAP
) : Store<STATE, SELECTOR_MAP> => {

	const {
		cache,
		resetState: _resetState,
		setState: _setState,
		subscribe,
	} = React.useContext(
		context as unknown as Context<PartialState<STATE>>
	) as unknown as StoreInternal<STATE>;

	const [ connection, refreshConnection ] = React.useState(() => cache.connect());

	const _renderKeys = useRenderKeyProvider( selectorMap ) as Array<string>;

	/* Reverses selectorMap i.e. {selectorKey: propertyPath} => {propertyPath: selectorKey} */
	const selectorMapInverse = useMemo(() => {
		const map = {} as {[propertyPath: string]: string};
		if( isEmpty( _renderKeys ) ) { return map };
		for( const selectorKey in selectorMap ) {
			map[ selectorMap[ selectorKey as string ] ] = selectorKey;
		}
		return map;
	}, [ _renderKeys ]);

	const [ data, setData ] = React.useState(() => {
		const data = {};
		if( isEmpty( _renderKeys ) ) { 
			return data as Data<SELECTOR_MAP>;
		}
		const state = connection.get( ..._renderKeys as string[] );
		for( const propertyPath of _renderKeys ) {
			data[ selectorMapInverse[ propertyPath ] ] = state[
				propertyPath === constants.FULL_STATE_SELECTOR
					? constants.GLOBAL_SELECTOR
					: propertyPath
			];
		}
		return data as Data<SELECTOR_MAP>;
	});

	const updateData = () => {
		let hasChanges = false;
		const state = connection.get( ..._renderKeys as string[] );
		const d = data as object;
		for( const propertyPath of _renderKeys ) {
			const selectorKey = selectorMapInverse[ propertyPath ];
			if( propertyPath === constants.FULL_STATE_SELECTOR ) {
				if( data[ selectorKey ] === state[ constants.GLOBAL_SELECTOR ] ) { continue }
				d[ selectorKey ] = state[ constants.GLOBAL_SELECTOR ];
				hasChanges = true;
				continue;
			}
			if( data[ selectorKey ] === state[ propertyPath ] ) { continue }
			d[ selectorKey ] = state[ propertyPath ];
			hasChanges = true;
		}
		hasChanges && setData({ ...data });
	};

	const resetState = useCallback<Store<STATE, SELECTOR_MAP>["resetState"]>(
		( propertyPath = _renderKeys as Array<string> ) => _resetState( connection, propertyPath ),
		[ _resetState, connection ]
	);

	const setState = useCallback<Store<STATE, SELECTOR_MAP>["setState"]>(
		changes => _setState( connection, changes ),
		[ _setState, connection ]
	);

	React.useEffect(() => { // sync data states with new renderKeys
		if( cache.closed ) { return }
		refreshConnection( cache.connect() )
		if( isEmpty( _renderKeys ) ) {
			const _default = {} as Data<SELECTOR_MAP>;
			!isEqual( _default, data ) && setData( _default );
			return;
		}
		for( const selectorKey in data ) {
			if( !( selectorMap[ selectorKey as string ] in selectorMapInverse ) ) {
				delete data[ selectorKey ];
			}
		}
		const unsubscribe = subscribe( updateData );
		updateData();
		return () => {
			if( cache.closed ) { return }
			unsubscribe();
			connection.disconnect();
		};
	}, [ _renderKeys, cache ]);

	return useMemo<Store<STATE, SELECTOR_MAP>>(() => ({ data, resetState, setState }), [ data ]);
};

/**
 * Provides an HOC function for connecting its WrappedComponent argument to the context store.
 *
 * The HOC function automatically memoizes any un-memoized WrappedComponent argument.
 *
 * @param context - Refers to the PublicObservableContext<T> type of the ObservableContext<T>
 * @param [selectorMap] - Key:value pairs where `key` => arbitrary key given to a Store.data property holding a state slice and `value` => property path to a state slice used by this component: see examples below. May add a mapping for a certain arbitrary key='state' and value='@@STATE' to indicate a desire to obtain the entire state object and assign to a `state` property of Store.data. A change in any of the referenced properties results in this component render. When using '@@STATE', note that any change within the state object will result in this component render.
 * @see {useContext} for selectorMap sample
 */
export function connect <
	STATE extends State = State,
	OWNPROPS extends OwnProps<State> = OwnProps<State>,
	SELECTOR_MAP extends SelectorMap<STATE> = SelectorMap<STATE>
>(
	context : ObservableContext<STATE, SELECTOR_MAP>,
	selectorMap? : SELECTOR_MAP
) {

	function wrap( WrappedComponent : ComponentType<ConnectedComponentProps<OWNPROPS, Store<STATE, SELECTOR_MAP>>> ) : ConnectedComponent<OWNPROPS, Store<STATE, SELECTOR_MAP>>;
	function wrap( WrappedComponent : NamedExoticComponent<ConnectedComponentProps<OWNPROPS, Store<STATE, SELECTOR_MAP>>> ) : ConnectedComponent<OWNPROPS, Store<STATE, SELECTOR_MAP>>;
	function wrap( WrappedComponent ) : ConnectedComponent<OWNPROPS, Store<STATE, SELECTOR_MAP>> 
	{

		if( !( isPlainObject( WrappedComponent ) && 'compare' in WrappedComponent ) ) {
			WrappedComponent = memo( WrappedComponent );
		}

		const ConnectedComponent : ConnectedComponent<
			OWNPROPS, Store<STATE, SELECTOR_MAP>
		> = memo( forwardRef(( ownProps, ref ) => {
			const store = useContext( context, selectorMap );
			return( <WrappedComponent { ...store } { ...ownProps } ref={ ref } /> );
		}) );
		ConnectedComponent.displayName = 'ObservableContext.Connected';
		
		return ConnectedComponent;
	};

	return wrap;

}

export class UsageError extends Error {}

const ChildMemo : FC<{child: ReactNode}> = (() => {

	const useNodeMemo = ( node : ReactNode ) : ReactNode => {
		const nodeRef = useRef( node );
		if( !isEqual(
			omit( nodeRef.current, '_owner' ),
			omit( node, '_owner' )
		) ) { nodeRef.current = node }
		return nodeRef.current;
	};

	const ChildMemo = memo<{ child: ReactNode }>(({ child }) => ( <>{ child }</> ));
	ChildMemo.displayName = 'ObservableContext.Provider.Internal.Guardian.ChildMemo';

	const Guardian : FC<{ child: ReactNode }> = ({ child }) => (
		<ChildMemo child={ useNodeMemo( child ) } />
	);
	Guardian.displayName = 'ObservableContext.Provider.Internal.Guardian';

	return Guardian;
})();

const defaultPrehooks : Readonly<Prehooks<State>> = Object.freeze({});

function makeObservable<T extends State = State>( Provider : Provider<IStore> ) {
	const Observable : ObservableProvider<T> = forwardRef<
		StoreRef<T>,
		ProviderProps<T>
	>(({
		children = null,
		prehooks = defaultPrehooks,
		storage = null,
		value
	}, storeRef ) => {
		const store = useStore( prehooks, value, storage );
		const [ connection ] = useState(() => store.cache.connect());
		useImperativeHandle( storeRef, () => ({
			...( storeRef as MutableRefObject<StoreRef<T>> )?.current ?? {},
			getState: () => connection.get( constants.GLOBAL_SELECTOR )[ constants.GLOBAL_SELECTOR ] as T,
			resetState: propertyPaths => store.resetState( connection, propertyPaths ),
			setState: changes => store.setState( connection, changes ),
			subscribe: store.subscribe
		}), [ ( storeRef as MutableRefObject<StoreRef<T>> )?.current ] );
		useEffect(() => () => connection.disconnect(), []);
		return (
			<Provider value={ store }>
				{ memoizeImmediateChildTree( children ) }
			</Provider>
		);
	} );
	Observable.displayName = 'ObservableContext.Provider';
	return Observable;
}

function memoizeImmediateChildTree( children : ReactNode ) : ReactNode {
	return Children.map( children, child => {
		child = child as JSX.Element;
		if( !( child?.type ) || ( // skip memoized or non element(s)
			typeof child.type === 'object' &&
			'compare' in ( child.type ?? {} )
		) ) {
			return child;
		}
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