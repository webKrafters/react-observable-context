export default null;

/** @typedef {{[selectorKey: string]: Readonly<*>}} Data */

/**
 * @typedef {{
 * 		clone: (data: T) => T,
 * 		getItem: (key: string) => T,
 * 		removeItem: (key: string) => void,
 * 		setItem: (key: string, data: T) => void
 * }} IStorage
 * @template {State} T
 */

/** @typedef {{[K in "getState"|"resetState"|"setState"|"subscribe"]: NonReactUsageReport}} IStore */

/**
 * @typedef {(changes: UpdatePayload<PartialState<T>>) => void} Listener
 * @template {State} T
 */

/** @typedef {() => never} NonReactUsageReport  */

/**
 * @typedef {{[K in keyof T]?: T[K]}} PartialState
 * @template {State} T
 */

/**
 * @typedef {{
 * 		resetState?: (
 * 			resetData: PartialState<T>,
 * 			state: {current: T, original: T}
 * 		) => boolean,
 * 		setState?: (newChanges: PartialState<T>) => boolean
 * }} Prehooks
 * @template {State} T
 */

/** @typedef {{[x:string]: *}} State */

/**
 * @typedef {{[K in "resetState"|"setState"]: Store<T>[K]} & {
 * 		getState: (clientId: string, ...propertyPaths?: string[]) => {[propertyPaths: string]: Readonly<*>},
 *		subscribe: (listener: Listener<T>) => Unsubscribe
 * 		unlinkCache: (clientId: string) => void
 * }} StoreInternal
 * @template {State} T
 */

/**
 * @typedef {{
 *		data: Data,
 *		resetState: (propertyPaths?: string[]) => void,
 *		setState: (changes: UpdatePayload<PartialState<T>>) => void,
 * }} Store
 * @template {State} T
 */

/**
 * @typedef {T | CLEAR_TAG | {[K in DELETE_TAG]: Array<keyof T>} | {[k in REPLACE_TAG]: T} | {[K in keyof T]?: UpdatePayload<T[K]>}} UpdatePayload
 * @template T
 */
/** @typedef {typeof import("./constants").CLEAR_TAG} CLEAR_TAG */
/** @typedef {typeof import("./constants").DELETE_TAG} DELETE_TAG */
/** @typedef {typeof import("./constants").FULL_STATE_SELECTOR} FULL_STATE_SELECTOR */
/** @typedef {typeof import("./constants").REPLACE_TAG} REPLACE_TAG */

/** @typedef {VoidFunction} Unsubscribe */
