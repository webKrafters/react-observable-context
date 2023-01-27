import isEmpty from 'lodash.isempty';
import isEqual from 'lodash.isequal';
import isPlainObject from 'lodash.isplainobject';

import {
	CLEAR_TAG,
	DELETE_TAG,
	MOVE_TAG,
	PUSH_TAG,
	REPLACE_TAG,
	SET_TAG,
	SPLICE_TAG
} from '../../../constants';

import { clonedeep, getProperty, isDataContainer } from '../../../utils';

/**
 * Sets a state slice to its empty value equivalent
 * Compatible with state slices of all types.
 *
 * @example
 * // given the following state:
 * const state = {name: 'test', nested: {name: 'nested', items: ['a', 'b', 'c', 'd', 'e', 'f'], fn: () => {}}}
 * $clear(state, 'name', {hasChanges: false}, {name: {'@@CLEAR': *}, ...}) // sets `state.name` = ''
 * $clear(state, 'nested', {hasChanges: false}, {nested: {'@@CLEAR': *},...}) // sets `state.nested` = {}
 * $clear(state.nested, 'name', {hasChanges: false}, {name: {'@@CLEAR': *}, ...}) // sets `state.nested.name` = ''
 * $clear(state.nested, 'items', {hasChanges: false}, {items: {'@@CLEAR': *}, ...}) // sets `state.nested.items` = []
 * $clear(state.nested, 'items', {hasChanges: false}, {items: ['a', {'@@CLEAR': *}, 'c', 'd', 'e', 'f'], ...}) // sets `state.nested.items[2]` = ''
 * $clear(state.nested, 'fn', {hasChanges: false}, {fn: {'@@CLEAR': *}, ...}) // sets `state.nested.fn` = null
 * $clear(state.nested.items, 4, {hasChanges: false}, {4: {'@@CLEAR': *}, ...}) // sets `state.nested.items[4]` = ''
 */
export const $clear = (() => {
	const defaultPredicate = () => true;
	const hasItems = ( state, stateKey ) => state[ stateKey ].length;
	const setDefault = ( state, stateKey, stats, changes, predicate = defaultPredicate, value = null ) => {
		if( predicate( state, stateKey, stats ) ) {
			state[ stateKey ] = value;
			stats.hasChanges = true;
		}
		finishTagRequest( changes, stateKey, CLEAR_TAG );
	};
	/**
	 * @type {TagFunction<T, K, import("../../../types").ClearCommand>}
	 * @template T, K
	 */
	const clear = ( state, stateKey, stats, changes ) => {
		if( !( stateKey in state ) ) { return finishTagRequest( changes, stateKey, CLEAR_TAG ) }
		const value = state[ stateKey ];
		if( typeof value === 'undefined' || value === null ) { return finishTagRequest( changes, stateKey, CLEAR_TAG ) }
		if( isPlainObject( value ) ) {
			let hasChanges = false;
			for( const k in value ) { // remove properties singularly b/c where state === the setState `state` argument, we may not change its reference
				delete state[ stateKey ][ k ];
				hasChanges = true;
			}
			stats.hasChanges = stats.hasChanges || hasChanges;
			return finishTagRequest( changes, stateKey, CLEAR_TAG );
		}
		const type = value.constructor.name;
		if( type === 'String' ) { return setDefault( state, stateKey, stats, changes, hasItems, '' ) }
		if( type === 'Array' ) { return setDefault( state, stateKey, stats, changes, hasItems, [] ) }
		setDefault( state, stateKey, stats, changes );
	};
	return clear;
})();

/**
 * Removes items from state slices.
 * Compatible with state slices of the Array and POJO property types.
 *
 * @example
 * // given the following state:
 * const state = {name: 'test', nested: {name: 'nested', items: ['a', 'b', 'c', 'd', 'e', 'f'], fn: () => {}}}
 * $delete(state, 'state', {hasChanges: false}, {state: {'@@DELETE': ['name', 'nested'], ...}, ...}) // removes the `name` and `nested` properties from `state`
 * $delete(state, 'nested', {hasChanges: false}, {nested: {'@@DELETE': ['fn', 'items', 'name'], ...}, ...}) // removes the 'fn', 'items' and 'name' properties from `state.nested`
 * $delete(state.nestetd, 'items', {hasChanges: false}, {items: {'@@DELETE': [0, 3], ...}, ...}) // removes indexes 0 and 3 `state.nested.items`
 *
 * @type {TagFunction<T, K,  import("../../../types").DeleteCommand<T[K]>}
 * @template T, K
 */
export const $delete = ( state, stateKey, stats, changes ) => {
	let deleteKeys = changes[ stateKey ][ DELETE_TAG ];
	if( !Array.isArray( deleteKeys ) ) {
		throw new TypeError( `Invalid entry found at ${ DELETE_TAG } change property: requires an array of state keys to delete.` );
	}
	const finish = () => finishTagRequest( changes, stateKey, DELETE_TAG );
	let currValue;
	try{
		if( !deleteKeys.length ) { throw new Error( 'Delete called with no identified items to delete.' ) };
		currValue = state[ stateKey ];
		if( isEmpty( currValue ) ) { throw new Error( 'Delete called on empty state.' ) }
	} catch( e ) { return finish() }
	deleteKeys = Array.from( new Set( deleteKeys ) );
	let hasChanges = false;
	if( !Array.isArray( currValue ) ) {
		for( const k of deleteKeys ) {
			if( !getProperty( currValue, k ).exists ) { continue }
			delete state[ stateKey ][ k ];
			hasChanges = true;
		}
		stats.hasChanges = stats.hasChanges || hasChanges;
		return finish();
	}
	const currLen = currValue.length;
	const deleteMap = {};
	for( const key of deleteKeys ) {
		let index = +key;
		if( index > currLen ) { continue }
		if( index < 0 ) {
			index = currLen + index;
			if( index < 0 ) { continue }
		}
		deleteMap[ index ] = null;
	}
	const newValue = [];
	let numVisited = 0;
	for( let numDeleted = numVisited, deleteLen = deleteKeys.length; numVisited < currLen; numVisited++ ) {
		if( !( numVisited in deleteMap ) ) {
			newValue.push( currValue[ numVisited ] );
			continue;
		}
		if( ++numDeleted === deleteLen ) {
			numVisited++;
			break;
		}
	}
	if( numVisited < currLen ) {
		newValue.push( ...currValue.slice( numVisited ) );
	}
	if( currLen === newValue.length ) {
		return finish();
	}
	state[ stateKey ].length = 0;
	state[ stateKey ].push( ...newValue );
	stats.hasChanges = true;
	finish();
};

/**
 * Repositions a group contiguous state slice array items.
 * Compatible with state slices of the Array type.
 *
 * @example
 * // given the following state:
 * const state = {name: 'test', nested: {name: 'nested', items: ['a', 'b', 'c', 'd', 'e', 'f'], fn: () => {}}}
 * $move(state.nested, 'items', {hasChanges: false}, {items: {'@@MOVE': [0, 3, 2], ...}, ...}) // moves `state.nested.items` 'a' and 'b' from indexes 0 and 1 to indexes 3 and 4.
 *
 * @type {TagFunction<T, K,  import("../../../types").MoveCommand}>} as in {"@@MOVE": [-/+fromIndex, -/+toIndex, +numItems? ]}. numItems = 1 by default.
 * @template T, K
 */
export const $move = ( state, stateKey, stats, changes ) => {
	const args = changes[ stateKey ][ MOVE_TAG ];
	if( !Array.isArray( args ) || args.length < 2 || !Number.isInteger( args[ 0 ] ) || !Number.isInteger( args[ 1 ] ) ) {
		throw new TypeError( `Invalid entry found at ${ MOVE_TAG } change property: expecting an array of at least 2 integer values [fromIndex, toIndex, numItems]. numItems is optional. Use negative index to count from array end.` );
	}
	const finish = () => finishTagRequest( changes, stateKey, MOVE_TAG );
	const value = state[ stateKey ];
	if( !Array.isArray( value ) ) { return finish() }
	const sLen = value.length;
	if( !sLen ) { return finish() }
	let [ from, to, numItems = 1 ] = args;
	if( !Number.isInteger( numItems ) || numItems < 1 ) { return finish() }
	if( from < 0 ) { from = sLen + from }
	if( from < 0 || from >= sLen ) { return finish() }
	if( to < 0 ) { to = sLen + to }
	if( to < 0 || to >= sLen ) { return finish() }
	if( from === to ) { return finish() }
	const maxTransferLen = sLen - from;
	if( numItems > maxTransferLen ) { numItems = maxTransferLen }
	state[ stateKey ].splice( to, 0, ...value.splice( from, numItems ) );
	stats.hasChanges = true;
	finish();
};

/**
 * Appends new items to state slice array.
 * Compatible with state slices of the Array type.
 * Analogy: Array.prototype.push
 *
 * @example
 * // given the following state:
 * const state = {name: 'test', nested: {name: 'nested', items: ['a', 'b', 'c', 'd', 'e', 'f'], fn: () => {}}}
 * $push(state.nested, 'items', {hasChanges: false}, {items: {'@@PUSH': ['x', 'y', 'z'], ...}, ...}) // sequentially appends 'x', 'y' and 'z' to `state.nested.items`.
 *
 * @type {TagFunction<T, K,  import("../../../types").PushCommand>}
 * @template T, K
 */
export const $push = ( state, stateKey, stats, changes ) => { // preforms array.push on the state[stateKey] array
	const args = changes[ stateKey ][ PUSH_TAG ];
	if( !Array.isArray( args ) ) {
		throw new TypeError( `Invalid entry found at ${ PUSH_TAG } change property: expecting an array of [].pudh(...) compliant argument values.` );
	}
	if( !args.length || !Array.isArray( state[ stateKey ] ) ) {
		return finishTagRequest( changes, stateKey, PUSH_TAG );
	}
	state[ stateKey ].push( ...args );
	stats.hasChanges = true;
	finishTagRequest( changes, stateKey, PUSH_TAG );
};

/**
 * Replaces a state slice with a new value or the return value of a compute function.
 * Compatible with state slices of all types.
 *
 * @example
 * // given the following state:
 * const state = {name: 'test', nested: {name: 'nested', items: ['a', 'b', 'c', 'd', 'e', 'f'], fn: () => {}}}
 * $replace(state, 'name', {hasChanges: false}, {name: {'@@REPLACE': new value, ...}, ...}) // sets `state.name` = new value
 * $replace(state, 'nested', {hasChanges: false}, {nested: {'@@REPLACE': new value, ...}, ...}) // sets `state.nested` = new value
 * $replace(state.nested, 'name', {hasChanges: false}, {name: {'@@REPLACE': new value, ...}, ...}) // sets `state.nested.name` = new value
 * $replace(state.nested, 'items', {hasChanges: false}, {items: {'@@REPLACE': new value, ...}, ...}) // sets `state.nested.items` = new value
 * $replace(state.nested, 'items', {hasChanges: false}, {items: ['a', {'@@REPLACE': new value, ...}, 'c', 'd', 'e', 'f'], ...}) // sets `state.nested.items[2]` = new value
 * $replace(state.nested, 'fn', {hasChanges: false}, {fn: {'@@REPLACE': new value, ...}, ...}) // sets `state.nested.fn` = new value
 * $replace(state.nested.items, 4, {hasChanges: false}, {4: {'@@REPLACE': new value, ...}, ...}) // sets `state.nested.items[4]` = new value
 *
 * @type {TagFunction<T, K,  import("../../../types").ReplaceCommand>}
 * @template T, K
 */
export const $replace = ( state, stateKey, stats, changes ) => {
	applyReplaceCommand( REPLACE_TAG, state, changes, stateKey, stats );
};

/**
 * Replaces a state slice with a new value or the return value of a compute function.
 * Compatible with state slices of all types.
 *
 * @example
 * // given the following state:
 * const state = {name: 'test', nested: {name: 'nested', items: ['a', 'b', 'c', 'd', 'e', 'f'], fn: () => {}}}
 * $set(state, 'name', {hasChanges: false}, {name: {'@@SET': new value OR currentName => new value, ...}, ...}) // sets `state.name` = new value
 * $set(state, 'nested', {hasChanges: false}, {nested: {'@@SET': new value OR currentNested => new value, ...}, ...}) // sets `state.nested` = new value
 * $set(state.nested, 'name', {hasChanges: false}, {name: {'@@SET': new value OR currentName => new value, ...}, ...}) // sets `state.nested.name` = new value
 * $set(state.nested, 'items', {hasChanges: false}, {items: {'@@SET': new value OR currentItems => new value, ...}, ...}) // sets `state.nested.items` = new value
 * $set(state.nested, 'items', {hasChanges: false}, {items: ['a', {'@@SET': new value OR current2nd => new value, ...}, 'c', 'd', 'e', 'f'], ...}) // sets `state.nested.items[2]` = new value
 * $set(state.nested, 'fn', {hasChanges: false}, {fn: {'@@SET': new value OR currentFn => new value, ...}, ...}) // sets `state.nested.fn` = new value
 * $set(state.nested.items, 4, {hasChanges: false}, {4: {'@@SET': new value OR current4th => new value, ...}, ...}) // sets `state.nested.items[4]` = new value
 */
export const $set = (() => {
	const toString = Object.prototype.toString;
	/**
	 * @type {TagFunction<T, K,  import("../../../types").SetCommand<T[K]>}
	 * @template T, K
	 */
	const set = ( state, stateKey, stats, changes ) => {
		if( toString.call( changes[ stateKey ][ SET_TAG ] ) === '[object Function]' ) {
			changes[ stateKey ][ SET_TAG ] = changes[ stateKey ][ SET_TAG ]( clonedeep( state[ stateKey ] ) );
		}
		applyReplaceCommand( SET_TAG, state, changes, stateKey, stats );
	};
	return set;
})();

/**
 * Perform array splice function on a state slice array.
 * Compatible with state slices of the Array type.
 * Analogy: Array.prototype.splice
 *
 * @example
 * // given the following state:
 * const state = {name: 'test', nested: {name: 'nested', items: ['a', 'b', 'c', 'd', 'e', 'f'], fn: () => {}}}
 * $splice(state.nested, 'items', {hasChanges: false}, {items: {'@@SPLICE': [3, 3, 'y', 'z'], ...}, ...}) // replaces 'd', 'e' and 'f' with 'y' and 'z' in `state.nested.items`.
 *
 * @type {TagFunction<T, K,  import("../../../types").SpliceCommand>} as in {"@@SPLICE": [-/+fromIndex, +deleteCount, ...newItems? ]}. newItems = ...[] by default.
 * @template T, K
 */
export const $splice = ( state, stateKey, stats, changes ) => {
	const args = changes[ stateKey ][ SPLICE_TAG ];
	if( !Array.isArray( args ) || args.length < 2 || !Number.isInteger( args[ 0 ] ) || !Number.isInteger( args[ 1 ] ) ) {
		throw new TypeError( `Invalid entry found at ${ SPLICE_TAG } change property: expecting an array of [].splice(...) compliant argument values.` );
	}
	let [ start, deleteCount, ...items ] = args;
	let iLen = items.length;
	const value = state[ stateKey ];
	if( !Array.isArray( value ) || ( deleteCount < 1 && !iLen ) ) {
		return finishTagRequest( changes, stateKey, SPLICE_TAG );
	}
	if( deleteCount > 0 ) {
		const sLen = value.length;
		start = start < 0
			? Math.abs( start ) > sLen ? 0 : sLen + start
			: start > sLen ? sLen : start;
		let maxCount = sLen - start;
		if( maxCount > iLen ) { maxCount = iLen }
		if( maxCount > deleteCount ) { maxCount = deleteCount }
		let numLeftTrimmed = 0;
		for( ; numLeftTrimmed < maxCount; numLeftTrimmed++ ) {
			if( !isEqual( value[ start + numLeftTrimmed ], items[ numLeftTrimmed ] ) ) { break }
		}
		start += numLeftTrimmed;
		items.splice( 0, numLeftTrimmed );
		iLen = items.length;
		deleteCount -= numLeftTrimmed;
	}
	if( deleteCount > 0 || iLen ) {
		state[ stateKey ].splice( start, deleteCount, ...items );
		stats.hasChanges = true;
	}
	finishTagRequest( changes, stateKey, SPLICE_TAG );
};

const tagMap = {
	[ CLEAR_TAG ]: $clear,
	[ DELETE_TAG ]: $delete,
	[ MOVE_TAG ]: $move,
	[ PUSH_TAG ]: $push,
	[ REPLACE_TAG ]: $replace,
	[ SET_TAG ]: $set,
	[ SPLICE_TAG ]: $splice
};

export default tagMap;

/**
 * Confirms tags whose tagResolver which accept no inputs.\
 * Such tags are normally supplied as string values.\
 * When supplied as an object property, the key is extracted: value is discarded.
 *
 * @example
 * // given the following state:
 * const state = {test: some value, testArr: [some value 1, ...], testObj: {testKey: some value, ...}, ...}
 * // we can call setState with closed tags
 * // either as string values:
 * setState(state, {test: "@@CLEAR", testArr: ["@@CLEAR", ...], testObj: {testKey: "@@CLEAR", ...}, ...});
 * // or as object properties:
 * setState(state, {test: {@@CLEAR: some value}, testArr: [{@@CLEAR: some value}, ...], testObj: {testKey: {@@CLEAR: some value}, ...}, ...});
 *
 * @type {(tag: TagKey|BaseType) => boolean}
 */
export const isClosedTag = (() => {
	const NO_PARAM_TAGS = { [ CLEAR_TAG ]: null };
	return tag => tag in NO_PARAM_TAGS;
})();

/**
 * @param {TAG} tag
 * @param {T} state
 * @param {{[K in keyof T]?: {[TAG_1 in TAG]:*}|{[x:string]:*}}} changes
 * @param {keyof T} stateKey
 * @param {Stats} stats
 * @template {State} T
 * @template {TagKey} TAG
 */
function applyReplaceCommand( tag, state, changes, stateKey, stats ) {
	const replacement = changes[ stateKey ][ tag ];
	if( !( isDataContainer( state[ stateKey ] ) &&
			isDataContainer( replacement )
	) ) {
		if( state[ stateKey ] !== replacement ) {
			state[ stateKey ] = replacement;
			stats.hasChanges = true;
		}
		return finishTagRequest( changes, stateKey, tag );
	}
	if( isEqual( state[ stateKey ], replacement ) ) {
		return finishTagRequest( changes, stateKey, tag );
	}
	if( Array.isArray( replacement ) && Array.isArray( state[ stateKey ] ) ) {
		state[ stateKey ].length = replacement.length;
	}
	for( const k in state[ stateKey ] ) {
		if( k in replacement ) {
			state[ stateKey ][ k ] = replacement[ k ];
		} else {
			delete state[ stateKey ][ k ];
		}
	}
	for( const k in replacement ) {
		state[ stateKey ][ k ] = replacement[ k ];
	}
	stats.hasChanges = true;
	finishTagRequest( changes, stateKey, tag );
}

const finishTagRequest = (() => {
	const end = ( changes, key ) => { delete changes[ key ] };
	/**
	 * @param {T} changes
	 * @param {keyof T|number|string|symbol} key
	 * @param {TagKey} tag
	 * @template {State|Array} T
	 */
	const runCloser = ( changes, key, tag ) => {
		if( isClosedTag( tag ) ) { return end( changes, key ) }
		let keyCount = 0;
		for( const k in changes[ key ] ) { // eslint-disable-line no-unused-vars
			if( ++keyCount === 2 ) { return end( changes[ key ], tag ) }
		}
		keyCount = 0;
		for( const k in changes ) { // eslint-disable-line no-unused-vars
			if( ++keyCount === 2 ) { return end( changes[ key ], tag ) }
		}
		end( changes, key );
	};
	return runCloser;
})();

/** @typedef {keyof typeof tagMap} TagKey */

/**
 * @callback TagFunction
 * @param {T} state
 * @param {K} stateKey
 * @param {Stats} stats
 * @param {Array<TAG|BaseType>|T & {[K_1 in K]: TAG & {[x:string]:*}}} [changes]
 * @returns {void}
 * @template {Array|State} T
 * @template {keyof T} K
 * @template {{[K in TagKey]?:*}} TAG
 */

/** @typedef {import("../../../types").State} State */

/** @typedef {import("../../../types").UpdateStats} Stats */

/** @typedef {import("../../../types").BaseType} BaseType */
