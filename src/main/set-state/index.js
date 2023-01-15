import clonedeep from 'lodash.clonedeep';
import has from 'lodash.has';
import isEmpty from 'lodash.isempty';
import isEqual from 'lodash.isequal';
import isPlainObject from 'lodash.isplainobject';

import {
	CLEAR_TAG,
	DELETE_TAG,
	REPLACE_TAG
} from '../../constants';

export default setState;

/**
 * @param {T} state
 * @param {UpdatePayload<PartialState<T>>} newState
 * @param {Listener<T>} [onStateChange]
 * @template {State} T
 */
function setState( state, newState, onStateChange ) {
	const stats = { hasChanges: false };
	setSummaryInvoked( { state }, { state: newState }, 'state', stats ) ||
	set( state, newState, stats );
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
	if( setSummaryInvoked( state, newState, stateKey, stats ) ||
		isEqual( state[ stateKey ], newState[ stateKey ] )
	) { return }
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
 * @template {KeyTypes} K
 */
function setSummaryInvoked( state, newState, stateKey, stats ) {
	let mountedClearTag = false;
	if( newState[ stateKey ] === CLEAR_TAG ) {
		mountedClearTag = true;
		newState[ stateKey ] = { [ CLEAR_TAG ]: null };
	}
	const isSet = isSummarilySet( state, newState, stateKey, stats );
	if( mountedClearTag ) {
		newState[ stateKey ] = CLEAR_TAG;
	}
	return isSet;
}

/**
 * @param {T} state
 * @param {T & {K: State & {[B in keyof T[K]]: T[K][B]}}} newState
 * @param {K} stateKey
 * @param {Stats} stats
 * @returns {boolean}
 * @template {State} T
 * @template {keyof T} K
 */
function isSummarilySet( state, newState, stateKey, stats ) {
	let isSet = false;
	for( const k in newState[ stateKey ] ) {
		if( k in summarySetters ) {
			const usedSetter = summarySetters[ k ]( state, stateKey, stats, newState );
			isSet = isSet || usedSetter;
		}
	}
	return isSet;
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
	const incomingIndexes = Object.keys( newState[ rootKey ] ).map( i => +i );
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
const isIndexBasedObj = obj => Object.keys( obj ).every( k => {
	const i = +k;
	return Number.isInteger( i ) && i > -1
} );

const summarySetters = Object.freeze({
	/** @type {SummarySetter<T>} */
	[ CLEAR_TAG ]: ( state, stateKey, stats ) => {
		if( !( stateKey in state ) ) { return true }
		const value = state[ stateKey ];
		if( isPlainObject( value ) ) {
			let hasChanges = false;
			for( const k in value ) {
				delete state[ stateKey ][ k ];
				hasChanges = true;
			}
			stats.hasChanges = stats.hasChanges || hasChanges;
			return true;
		}
		if( Array.isArray( value ) ) {
			if( !value.length ) { return true }
			state[ stateKey ] = [];
			stats.hasChanges = true;
			return true;
		}
		state[ stateKey ] = null;
		stats.hasChanges = true;
		return true;
	},
	/** @type {SummarySetter<T>} */
	[ DELETE_TAG ]: ( state, stateKey, stats, newState ) => {
		const deleteKeys = newState[ stateKey ][ DELETE_TAG ];
		if( !Array.isArray( deleteKeys ) ) {
			throw TypeError( `Invaid entry found at ${ DELETE_TAG } change property: requires an array of state keys to delete.` );
		}
		let hasChanges = false;
		for( const k of deleteKeys ) {
			if( !has( state[ stateKey ], k ) ) { continue }
			delete state[ stateKey ][ k ];
			hasChanges = true;
		}
		stats.hasChanges = stats.hasChanges || hasChanges;
		return true;
	},
	/** @type {SummarySetter<T>} */
	[ REPLACE_TAG ]: ( state, stateKey, stats, newState ) => {
		const changes = newState[ stateKey ][ REPLACE_TAG ];
		if( !isPlainObject( changes ) || isEmpty( changes ) ) {
			state[ stateKey ] = changes;
		} else {
			for( const k in changes ) {
				state[ stateKey ][ k ] = changes[ k ];
			}
		}
		stats.hasChanges = true;
		return true;
	}
});

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
 * @callback SummarySetter
 * @param {T} state
 * @param {K} stateKey
 * @param {Stats} stats
 * @param {T & {K: State & {[B in keyof T[K]]: T[K][B]}}} [newState]
 * @returns {boolean}
 * @template {State} T
 * @template {keyof T} K
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
