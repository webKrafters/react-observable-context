import type {
	ComponentType,
	Context,
	ForwardRefExoticComponent as FREC,
	MemoExoticComponent as MEC,
	PropsWithRef,
	ReactNode,
	RefAttributes
} from 'react';

import type {
    Changes as BaseChanges,
    Connection,
    Immutable,
    Value as State,
} from '@webkrafters/auto-immutable';

import { FULL_STATE_SELECTOR } from './constants';

export type {
    BaseType,
    ClearCommand,
    KeyType,
    MoveCommand,
    PushCommand,
    ReplaceCommand,
    SetCommand,
    SpliceCommand,
    TagCommand,
    TagType,
    UpdateStats,
    Value as State,
    UpdatePayload,
    UpdatePayloadArray
} from '@webkrafters/auto-immutable';

export type ObservableContext<
	T extends State,
	SELECTOR_MAP extends SelectorMap<T> = SelectorMap<T>
> = IObservableContext<T>|PublicObservableContext<T, SELECTOR_MAP>;

export type PublicObservableContext<
	T extends State,
	SELECTOR_MAP extends SelectorMap<T> = SelectorMap<T>
> = WithObservableProvider<Context<Store<T, SELECTOR_MAP>>, T>;

export type IObservableContext<T extends State> = WithObservableProvider<Context<IStore>, T>;

export type WithObservableProvider<
    LOCAL_DATA extends {} = {},
    T extends State = State
> = LOCAL_DATA & {Provider: ObservableProvider<T>};

export type ObservableProvider<T extends State> = ForwardRefExoticComponent<ProviderProps<T>, StoreRef<T>>;

export interface ProviderProps<T extends State>{
	children? : ReactNode;
	prehooks? : Prehooks<T>;
	storage? : IStorage<T>;
	value : PartialState<T>;
};

export type ConnectedComponentProps<
	OWNPROPS extends OwnProps<State> = OwnProps,
	STORE extends Store<State> = Store<State>
> = STORE & OWNPROPS;

export type ConnectedComponent<
	OWNPROPS extends OwnProps<State> = OwnProps,
	STORE extends Store<State> = Store<State>
> = MemoExoticComponent<FREC<ConnectedComponentProps<OWNPROPS, STORE>>>;

export type OwnProps<P extends State = {}> = PropsWithRef<P>;

export type ForwardRefExoticComponent<P, T> = FREC<PropsWithRef<P> & RefAttributes<T>>

export type MemoExoticComponent<P={}> = MEC<ComponentType<P>>

export type FullStateSelector = typeof FULL_STATE_SELECTOR;

export type BaseSelectorMap<T=State> = Array<
    string | keyof T | FullStateSelector
> | ({
		[dataPropKey : string] : string| keyof T
} & {
		[dataPropKey : string] : FullStateSelector
});

export type SelectorMap<T extends State = State> = BaseSelectorMap<T>;

export type Data<SELECTOR_MAP extends SelectorMap = SelectorMap> = {
    [selectorKey in keyof SELECTOR_MAP] : Readonly<unknown>
};

export type Changes<T extends State = State> = BaseChanges<T>;

export interface IStorage<T extends State> {
	clone : (data : T) => T;
	getItem : (key : string) => T;
	removeItem : (key : string) => void;
	setItem : (key : string, data : T) => void;
};

export type NonReactUsageReport = (...args : Array<unknown>) => void;
 
export type Listener = <T extends State>(changes : Changes<T>) => void;

export type PartialState<T extends State> = Partial<T>;

export interface Prehooks<T extends State> {
	resetState? : (
        resetData : PartialState<T>,
        state : {
            current : T;
            original : T;
        } 
    ) => boolean;
	setState?: (newChanges : Changes<T>) => boolean;
};

export type Unsubscribe = ( ...args : Array<unknown> ) => void;

export interface IStore {
	resetState : Function;
	setState : Function;
}

export interface IStoreInternal extends IStore {
	subscribe : Function;
}

export interface Store<
    T extends State,
    SELECTOR_MAP extends SelectorMap<T> = SelectorMap<T>
> extends IStore {
	data : Data<SELECTOR_MAP>;
	resetState : (propertyPaths? : Array<string>) => void;
	setState : (changes : Changes<T>) => void;
};

export interface StoreInternal<T extends State> extends IStoreInternal {
	cache : Immutable<T>,
    resetState : ( connection : Connection<T>, propertyPaths? : Array<string> ) => void;
	setState : ( connection : Connection<T>, changes : Changes<T> ) => void;
	subscribe : ( listener : Listener ) => Unsubscribe; 
};

export interface StorePlaceholder extends IStoreInternal {
    getState : NonReactUsageReport;
    resetState : NonReactUsageReport;
    setState : NonReactUsageReport;
    subscribe : NonReactUsageReport;
};

export interface StoreRef<T extends State> extends StorePlaceholder {
    getState : () => T,
    resetState : ( propertyPaths? : string[] ) => void;
    setState : ( changes : Changes<T> ) => void;
    subscribe : ( listener : Listener ) => Unsubscribe;
}

export {
    CLEAR_TAG,
    DELETE_TAG,
    FULL_STATE_SELECTOR,
    MOVE_TAG,
    NULL_SELECTOR,
    PUSH_TAG,
    REPLACE_TAG,
    SET_TAG,
    SPLICE_TAG,
    Tag,
} from './constants';

export {
    connect,
    createContext,
    UsageError,
    useContext
} from './main';