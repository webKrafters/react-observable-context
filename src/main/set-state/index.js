// @debug
// import isEmpty from 'lodash.isempty';

import isEqual from 'lodash.isequal';
import isPlainObject from 'lodash.isplainobject';

import {
	CLEAR_TAG,
	DELETE_TAG,
	MOVE_TAG,
	REPLACE_TAG,
	SPLICE_TAG
} from '../../constants';

import { clonedeep, getProperty, isDataContainer } from '../../utils';

export default setState;

/**
 * @param {T} state
 * @param {UpdatePayload<PartialState<T>>} newState
 * @param {Listener<T>} [onStateChange]
 * @template {State} T
 */
function setState( state, newState, onStateChange ) {
	const stats = { hasChanges: false };
	// const _newState = clonedeep( newState );

	// @debug
	// resolveTags( { state }, { state: _newState }, 'state', stats ) ||
	// set( state, _newState, stats );
	set( { state }, { state: newState }, stats );

	// @debug 1
	// console.info( '@ @ @ @ @ @ @ @ @ @ @ @ @ @ STATS > > > > > > > > > > > > >', stats );

	stats.hasChanges && onStateChange?.( newState );
}

/**
 * Mutates its arguments
 *
 * @param {HasObjectRoot} state
 * @param {HasObjectRoot} newState
 * @param {Stats} stats
 */
function set( state, newState, stats ) {
	for( const k in newState ) {
		setAtomic( state, newState, k, stats );
	}
}

/**
 * Mutates its arguments
 *
 * @param {HasArrayRoot<K>|HasObjectRoot<K>} state
 * @param {HasArrayRoot<K>|HasObjectRoot<K>} newState
 * @param {K} stateKey
 * @param {Stats} stats
 * @template {KeyTypes} K
 */
function setAtomic( state, newState, stateKey, stats ) {

	// @debug
	// stateKey !== 'state' &&
	// console.info( '- - - - - - - - SETTING ATOMIC WITH > > > > > > ', {
	// 	stateKey, stats, isCommand: stateKey in tagResolver, state, newState
	// } );

	if(( stateKey in tagResolver && !isRecursiveTag( stateKey )) ||
		isEqual( state[ stateKey ], newState[ stateKey ] )
	) { return }
	const tagsResolved = resolveTags( state, newState, stateKey, stats );

	const isPlainObjectNewState = isPlainObject( newState[ stateKey ] );
	const isArrayNewState = Array.isArray( newState[ stateKey ] );
	if( Array.isArray( state[ stateKey ] ) ) {
		if( isArrayNewState ) {
			return setArray( state, newState, stateKey, stats );
		}
		if( isPlainObjectNewState && isIndexBasedObj( newState[ stateKey ] ) ) {
			return setArrayIndex( state, newState, stateKey, stats );
		}
	}
	if( isPlainObjectNewState && isPlainObject( state[ stateKey ] ) ) {
		return setPlainObject( state, newState, stateKey, stats )
	}

	// @debug
	// ( newState[ stateKey ] in tagResolver || stateKey in tagResolver ) &&
	// console.info( '>>>>>>>>>>> ', { stateKey, friends: state.friends, newState, isCommand: stateKey in tagResolver });
	// @debug
	// console.info( '>>>>>>>>>>> ', { stateKey, friends: state.friends, newFriends: newState.friends, isCommand: stateKey in tagResolver });

	// @debug
	// if( newState[ stateKey ] === CLEAR_TAG ) {
	// 	return resolveTags( state, { [ stateKey ]: newState[ stateKey ] }, stateKey, stats );
	// }
	// if( stateKey in tagResolver ) { return } // already resolved

	// @debug 1
	// console.info( '>>>>>>>>>>> ', { stateKey, tagsResolved, stats, state, newState });

	if( tagsResolved.length || !( stateKey in newState ) ) { return };

	stats.hasChanges = true;
	state[ stateKey ] = isArrayNewState || isPlainObjectNewState
		? clonedeep( newState[ stateKey ] )
		: newState[ stateKey ];
}

/**
 * Mutates its arguments
 *
 * @param {HasArrayRoot<K>|HasObjectRoot<K>} state
 * @param {HasArrayRoot<K>|HasObjectRoot<K>} newState
 * @param {K} stateKey
 * @param {Stats} stats
 * @returns {Array<TagKey>}
 * @template {KeyTypes} K
 */
function resolveTags( state, newState, stateKey, stats ) {

	// @debug
	// stateKey !== 'state' &&
	// console.info( '+ + + + + + + + ENTERING RESOLVE TAGS WITH > > > > > > ', {
	// 	stateKey, stats, isCommand: stateKey in tagResolver, state, newState
	// } );

	const resolvedTags = [];

	if( isClosedTag( newState[ stateKey ] ) ) {
		newState[ stateKey ] = { [ newState[ stateKey ] ]: null };
	}
	if( !isDataContainer( newState[ stateKey ] ) ) { return resolvedTags }
	// if( !( stateKey in state ) && CLEAR_TAG in newState[ stateKey ] ) {

	// 	// @debug
	// 	// console.info( '@ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ REMOVING UNNECESSARY CLEAR TAG @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @' );

	// 	delete newState[ stateKey ];

	// 	// @debug
	// 	// stateKey !== 'state' &&
	// 	// console.info( '- - - - - - - - EXITING RESOLVE TAGS WITH > > > > > > ', {
	// 	// 	stateKey, stats, isCommand: stateKey in tagResolver, state, newState
	// 	// } );

	// 	return resolvedTags;
	// }
	for( const k in newState[ stateKey ] ) {

		// @debug
		// console.info( ' >>->->->->->> ', JSON.stringify({ stateKey, stats, tag: k, changes: newState[ stateKey ], state }, null, 2 ));

		if( isClosedTag( newState[ stateKey ][ k ] ) ) {
			newState[ stateKey ][ k ] = { [ newState[ stateKey ][ k ] ]: null };
		}
		if( k in tagResolver ) {

			// @debug
			// console.info( ' >>>>>> ', JSON.stringify({ stateKey, stats, tag: k, changes: newState[ stateKey ], state }, null, 2 ));

			tagResolver[ k ]( state, stateKey, stats, newState );
			resolvedTags.push( k );

			// @debug
			// console.info( ' <><><><> ', JSON.stringify({ stateKey, stats, tag: k, changes: newState[ stateKey ], state }, null, 2 ));

			newState[ stateKey ] = state[ stateKey ];

			// @debug
			// console.info( ' <<<<<< ', JSON.stringify({ stateKey, stats, tag: k, changes: newState[ stateKey ], state }, null, 2 ));

		}
	}

	// @debug
	// stateKey !== 'state' &&
	// console.info( '- - - - - - - - EXITING RESOLVE TAGS WITH > > > > > > ', {
	// 	stateKey, stats, isCommand: stateKey in tagResolver, state, newState
	// } );

	return resolvedTags;

}

/**
 * Mutates its arguments
 *
 * @param {HasObjectRoot<K>} state
 * @param {HasObjectRoot<K>} newState
 * @param {K} rootKey
 * @param {Stats} stats
 * @template {KeyTypes} K
 */
function setPlainObject( state, newState, rootKey, stats ) {
	set( state[ rootKey ], newState[ rootKey ], stats );
}

/**
 * Mutates its arguments
 *
 * @param {HasArrayRoot<K>} state
 * @param {HasArrayRoot<K>} newState
 * @param {K} rootKey
 * @param {Stats} stats
 * @template {KeyTypes} K
 */
function setArray( state, newState, rootKey, stats ) {
	const nsLength = newState[ rootKey ].length;
	if( state[ rootKey ].length !== nsLength ) {
		state[ rootKey ].length = nsLength;
		stats.hasChanges = true;
	}
	for( let i = 0; i < nsLength; i++ ) {
		setAtomic( state[ rootKey ], newState[ rootKey ], i, stats );
	}
}

/**
 * Mutates its arguments
 *
 * @param {HasArrayRoot<K>} state
 * @param {HasObjectRoot<K>} newState
 * @param {K} rootKey
 * @param {Stats} stats
 * @template {KeyTypes} K
 */
function setArrayIndex( state, newState, rootKey, stats ) {
	const incomingIndexes = [];
	for( const k in newState[ rootKey ] ) {
		let index = +k;
		if( index < 0 ) { index = state[ rootKey ].length + index }
		index >= 0 && incomingIndexes.push( index );
	}
	const maxIncomingIndex = Math.max( ...incomingIndexes );
	if( maxIncomingIndex >= state[ rootKey ].length ) { // capture all newly created state array indexes into `changed` list
		state[ rootKey ].length = maxIncomingIndex + 1;
		stats.hasChanges = true;
	}
	for( const i of incomingIndexes ) {
		setAtomic( state[ rootKey ], newState[ rootKey ], i, stats );
	}
}

/** @param {{[x:string]: any}} obj */
const isIndexBasedObj = obj => {
	for( const k in obj ) {
		if( !( k in tagResolver || Number.isInteger( +k ) ) ) {
			return false;
		}
	}
	return true;
}

/**
 * Confirms tags whose tagResolver which accept no inputs.\
 * Such tags are normally supplied as string values.\
 * When supplied as an object property, the key is extracted: value is discarded.
 *
 * @example
 * where state = {test: some value, testArr: [some value 1, ...], testObj: {testKey: some value, ...}, ...}
 * // we can call setState with:
 * setState(state, {test: "@@CLEAR", testArr: ["@@CLEAR", ...], testObj: {testKey: "@@CLEAR", ...}, ...}); // closed tags as string values
 * setState(state, {test: {@@CLEAR: some value}, testArr: [{@@CLEAR: some value}, ...], testObj: {testKey: {@@CLEAR: some value}, ...}, ...}); // same closed tags as object properties
 *
 * @type {(tag: TagKey|string|number) => boolean}
 */
const isClosedTag = (() => {
	const NO_PARAM_TAGS = { [ CLEAR_TAG ]: null };
	return tag => tag in NO_PARAM_TAGS;
})();

/** @type {(tag: TagKey|string|number) => boolean} */
const isRecursiveTag = (() => {
	const RECURSIVE_TAGS = { [ REPLACE_TAG ]: null };
	return tag => tag in RECURSIVE_TAGS;
})();

/**
 * @param {T} changes
 * @param {keyof T|number} key
 * @template {State|Array} T
 */
function closeChangeRequest( changes, key ) {
	if( isDataContainer( changes ) ) {
		delete changes[ key ];
	}
}

const tagResolver = Object.freeze({
	/** @type {TagFunction<T>} */
	[ CLEAR_TAG ]: (() => {
		const defaultPredicate = () => true;
		const hasItems = ( state, stateKey ) => state[ stateKey ].length;
		const setDefault = ( state, stateKey, stats, newState, predicate = defaultPredicate, value = null ) => {
			if( !predicate( state, stateKey, stats ) ) { return closeChangeRequest( newState, stateKey ) }
			state[ stateKey ] = value;
			stats.hasChanges = true;
		};
		return ( state, stateKey, stats, newState ) => {
			if( !( stateKey in state ) ) { return closeChangeRequest( newState, stateKey ) }
			const value = state[ stateKey ];
			if( typeof value === 'undefined' || value === null ) { return closeChangeRequest( newState, stateKey ) }
			if( isPlainObject( value ) ) {
				let hasChanges = false;
				for( const k in value ) { // remove properties singularly b/c where state === the setState `state` argument, we may not change its reference
					delete state[ stateKey ][ k ];
					hasChanges = true;
				}
				stats.hasChanges = stats.hasChanges || hasChanges;
				return;
			}
			const type = value.constructor.name;
			if( type === 'String' ) { return setDefault( state, stateKey, stats, newState, hasItems, '' ) }
			if( type === 'Array' ) { return setDefault( state, stateKey, stats, newState, hasItems, [] ) }
			setDefault( state, stateKey, stats, newState );
		}
	})(),
	/** @type {TagFunction<T>} */
	[ DELETE_TAG ]: ( state, stateKey, stats, newState ) => {
		const deleteKeys = newState[ stateKey ][ DELETE_TAG ];
		if( !Array.isArray( deleteKeys ) ) {
			throw new TypeError( `Invalid entry found at ${ DELETE_TAG } change property: requires an array of state keys to delete.` );
		}
		let hasChanges = false;
		for( const k of deleteKeys ) {
			if( !getProperty( state[ stateKey ], k ).exists ) { continue }
			delete state[ stateKey ][ k ];
			hasChanges = true;
		}
		stats.hasChanges = stats.hasChanges || hasChanges;
	},
	/** @type {TagFunction<T>} */
	[ MOVE_TAG ]: ( state, stateKey, stats, newState ) => { // moves a state[stateKey] array item from index 'a' to index 'b'
		const args = newState[ stateKey ][ MOVE_TAG ];
		if( !Array.isArray( args ) || !args.length === 2 || !Number.isInteger( args[ 0 ] ) || !Number.isInteger( args[ 1 ] ) ) {
			throw new TypeError( `Invalid entry found at ${ MOVE_TAG } change property: expecting an array of at least 2 integer values [fromIndex, toIndex, numItems]. numItems is optional. Use negative index to count from array end.` );
		}
		const close = () => {
			let args = [ newState, stateKey ];
			let keyCount = 0;
			for( const k in newState ) { // eslint-disable-line no-unused-vars
				if( ++keyCount === 2 ) {
					args = [ newState[ stateKey ], MOVE_TAG ];
					break;
				}
			}
			closeChangeRequest( ...args );
		}
		const value = state[ stateKey ];
		if( !Array.isArray( value ) ) { return close() }
		const sLen = value.length;
		if( !sLen ) { return }
		let [ from, to, numItems = 1 ] = args;
		if( !Number.isInteger( numItems ) || numItems < 1 ) { return close() }
		if( from < 0 ) { from = sLen + from }
		if( from < 0 || from >= sLen ) { return close() }
		if( to < 0 ) { to = sLen + to }
		if( to < 0 || to >= sLen ) { return close() }
		if( from === to ) { return close() }
		const maxTransferLen = sLen - from;
		if( numItems > maxTransferLen ) { numItems = maxTransferLen }
		state[ stateKey ].splice( to, 0, ...value.splice( from, numItems ) );
		stats.hasChanges = true;
		close();
	},
	/** @type {TagFunction<T>} */
	[ REPLACE_TAG ]: ( state, stateKey, stats, newState ) => {
		const currState = { [ stateKey ]: clonedeep( state[ stateKey ] ) };
		setAtomic( currState, { [ stateKey ]: newState[ stateKey ][ REPLACE_TAG ] }, stateKey, { hasChanges: false } );
		if( isEqual( state, currState ) ) { return closeChangeRequest( newState, stateKey ) }
		stats.hasChanges = true;
		state[ stateKey ] = currState[ stateKey ];

		// const changes = newState[ stateKey ][ REPLACE_TAG ];
		// if( !isPlainObject( changes ) || isEmpty( changes ) ) {
		// 	state[ stateKey ] = changes;
		// } else {
		// 	for( const k in changes ) {
		// 		state[ stateKey ][ k ] = changes[ k ];
		// 	}
		// }
		// stats.hasChanges = true;
	},
	/** @type {TagFunction<T>} */
	[ SPLICE_TAG ]: ( state, stateKey, stats, newState ) => { // preforms array.splice on the state[stateKey] array
		const args = newState[ stateKey ][ SPLICE_TAG ];
		if( !Array.isArray( args ) || args.length < 2 || !Number.isInteger( args[ 0 ] ) || !Number.isInteger( args[ 1 ] ) ) {
			throw new TypeError( `Invalid entry found at ${ SPLICE_TAG } change property: expecting an array of [].splice(...) compliant argument values.` );
		}
		let [ start, deleteCount, ...items ] = args;
		const value = state[ stateKey ];
		if( !Array.isArray( value ) || ( deleteCount < 1 && !items.length ) ) {
			return closeChangeRequest( newState, stateKey );
		}
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
			if( start === sLen && !items.length ) {
				return closeChangeRequest( newState, stateKey );
			}
			deleteCount -= d;
		}
		if( deleteCount > 0 || items.length ) {
			state[ stateKey ].splice( start, deleteCount, ...items );
			stats.hasChanges = true;
		}
		closeChangeRequest( newState, stateKey );
	}
});

/** @typedef {keyof typeof tagResolver} TagKey */

/**
 * @typedef {HasRoot<K, Array<*>>} HasArrayRoot
 * @template {KeyTypes} [K=string]
 */

/**
 * @typedef {HasRoot<K, {[x: string]: *}>} HasObjectRoot
 * @template {KeyTypes} [K=string]
 */

/**
 * @typedef  {K extends number
 * 		? {[rootKey: number]: T} | [T]
 * 		: K extends string
 * 		? {[rootKey: string]: T}
 * 		: {[rootKey: symbol]: T}
 * } HasRoot
 * @template {KeyTypes} [K=string]
 * @template T
 */

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

/** @typedef {number|string|symbol} KeyTypes */

/**
 * @typedef {import("../../types").Listener<T>} Listener
 * @template {State} T
 */

/**
 * @typedef {import("../../types").UpdatePayload<T>} UpdatePayload
 * @template T
 */

/**
 * @typedef {import("../../types").PartialState<T>} PartialState
 * @template {State} T
 */

/** @typedef {import("../../types").State} State */

/** @typedef {{hasChanges: boolean}} Stats */
