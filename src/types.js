export default null;

/**
 * @typedef {Array<string|keyof T|FULL_STATE_SELECTOR> | ({
 * 		[dataPropKey: string]: string|keyof T
 * } & {
 * 		[dataPropKey: string]: FULL_STATE_SELECTOR
 * })} BaseSelectorMap
 * @template {State} T
 */

/** @typedef {Array|{[x:string]:*}|boolean|KeyType} BaseType */

/**
 * @typedef {{[selectorKey in keyof SELECTOR_MAP]: Readonly<*>}} Data
 * @template {SelectorMap} [SELECTOR_MAP=SelectorMap]
 */

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

/** @typedef {number|string|symbol} KeyType */

/**
 * @callback Listener
 * @param {Changes<T>} changes
 * @returns {void}
 * @template {State} T
 */

/**
 * @callback NonReactUsageReport
 * @returns {never}
 */

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
 * 		setState?: (newChanges: Changes<T>) => boolean
 * }} Prehooks
 * @template {State} T
 */

/**
 * @typedef {MAP} SelectorMap
 * @template {State} [T=State]
 * @template {BaseSelectorMap<T>} [MAP=BaseSelectorMap<T>]
 */

/** @typedef {{[x: KeyType]: *}} State */

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
 *		data: Data<SELECTOR_MAP>,
 *		resetState: (propertyPaths?: string[]) => void,
 *		setState: (changes: Changes<T>) => void,
 * }} Store
 * @template {State} T
 * @template {SelectorMap<T>} [SELECTOR_MAP=SelectorMap<T>]
 */

/**
 * @typedef {UpdatePayload<PartialState<T>>|UpdatePayloadArray<PartialState<T>>} Changes
 * @template {State} T
 */

/** @typedef {{hasChanges: boolean}} UpdateStats */

/**
 * @typedef {Array<UpdatePayload<T>>} UpdatePayloadArray
 * @template T
 */

/**
 * @typedef {T|CLEAR_TAG|ClearCommand|DeleteCommand<T>|MoveCommand|PushCommand|ReplaceCommand|SetCommand<T>|SpliceCommand|{[K in keyof T]?: UpdatePayload<T[K]>}} UpdatePayload
 * @template T
 */

/** @typedef {{[K in CLEAR_TAG]:*}} ClearCommand - As in {"@@CLEAR":*} is a parameterless command. Parameters have not effect */
/**
 * @typedef {{[K_1 in DELETE_TAG]: Array<keyof T>}} DeleteCommand - As in {"@@DELETE": [property keys to delete]}
 * @template {Array|State} T
 */
/** @typedef {{[K in MOVE_TAG]: [number, number, number?]}} MoveCommand - As in {"@@MOVE": [-/+fromIndex, -/+toIndex, +numItems? ]}. numItems = 1 by default. */
/** @typedef {{[K in PUSH_TAG]: Array}} PushCommand - As in {"@@PUSH": [new items]} */
/** @typedef {{[K in REPLACE_TAG]: BaseType}} ReplaceCommand - As in {"@@REPLACE": [Replacement values]} */
/**
 * @typedef {{[K in SET_TAG]: BaseType|(currentValue:V) => *}} SetCommand
 * @template V
 */
/**
 * @typedef {{[K in SPLICE_TAG]: [number, number, ...*]}} SpliceCommand  - As in {"@@SPLICE": [-/+fromIndex, +deleteCount, ...newItems? ]}. numItems = undefined by default.
 */

/** @typedef {typeof import("./constants").CLEAR_TAG} CLEAR_TAG */
/** @typedef {typeof import("./constants").DELETE_TAG} DELETE_TAG */
/** @typedef {typeof import("./constants").FULL_STATE_SELECTOR} FULL_STATE_SELECTOR */
/** @typedef {typeof import("./constants").MOVE_TAG} MOVE_TAG */
/** @typedef {typeof import("./constants").PUSH_TAG} PUSH_TAG */
/** @typedef {typeof import("./constants").REPLACE_TAG} REPLACE_TAG */
/** @typedef {typeof import("./constants").SET_TAG} SET_TAG */
/** @typedef {typeof import("./constants").SPLICE_TAG} SPLICE_TAG */

/** @typedef {VoidFunction} Unsubscribe */
