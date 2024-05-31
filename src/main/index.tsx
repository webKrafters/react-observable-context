type PropsExtract<C, STATE extends State, SELECTOR_MAP extends SelectorMap> =
	C extends ComponentType<ConnectProps<infer U, STATE, SELECTOR_MAP>>
		? U extends OwnProps ? U : IProps
		: C extends NamedExoticComponent<ConnectProps<infer U, STATE, SELECTOR_MAP>>
			? U extends OwnProps ? U : IProps
			: IProps;

type InjectedProps<P extends IProps = IProps> = {[K in keyof P]: P[K]};

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
	ConnectProps,
	Data,
	IObservableContext,
	IStore,
	NonReactUsageReport,
	IProps,
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
import Immutable from '@webkrafters/auto-immutable';

const reportNonReactUsage : NonReactUsageReport  = () => {
	throw new UsageError( 'Detected usage outside of this context\'s Provider component tree. Please apply the exported Provider component' );
};

export function createContext  <T extends State = State>() : ObservableContext<T> {
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
export function useContext <
	STATE extends State,
	SELECTOR_MAP extends SelectorMap
>(
	context : ObservableContext<STATE>,
	selectorMap? : SELECTOR_MAP
) : Store<STATE, SELECTOR_MAP> {

	const {
		cache,
		resetState: _resetState,
		setState: _setState,
		subscribe,
	} = React.useContext(
		context as unknown as Context<PartialState<STATE>>
	) as unknown as StoreInternal<STATE>;

	const [ connection, refreshConnection ] = React.useState(() => {
		if( cache instanceof Immutable ) {
			return cache.connect();
		}
		reportNonReactUsage();
	});

	const _renderKeys = useRenderKeyProvider( selectorMap );

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
export function connect<
	STATE extends State = State,
	SELECTOR_MAP extends SelectorMap = SelectorMap
>( context : ObservableContext<STATE>, selectorMap? : SELECTOR_MAP ) {

	function connector<
		C extends
			| ComponentType<ConnectProps<P, STATE, SELECTOR_MAP>>
			| NamedExoticComponent<ConnectProps<P, STATE, SELECTOR_MAP>>,
		P extends InjectedProps<PropsExtract<C, STATE, SELECTOR_MAP>> = InjectedProps<PropsExtract<C, STATE, SELECTOR_MAP>>
	>( WrappedComponent : C ) {

		const Wrapped = (
			!( isPlainObject( WrappedComponent ) && 'compare' in WrappedComponent )
				? memo( WrappedComponent )
				: WrappedComponent
		) as NamedExoticComponent<ConnectProps<P, STATE, SELECTOR_MAP>>;

		const ConnectedComponent = memo( forwardRef<
			P extends IProps ? P["ref"] : never,
			Omit<P, "ref">
		>(( ownProps, ref ) => {
			const store = useContext( context, selectorMap );
			return ( <Wrapped { ...store } { ...ownProps } ref={ ref } /> );
		}) );
		ConnectedComponent.displayName = 'ObservableContext.Connected';
		
		return ConnectedComponent as ConnectedComponent<P>;

	}

	return connector;

}

// @debug
type MyState = { test: number };
type SMap = { val: string };
const Ctx = createContext<MyState>();
const CCC : React.FC = () => ( <Ctx.Provider value={{ test: 234 }}/> );
const getConnected = connect( Ctx, { val: 'test' } );
interface PP {
	b?: boolean,
	n?: number,
	ref?: HTMLDivElement,
	t?: string
}
// @debug
// const T : ForwardRefExoticComponent<PP & {
// 	data: Data<SMap>;
//     resetState: (propertyPaths?: string[]) => void;
//     setState: (changes: import("../").Changes<MyState>) => void;
// }> = forwardRef(
const T : React.ForwardRefExoticComponent<ConnectProps<
	PP, MyState, SMap
>> = forwardRef(
	({ data: { val } }, ref ) => (
		<div ref={ ref }>{ val as ReactNode }</div>
	)
);
const Connected = getConnected( T );
const Connected2 = getConnected(() => (<div></div>));
interface PP2 {
	b0?: boolean,
	n0?: number,
	s0?: string
};
const T2 : FC<ConnectProps<PP2, MyState, SMap>> = ({ b0, data, n0, s0 }) => (
	<div>{ JSON.stringify({ b0, data, n0, s0 }, null, 2 ) as React.ReactNode }</div>
);
const Connected3 = getConnected( T2 );
const V = () => {
	const c = ( <Connected n={ 33 } ref={ useRef() } /> );
	const c2 = ( <Connected2 /> );
	const c3 = ( <Connected3 n0={ 33 } /> );
	return (
		<>
			{ c }
			{ c2 }
			{ c3 }
		</>
	);
}

const F : FC<{age:number}> = props => ( <div>{ props.age }</div> );
const f = ( <F age={ 33 } /> )
// -----

export class UsageError extends Error {};

const ChildMemo : FC<{ child: ReactNode }> = (() => {

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