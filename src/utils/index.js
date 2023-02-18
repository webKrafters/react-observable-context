import clonedeepwith from 'lodash.clonedeepwith';
import isPlainObject from 'lodash.isplainobject';

import checkEligibility from './clonedeep-eligibility-check';

/**
 * Curates the most inclusive propertyPaths from a list of property paths.
 * @example
 * arrangePropertyPaths(["a.b.c.d", "a.b", "a.b.z[4].w", "s.t"]) => ["a.b", "s.t"].
 * "a.b" is inclusive of "a.b.c.d": "a.b.c.d" is a subset of "a.b." but not vice versa.
 * "a.b" is inclusive of "a.b.z[4].w": "a.b.z[4].w" is a subset of "a.b." but not vice versa.
 *
 * @param {Array<string>} propertyPaths
 * @returns {Array<string>}
 */
export function arrangePropertyPaths( propertyPaths ) {
	/** @type {{[propertyPath: string]: Array<string>}} */
	const superPathTokensMap = {};
	for( const path of propertyPaths ) {
		const pathTokens = path
			.replace( /\[([0-9]+)\]/g, '.$1' )
			.replace( /^\./, '' )
			.split( /\./ );
		L2: {
			const replacedSuperPaths = [];
			for( const superPath in superPathTokensMap ) {
				const superPathTokens = superPathTokensMap[ superPath ];
				// self/subset check
				if( superPathTokens.length <= pathTokens.length ) {
					if( superPathTokens.every(( p, i ) => p === pathTokens[ i ]) ) {
						break L2;
					}
				} else {
					// superset check
					pathTokens.every(( p, i ) => p === superPathTokens[ i ]) &&
					replacedSuperPaths.push( superPath );
				}
			}
			superPathTokensMap[ path ] = pathTokens;
			for( const path of replacedSuperPaths ) {
				delete superPathTokensMap[ path ];
			}
		}
	}
	return Object.keys( superPathTokensMap );
};

/**
 * Built on top of lodash.clonedeepwith.\
 * Instances of non-native classes not implementing either the `clone` or the `cloneNode
 * methods may not be cloneable. Such instances are retured uncloned.
 */
export const clonedeep = (() => {
	/**
	 * @param {T} value
	 * @param {Function} [customizer]
	 * @returns {R}
	 * @template T, R
	 */
	const clone = ( value, customizer = v => {
		if( v === null ) { return }
		if( typeof v === 'object' ) {
			if( 'clone' in v && typeof v.clone === 'function' ) { return v.clone() }
			if( 'cloneNode' in v && typeof v.cloneNode === 'function' ) { return v.cloneNode( true ) }
		}
		if( !checkEligibility( v ).isEligible ) { return v }
	}) => clonedeepwith( value, customizer );
	/**
	 * @param {T} value
	 * @returns {R}
	 * @template T, R
	 */
	const clonedeep = value => clone( value );
	return clonedeep;
})();

export const getProperty = (() => {
	const RE_DELIMITER = /[\[\]|\.]+/g;
	const RE_END_BRACKET_LAST_CHAR = /\]$/;
	const RE_TYPE = /.*\s(\w+)\]$/;
	const toString = Object.prototype.toString;
	const hasEntry = ( key, object ) => { try { return key in object } catch( e ) { return false } };
	/**
	 * An extension of the lodash.get function.
	 *
	 * @type {GetProperty<T>}
	 * @see lodash.get documentation
	 */
	const get = ( source, path, defaultValue ) => {
		switch( toString.call( path ).replace( RE_TYPE, '$1' ) ) {
			case 'String': path = path.replace( RE_END_BRACKET_LAST_CHAR, '' ).split( RE_DELIMITER ); break;
			case 'Array': break;
			case 'Undefined': path = []; break;
			default: path = [ path ];
		}
		let _value = source;
		let exists = true;
		let index = NaN;
		const trail = [];
		for( const p of path ) {
			index = NaN;
			if( Array.isArray( _value ) ) {
				let _index = +p;
				if( Number.isInteger( _index ) ) {
					if( _index < 0 ) { _index = _value.length + _index }
					index = _index
					if( index in _value ) {
						source = _value;
						_value = _value[ index ];
						trail.push( index );
						continue;
					}
				}
			}
			source = _value;
			if( !hasEntry( p, _value ) ) {
				exists = false;
				_value = undefined;
				break;
			}
			_value = _value[ p ];
			trail.push( p );
		}
		return {
			_value, // actual value found
			exists, // true when property path was found in object
			index, // holds a sanitized key corresponding to an index where the parent is an array and the key is alphanumeric integer
			isSelf: !path.length, // where no property path was supplied: this results in _value === source param
			key: path?.[ path.length - 1 ],
			source: path.length && path.length - trail.length < 2 ? source : undefined, // parent containing the property at key
			trail, // farthest valid property/sub property path found
			value: _value ?? defaultValue // value returned
		};
	};
	return get;
})();

/**
 * Checks if value is either a plain object or an array
 *
 * @returns {boolean}
 */
export function isDataContainer( v ) { return isPlainObject( v ) || Array.isArray( v ) }

/**
 * Converts argument to readonly.
 *
 * Note: Mutates original argument.
 *
 * @param {T} v
 * @returns {Readonly<T>}
 * @template T
 */
export function makeReadonly( v ) {
	let frozen = true;
	if( isPlainObject( v ) ) {
		for( const k in v ) { makeReadonly( v[ k ] ) }
		frozen = Object.isFrozen( v );
	} else if( Array.isArray( v ) ) {
		const vLen = v.length;
		for( let i = 0; i < vLen; i++ ) { makeReadonly( v[ i ] ) }
		frozen = Object.isFrozen( v );
	}
	!frozen && Object.freeze( v );
	return v;
};

/**
 * Pulls propertyPath values from state and compiles them into a partial state object
 *
 * @param {T} source
 * @param {Array<string>} propertyPaths
 * @returns {{[K in keyof T]?:*}}
 * @template {{[x: string]:*}} T
 */
export function mapPathsToObject( source, propertyPaths ) {
	const paths = [];
	for( const path of propertyPaths ) {
		paths.push( path.replace( /\.?\[/g, '.' ).replace( /^\.|\]/g, '' ) );
	}
	const dest = {};
	let object = dest;
	for( const path of arrangePropertyPaths( paths ) ) {
		const { exists, value } = getProperty( source, path );
		if( !exists ) { continue }
		for( let tokens = path.split( '.' ), tLen = tokens.length, t = 0; t < tLen; t++ ) {
			const token = tokens[ t ];
			if( t + 1 === tLen ) {
				object[ token ] = value;
				object = dest;
				break;
			}
			if( !( token in object ) ) {
				object[ token ] = {};
			}
			object = object[ token ];
		}
	}
	return dest;
}

/**
 * @callback GetProperty
 * @param {T} source
 * @param {KeyType|Array<KeyType>} [path]
 * @param {*} [defaultValue]
 * @returns {PropertyInfo<T>}
 * @template {State|Array} [T=State|Array]
 */

/**
 * @typedef {import("../types").PropertyInfo<T>} PropertyInfo
 * @template {State|Array} T
 */

/** @typedef {import("../types").State} State */

/** @typedef {import("../types").KeyType} KeyType */
