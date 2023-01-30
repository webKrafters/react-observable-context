import isEqual from 'lodash.isequal';
import isPlainObject from 'lodash.isplainobject';

import { clonedeep, isDataContainer } from '../../utils';

import tagFunctions, { isClosedTag } from './tag-functions';

export default setState;

/** @param {{[x:string]: any}} obj */
function isIndexBasedObj( obj ) {
	for( const k in obj ) {
		if( !( k in tagFunctions || Number.isInteger( +k ) ) ) {
			return false;
		}
	}
	return true;
}

/**
 * Mutates its arguments
 *
 * @param {HasArrayRoot<K>|HasObjectRoot<K>} state
 * @param {HasArrayRoot<K>|HasObjectRoot<K>} changes
 * @param {K} stateKey
 * @param {Stats} stats
 * @returns {Array<TagKey>}
 * @template {KeyType} K
 */
function resolveTags( state, changes, stateKey, stats ) {
	const resolvedTags = [];
	if( isClosedTag( changes[ stateKey ] ) ) {
		changes[ stateKey ] = { [ changes[ stateKey ] ]: null };
	}
	if( !isDataContainer( changes[ stateKey ] ) ) { return resolvedTags }
	for( const k in changes[ stateKey ] ) {
		if( !( stateKey in changes ) ) { break }
		if( isClosedTag( changes[ stateKey ][ k ] ) ) {
			changes[ stateKey ][ k ] = { [ changes[ stateKey ][ k ] ]: null };
		}
		if( k in tagFunctions ) {
			tagFunctions[ k ]( state, stateKey, stats, changes );
			resolvedTags.push( k );
		}
	}
	return resolvedTags;
}

/**
 * Mutates its arguments
 *
 * @param {HasObjectRoot} state
 * @param {HasObjectRoot} changes
 * @param {Stats} stats
 */
function set( state, changes, stats ) {
	for( const k in changes ) {
		setAtomic( state, changes, k, stats );
	}
}

/**
 * Mutates its arguments
 *
 * @param {HasArrayRoot<K>} state
 * @param {HasArrayRoot<K>} changes
 * @param {K} rootKey
 * @param {Stats} stats
 * @template {KeyType} K
 */
function setArray( state, changes, rootKey, stats ) {
	const nsLength = changes[ rootKey ].length;
	if( state[ rootKey ].length !== nsLength ) {
		state[ rootKey ].length = nsLength;
		stats.hasChanges = true;
	}
	for( let i = 0; i < nsLength; i++ ) {
		setAtomic( state[ rootKey ], changes[ rootKey ], i, stats );
	}
}

/**
 * Mutates its arguments
 *
 * @param {HasArrayRoot<K>} state
 * @param {HasObjectRoot<K>} changes
 * @param {K} rootKey
 * @param {Stats} stats
 * @template {KeyType} K
 */
function setArrayIndex( state, changes, rootKey, stats ) {
	const incomingIndexes = [];
	for( const k in changes[ rootKey ] ) {
		let index = +k;
		if( index < 0 ) {
			index = state[ rootKey ].length + index;
			changes[ rootKey ][ index ] = changes[ rootKey ][ k ];
			delete changes[ rootKey ][ k ];

		}
		index >= 0 && incomingIndexes.push( index );
	}
	const maxIncomingIndex = Math.max( ...incomingIndexes );
	if( maxIncomingIndex >= state[ rootKey ].length ) { // capture all newly created state array indexes into `changed` list
		state[ rootKey ].length = maxIncomingIndex + 1;
		stats.hasChanges = true;
	}
	for( const i of incomingIndexes ) {
		setAtomic( state[ rootKey ], changes[ rootKey ], i, stats );
	}
}

/**
 * Mutates its arguments
 *
 * @param {HasArrayRoot<K>|HasObjectRoot<K>} state
 * @param {HasArrayRoot<K>|HasObjectRoot<K>} changes
 * @param {K} stateKey
 * @param {Stats} stats
 * @template {KeyType} K
 */
function setAtomic( state, changes, stateKey, stats ) {
	if( isEqual( state[ stateKey ], changes[ stateKey ] ) ) { return }
	const tagsResolved = resolveTags( state, changes, stateKey, stats );
	const isPlainObjectNewState = isPlainObject( changes[ stateKey ] );
	const isArrayNewState = Array.isArray( changes[ stateKey ] );
	if( Array.isArray( state[ stateKey ] ) ) {
		if( isArrayNewState ) {
			return setArray( state, changes, stateKey, stats );
		}
		if( isPlainObjectNewState && isIndexBasedObj( changes[ stateKey ] ) ) {
			return setArrayIndex( state, changes, stateKey, stats );
		}
	}
	if( isPlainObjectNewState && isPlainObject( state[ stateKey ] ) ) {
		return setPlainObject( state, changes, stateKey, stats )
	}
	if( tagsResolved.length || !( stateKey in changes ) ) { return };
	stats.hasChanges = true;
	state[ stateKey ] = isArrayNewState || isPlainObjectNewState
		? clonedeep( changes[ stateKey ] )
		: changes[ stateKey ];
}

/**
 * Mutates its arguments
 *
 * @param {HasObjectRoot<K>} state
 * @param {HasObjectRoot<K>} changes
 * @param {K} rootKey
 * @param {Stats} stats
 * @template {KeyType} K
 */
function setPlainObject( state, changes, rootKey, stats ) {
	set( state[ rootKey ], changes[ rootKey ], stats );
}

/**
 * @param {T} state
 * @param {UpdatePayload<PartialState<T>>} changes
 * @param {Listener<T>} [onStateChange]
 * @template {State} T
 */
function setState( state, changes, onStateChange ) {
	const stats = { hasChanges: false };
	const changeRequest = { state: clonedeep( changes ) };
	set( { state }, changeRequest, stats );
	stats.hasChanges && onStateChange?.( changes );
}

/** @typedef {import("./tag-functions").TagKey} TagKey */

/**
 * @typedef {HasRoot<K, Array<*>>} HasArrayRoot
 * @template {KeyType} [K=string]
 */

/**
 * @typedef {HasRoot<K, {[x: string]: *}>} HasObjectRoot
 * @template {KeyType} [K=string]
 */

/**
 * @typedef  {K extends number
 * 		? {[rootKey: number]: T} | [T]
 * 		: K extends string
 * 		? {[rootKey: string]: T}
 * 		: {[rootKey: symbol]: T}
 * } HasRoot
 * @template {KeyType} [K=string]
 * @template T
 */

/** @typedef {import("../../types").KeyType} KeyType */

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

/** @typedef {import("../../types").UpdateStats} Stats */
