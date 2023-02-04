import clonedeepwith from 'lodash.clonedeepwith';
import _get from 'lodash.get';
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
	const reDelimiter = /[\[\]|\.]+/g;
	const reEndBracketLastChar = /\]$/;
	const reType = /.*\s(\w+)\]$/;
	/** @type {GetProperty<T, PropertyInfo<T>} */
	const fromSource = ( source, key, defaultValue ) => {
		let exists = false;
		let index = +key;
		try {
			if( Array.isArray( source ) ) {
				if( Number.isInteger( index ) ) {
					if( index < 0 ) { index = source.length + index }
					const _value = source[ index ];
					return { _value, exists: index in source, index, key, source, value: _value ?? defaultValue };
				}
			}
			const _value = source[ key ];
			exists = key in source;
			return { _value, exists, index, key, source, value: _value ?? defaultValue };
		} catch( e ) {
			return { _value: defaultValue, exists, index, key, source, value: defaultValue };
		}
	}
	/** @type {(source: State|Array, parentPath: Array) => *} */
	const getImmediateParent = ( source, parentPath ) => {
		const pLen = parentPath.length;
		if( !pLen ) { return source }
		let segmentStart = 0;
		for( let p = segmentStart; p < pLen; p++ ) {
			const key = parentPath[ p ];
			const kNum = +key;
			if( Number.isInteger( kNum ) && kNum < 0 ) {
				source = _get( source, parentPath.slice( segmentStart, p ) );
				segmentStart = p + 1;
				source = fromSource( source, key ).value;
				if( segmentStart === pLen || typeof source === 'undefined' ) { break }
			}
		}
		if( segmentStart === 0 ) { return _get( source, parentPath ) }
		if( segmentStart === pLen || typeof source === 'undefined' ) { return source }
		return _get( source, parentPath.slice( segmentStart, pLen ) );
	};
	/**
	 * An extension of the lodash.get function.
	 *
	 * @type {GetProperty<T, PropertyInfo<T>}
	 * @see lodash.get documentation
	 */
	const getInfo = ( source, path, defaultValue ) => {
		switch( Object.prototype.toString.call( path ).replace( reType, '$1' ) ) {
			case 'String': path = path.replace( reEndBracketLastChar, '' ).split( reDelimiter ); break;
			case 'Array': break;
			default: path = [ path ];
		}
		const key = path.pop();
		return fromSource( getImmediateParent( source, path ), key, defaultValue );
	}
	return getInfo;
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
 * @param {string|symbol|number|Array<string|symbol|number>} path
 * @param {*} [defaultValue]
 * @returns {R}
 * @template {State|Array} [T=State|Array]
 * @template [R=*]
 */

/**
 * @typedef {import("../types").PropertyInfo<T>} PropertyInfo
 * @template {State|Array} T
 */

/** @typedef {import("../types").State} State */
