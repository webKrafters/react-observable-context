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

export const $clear = (() => {
	const defaultPredicate = () => true;
	const hasItems = ( state, stateKey ) => state[ stateKey ].length;
	const setDefault = ( state, stateKey, stats, newState, predicate = defaultPredicate, value = null ) => {
		if( predicate( state, stateKey, stats ) ) {
			state[ stateKey ] = value;
			stats.hasChanges = true;
		}
		finishTagRequest( newState, stateKey, CLEAR_TAG );
	};
	/** @type {TagFunction<T>} */
	const clear = ( state, stateKey, stats, newState ) => {
		if( !( stateKey in state ) ) { return finishTagRequest( newState, stateKey, CLEAR_TAG ) }
		const value = state[ stateKey ];
		if( typeof value === 'undefined' || value === null ) { return finishTagRequest( newState, stateKey, CLEAR_TAG ) }
		if( isPlainObject( value ) ) {
			let hasChanges = false;
			for( const k in value ) { // remove properties singularly b/c where state === the setState `state` argument, we may not change its reference
				delete state[ stateKey ][ k ];
				hasChanges = true;
			}
			stats.hasChanges = stats.hasChanges || hasChanges;
			return finishTagRequest( newState, stateKey, CLEAR_TAG );
		}
		const type = value.constructor.name;
		if( type === 'String' ) { return setDefault( state, stateKey, stats, newState, hasItems, '' ) }
		if( type === 'Array' ) { return setDefault( state, stateKey, stats, newState, hasItems, [] ) }
		setDefault( state, stateKey, stats, newState );
	};
	return clear;
})();

export const $set = (() => {
	const toString = Object.prototype.toString;
	/** @type {TagFunction<T>} */
	const set = ( state, stateKey, stats, newState ) => {
		if( toString.call( newState[ stateKey ][ SET_TAG ] ) === '[object Function]' ) {
			newState[ stateKey ][ SET_TAG ] = newState[ stateKey ][ SET_TAG ]( clonedeep( state[ stateKey ] ) );
		}
		applyReplaceCommand( SET_TAG, state, newState, stateKey, stats );
	};
	return set;
})();

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
 * @type {(tag: TagKey|string|number) => boolean}
 */
export const isClosedTag = (() => {
	const NO_PARAM_TAGS = { [ CLEAR_TAG ]: null };
	return tag => tag in NO_PARAM_TAGS;
})();

/**
 * Removes items from state slices.
 * Compatible with state slices of the Array and POJO property types.
 *
 * @example
 * // given the following state:
 * const state = {name: 'test', nested: {name: 'nested', items: ['a', 'b', 'c', 'd', 'e', 'f']}}
 * $delete(state, 'nested', {hasChanges: false}, {'@@DELETE': ['name']}) // removes the `name` property from `state.nested`
 * $delete(state.nested, 'items', {hasChanges: false}, {'@@DELETE': [0,2,3]}) // removes 'a', 'c' and 'd' from `state.nested.items`
 *
 * @type {TagFunction<T>}
 */
export function $delete( state, stateKey, stats, newState ) {
	let deleteKeys = newState[ stateKey ][ DELETE_TAG ];
	if( !Array.isArray( deleteKeys ) ) {
		throw new TypeError( `Invalid entry found at ${ DELETE_TAG } change property: requires an array of state keys to delete.` );
	}
	const finish = () => finishTagRequest( newState, stateKey, DELETE_TAG );
	if( !deleteKeys.length ) { return finish() }
	deleteKeys = Array.from( new Set( deleteKeys ) );
	let hasChanges = false;
	const currValue = state[ stateKey ];
	if( !Array.isArray( currValue ) ) {
		for( const k of deleteKeys ) {
			if( !getProperty( currValue, k ).exists ) { continue }
			delete state[ stateKey ][ k ];
			hasChanges = true;
		}
		stats.hasChanges = stats.hasChanges || hasChanges;
		return finish();
	}
	const deleteMap = {};
	for( const key of deleteKeys ) { deleteMap[ key ] = true }
	const newValue = [];
	let numVisited = 0;
	for( let numDeleted = numVisited, deleteLen = deleteKeys.length, currLen = currValue.length; numVisited <= currLen; numVisited++ ) {
		if( !( numVisited in deleteMap ) ) {
			newValue.push( currValue[ numVisited ] );
			continue;
		}
		if( ++numDeleted === deleteLen ) { break }
	}
	if( numVisited < currValue.length ) { newValue.push( ...currValue.slice( numVisited ) ) }
	if( currValue.length === newValue.length ) {
		return finish();
	}
	state[ stateKey ].length = 0;
	state[ stateKey ].push( ...newValue );
	stats.hasChanges = true;
	finish();
}

/** @type {TagFunction<T>} */
export function $move( state, stateKey, stats, newState ) { // moves a state[stateKey] array item from index 'a' to index 'b'
	const args = newState[ stateKey ][ MOVE_TAG ];
	if( !Array.isArray( args ) || !args.length === 2 || !Number.isInteger( args[ 0 ] ) || !Number.isInteger( args[ 1 ] ) ) {
		throw new TypeError( `Invalid entry found at ${ MOVE_TAG } change property: expecting an array of at least 2 integer values [fromIndex, toIndex, numItems]. numItems is optional. Use negative index to count from array end.` );
	}
	const finish = () => finishTagRequest( newState, stateKey, MOVE_TAG );
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
}

/** @type {TagFunction<T>} */
export function $push( state, stateKey, stats, newState ) { // preforms array.push on the state[stateKey] array
	const args = newState[ stateKey ][ PUSH_TAG ];
	if( !Array.isArray( args ) ) {
		throw new TypeError( `Invalid entry found at ${ PUSH_TAG } change property: expecting an array of [].pudh(...) compliant argument values.` );
	}
	const finish = () => finishTagRequest( newState, stateKey, PUSH_TAG );
	if( !args.length || !Array.isArray( state[ stateKey ] ) ) { return finish() }
	state[ stateKey ].push( ...args );
	stats.hasChanges = true;
	finish();
}

/** @type {TagFunction<T>} */
export function $replace( state, stateKey, stats, newState ) {
	applyReplaceCommand( REPLACE_TAG, state, newState, stateKey, stats );
}

/** @type {TagFunction<T>} */
export function $splice( state, stateKey, stats, newState ) { // preforms array.splice on the state[stateKey] array
	const args = newState[ stateKey ][ SPLICE_TAG ];
	if( !Array.isArray( args ) || args.length < 2 || !Number.isInteger( args[ 0 ] ) || !Number.isInteger( args[ 1 ] ) ) {
		throw new TypeError( `Invalid entry found at ${ SPLICE_TAG } change property: expecting an array of [].splice(...) compliant argument values.` );
	}
	let [ start, deleteCount, ...items ] = args;
	const value = state[ stateKey ];
	const finish = () => finishTagRequest( newState, stateKey, SPLICE_TAG );
	if( !Array.isArray( value ) || ( deleteCount < 1 && !items.length ) ) { return finish() }
	if( deleteCount > 0 ) {
		const sLen = value.length;
		start = start < 0
			? Math.abs( start ) > sLen ? 0 : sLen + start
			: start > sLen ? sLen : start;
		let maxCount = sLen - start;
		if( maxCount > items.length ) { maxCount = items.length }
		if( maxCount > deleteCount ) { maxCount = deleteCount }
		let d = 0;
		for( ; d < maxCount; d++ ) {
			if( !isEqual( value[ start + d ], items[ d ] ) ) { break }
		}
		start += d;
		items.splice( 0, d );
		if( start === sLen && !items.length ) { return finish() }
		deleteCount -= d;
	}
	if( deleteCount > 0 || items.length ) {
		state[ stateKey ].splice( start, deleteCount, ...items );
		stats.hasChanges = true;
	}
	finish();
}

/**
 * @type {TagFunction<T>}
 * @template T
 */
function applyReplaceCommand( tag, state, newState, stateKey, stats ) {
	const replacement = newState[ stateKey ][ tag ];
	if( !isDataContainer( replacement ) ) {
		if( state[ stateKey ] !== replacement ) {
			state[ stateKey ] = replacement;
			stats.hasChanges = true;
		}
		return finishTagRequest( newState, stateKey, tag );
	}
	if( isEqual( state[ stateKey ], replacement ) ) {
		return finishTagRequest( newState, stateKey, tag );
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
	finishTagRequest( newState, stateKey, tag );
}

const finishTagRequest = (() => {
	const end = ( changes, key ) => {
		if( isDataContainer( changes ) ) {
			delete changes[ key ];
		}
	};
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
 * @param {T & {[K_1 in K]: State & {[K_2 in keyof T[K_1]]: T[K_1][K_2]}}} [newState]
 * @returns {void}
 * @template {State} T
 * @template {keyof T} [K=keyof T]
 */

/** @typedef {import("../../../types").State} State */

/** @typedef {import("../../set-state").Stats} Stats */
