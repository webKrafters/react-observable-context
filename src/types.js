export default null;

/** @typedef {Array|{[x:string]:*}|boolean|KeyType} BaseType */

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

/** @typedef {number|string|symbol} KeyType */

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

/**
 * @typedef {Object} PropertyInfo
 * @property {*} Property._value Actual value held in state
 * @property {boolean} Property.exists
 * @property {number}  Property.index
 * @property {string|symbol|number} Property.key
 * @property {T} Property.source
 * @property {*} Property.value Value returned
 * @template {State|Array} T
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
 *		data: Data,
 *		resetState: (propertyPaths?: string[]) => void,
 *		setState: (changes: UpdatePayload<PartialState<T>>) => void,
 * }} Store
 * @template {State} T
 */

/** @typedef {{hasChanges: boolean}} UpdateStats */

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
