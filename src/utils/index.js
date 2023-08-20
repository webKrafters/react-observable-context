import clonedeepwith from 'lodash.clonedeepwith';
import isPlainObject from 'lodash.isplainobject';

import checkEligibility from './clonedeep-eligibility-check';

import get from '@webkrafters/get-property';

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
					continue;
				}
				// superset check
				pathTokens.every(( p, i ) => p === superPathTokens[ i ]) &&
				replacedSuperPaths.push( superPath );
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

export const getProperty = get;

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

/** @type {Tranform} */
const defaultFormatValue = ({ value }) => value;

/** @type {(path: string) => string} */
export const stringToDotPath = (() => {
	const BRACKET_OPEN = /\.?\[/g;
	const BRACKET_CLOSE = /^\.|\]/g;
	return path => path.replace( BRACKET_OPEN, '.' ).replace( BRACKET_CLOSE, '' );
})();

/**
 * Pulls propertyPath values from state and compiles them into a partial state object
 *
 * @param {T} source
 * @param {Array<string>} propertyPaths
 * @param {Tranform} [transform] - transforms value
 * @returns {{[K in keyof T]?:*}}
 * @template {{[x: string]:*}} T
 */
export function mapPathsToObject( source, propertyPaths, transform = defaultFormatValue ) {
	const paths = [];
	for( const path of propertyPaths ) {
		paths.push( stringToDotPath( path ) );
	}
	const dest = {};
	let object = dest;
	for( const path of arrangePropertyPaths( paths ) ) {
		const property = getProperty( source, path );
		if( !property.exists ) { continue }
		for( let tokens = path.split( '.' ), tLen = tokens.length, t = 0; t < tLen; t++ ) {
			const token = tokens[ t ];
			if( t + 1 === tLen ) {
				object[ token ] = transform( property );
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

/** @typedef {(property: import("@webkrafters/get-property").PropertyInfo) => T} Tranform */
