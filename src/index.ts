import type {
    ComponentType,
    ForwardRefExoticComponent, 
    MemoExoticComponent,
    NamedExoticComponent,
    ReactNode,
    PropsWithoutRef,
    RefAttributes
} from 'react';

import type {
    Changes as BaseChanges,
    Connection,
    Immutable,
    KeyType,
    Value
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
    UpdatePayload,
    UpdatePayloadArray
} from '@webkrafters/auto-immutable';

export type State = Value;

export type Listener<T extends State = {}> = (
    changes : Readonly<T>,
    hasChangedPath : (
        pathTokens : Array<string>
    ) => boolean
) => void;

export type ObservableProvider<T extends State> = ForwardRefExoticComponent<
    ProviderProps<T> &
    RefAttributes<StoreRef<T>>
>;

export interface ProviderProps<T extends State> {
    children?: ReactNode;
    prehooks?: Prehooks<T>;
    storage?: IStorage<T>;
    value: PartialState<T>;
};

export type ConnectProps<
    OWNPROPS extends OwnProps = IProps,
    STATE extends State = State,
    SELECTOR_MAP extends SelectorMap = SelectorMap
> = { [K in keyof Store<STATE, SELECTOR_MAP>]: Store<STATE, SELECTOR_MAP>[K] }
    & Omit<OWNPROPS, "ref">
    & RefAttributes<OWNPROPS["ref"]>;

export type ConnectedComponent<P extends OwnProps = IProps> = MemoExoticComponent<
    ForwardRefExoticComponent<
            PropsWithoutRef<Omit<P, "ref">>
            & RefAttributes<P["ref"]>
    >
>;

export type PropsExtract<C, STATE extends State, SELECTOR_MAP extends SelectorMap> =
	C extends ComponentType<ConnectProps<infer U, STATE, SELECTOR_MAP>>
		? U extends OwnProps ? U : IProps
		: C extends NamedExoticComponent<ConnectProps<infer U, STATE, SELECTOR_MAP>>
			? U extends OwnProps ? U : IProps
			: IProps;

export type ExtractInjectedProps<
    STATE extends State = State,
    SELECTOR_MAP extends SelectorMap = SelectorMap,
    ALL_PROPS extends OwnProps = OwnProps
> = Omit<ALL_PROPS, keyof Store<STATE>|keyof SELECTOR_MAP>


export interface IProps { ref?: unknown }

export type OwnProps = IProps & Record<any, any>;

export type Text = string | number;

export type FullStateSelector = typeof FULL_STATE_SELECTOR;

export type ObjectSelector = Record<Text, Text | FullStateSelector>;

export type ArraySelector = Array<Text | FullStateSelector>;

export type SelectorMap = ObjectSelector | ArraySelector | void;

type ReplacePathSeps<
    P extends Text,
    T extends string,
> = P extends `${infer U}${T}${infer V}`
    ? ReplacePathSeps<`${U}.${V}`, T>
    : P;

type TrimPathSep<P extends Text> = P extends `${infer U}]${never}` ? U : P;

type NormalizePath<P extends Text> = TrimPathSep<
    ReplacePathSeps<
        ReplacePathSeps<
            ReplacePathSeps<
                P,
                ']['
            >,
            '].'
        >,
        '['
    >
>;

type Datum<
    P extends Text,
    S extends Record<Text, any> = State
> = P extends `${infer K}.${infer P_1}`
    ? Datum<P_1, S[K]>
    : P extends ''
    ? S
    : any;

type DataPoint<
    P extends Text,
    S extends State
> = P extends FullStateSelector ? S : Datum<NormalizePath<P>, S>;

export type Data<
    SELECTOR_MAP extends SelectorMap,
    STATE extends State = State
> = (
    SELECTOR_MAP extends ObjectSelector
    ? {[ S_KEY in keyof SELECTOR_MAP ] : DataPoint<SELECTOR_MAP[S_KEY], STATE> }
    : SELECTOR_MAP extends ArraySelector
    ? {[ S_NUM : number ] : DataPoint<SELECTOR_MAP[number], STATE>}
    : Array<any>
);

export type Changes<T extends State = State> = BaseChanges<T>;

export interface IStorage<T extends State = State> {
    clone: (data: T) => T;
    getItem: (key: string) => T;
    removeItem: (key: string) => void;
    setItem: (key: string, data: T) => void;
};

export type NonReactUsageReport = (...args: Array<unknown>) => void;

export type PartialState<T extends State> = Partial<T>;

export interface Prehooks<T extends State = State> {
    resetState?: (
        resetData: PartialState<T>,
        state: {
            current: T;
            original: T;
        }
    ) => boolean;
    setState?: (newChanges: Changes<T>) => boolean;
};

export type Subscribe = <T extends State>( listener : Listener<T> ) => Unsubscribe;

export type Unsubscribe = (...args: Array<unknown>) => void;

export interface IStore {
    resetState: Function;
    setState: Function;
}

export interface IStoreInternal extends IStore {
    subscribe: Function;
}

export interface Store<
    T extends State,
    SELECTOR_MAP extends SelectorMap = SelectorMap
> extends IStore {
    data: Data<SELECTOR_MAP>;
    resetState: (propertyPaths?: Array<string>) => void;
    setState: (changes: Changes<T>) => void;
};

export interface StoreInternal<T extends State> extends IStoreInternal {
    cache: Immutable<Partial<T>>,
    resetState: (connection: Connection<T>, propertyPaths?: Array<string>) => void;
    setState: (connection: Connection<T>, changes: Changes<T>) => void;
    subscribe: Subscribe;
};

export interface StorePlaceholder extends IStoreInternal {
    getState: NonReactUsageReport;
    resetState: NonReactUsageReport;
    setState: NonReactUsageReport;
    subscribe: NonReactUsageReport;
};

export interface StoreRef<T extends State = State> extends StorePlaceholder {
    getState: () => T,
    resetState: (propertyPaths?: string[]) => void;
    setState: (changes: Changes<T>) => void;
    subscribe: Subscribe;
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
    ObservableContext,
    UsageError,
    useContext
} from './main';
