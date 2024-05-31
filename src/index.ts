import type {
    Context,
    ForwardRefExoticComponent,
    MemoExoticComponent,
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

export type ObservableContext<T extends State> = IObservableContext<T> | PublicObservableContext<T>;

export type PublicObservableContext<T extends State> = WithObservableProvider<Context<Store<T>>, T>;

export type IObservableContext<T extends State> = WithObservableProvider<Context<IStore>, T>;

export type WithObservableProvider<
    LOCAL_DATA extends Record<any, any> = {},
    T extends State = State
> = LOCAL_DATA & { Provider: ObservableProvider<T> };

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
    & React.RefAttributes<OWNPROPS["ref"]>;

export type ConnectedComponent<P extends OwnProps = IProps> = MemoExoticComponent<
    React.ForwardRefExoticComponent<
            React.PropsWithoutRef<Omit<P, "ref">>
            & React.RefAttributes<P["ref"]>
    >
>;

export interface IProps { ref?: unknown }

export type OwnProps = IProps & Record<any, any>;

export type Text = string | number;

export type FullStateSelector = typeof FULL_STATE_SELECTOR;

export type ObjectSelector = Record<Text, Text | FullStateSelector>;

export type ArraySelector = Array<Text | FullStateSelector>;

export type SelectorMap = ObjectSelector | ArraySelector | void;

export type Data<SELECTOR_MAP extends SelectorMap> = (
    SELECTOR_MAP extends ObjectSelector
    ? { [selectorKey in keyof SELECTOR_MAP]: Readonly<any> }
    : SELECTOR_MAP extends ArraySelector
    ? { [selectorKey: number]: Readonly<any> }
    : never
);

export type Changes<T extends State = State> = BaseChanges<T>;

export interface IStorage<T extends State = State> {
    clone: (data: T) => T;
    getItem: (key: string) => T;
    removeItem: (key: string) => void;
    setItem: (key: string, data: T) => void;
};

export type NonReactUsageReport = (...args: Array<unknown>) => void;

export type Listener = <T extends State>(changes: Changes<T>) => void;

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
    cache: Immutable<T>,
    resetState: (connection: Connection<T>, propertyPaths?: Array<string>) => void;
    setState: (connection: Connection<T>, changes: Changes<T>) => void;
    subscribe: (listener: Listener) => Unsubscribe;
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
    subscribe: (listener: Listener) => Unsubscribe;
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