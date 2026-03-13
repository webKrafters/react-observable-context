

import type { Content as SelectOption } from '../../select-tab';

export type SemVer = [number, number, number, string?];
export type Version = SemVer|"Legacy"|"Latest";

export interface Content {
	version : Version;
	documentation : React.ReactNode;
}

export interface VersionVModel {
	currentIndex : number;
	options : Array<SelectOption>;
}

import React from 'react';

const strVersions = Object.freeze([ 'Latest', 'Legacy' ]);

class VersionRange {
	static gt( a : SemVer, b : SemVer ){
		for( let i = 0; i < 3; i++ ) {
			if( a[ i ] === b[ i ] ) { continue }
			return ( a[ i ] as number ) > ( b[ i ] as number );
		}
		return false;
	}
	static lt( a : SemVer, b : SemVer ){
		for( let i = 0; i < 3; i++ ) {
			if( a[ i ] === b[ i ] ) { continue }
			return ( a[ i ] as number ) < ( b[ i ] as number );
		}
		return false;
	}
	static isEmpty( a : SemVer ) { return a.every( t => t === 0 )  }
	private _max = { index: -1, value: [ 0, 0, 0 ] as SemVer };
	private _min = { index: -1, value: [ 0, 0, 0 ] as SemVer };
	get info () { return { max: this._max, min: this._min } }
	set value([ index, value ] : [ number, SemVer ] ) {
		const emptyMinVal = VersionRange.isEmpty( this._min.value );
		if( VersionRange.gt( value, this._max.value ) ) {
			const currMax = this._max;
			this._max = { index, value };
			if( emptyMinVal || VersionRange.lt(
				currMax.value, this._min.value
			) ) {
				this._min = currMax;
			}
		}
		if( emptyMinVal || VersionRange.lt( value, this._min.value ) ) {
			const currMin = this._min;
			this._min = { index, value };
			if( VersionRange.gt( currMin.value, this._max.value ) ) {
				this._max = currMin;
			}
		}
	}
}

export function calcVersionVModel(
	currVersion : "Latest",
	contents : Array<Content>
) : VersionVModel;
export function calcVersionVModel(
	currVersion : "Legacy",
	contents : Array<Content>
) : VersionVModel;
export function calcVersionVModel(
	currVersion : SemVer,
	contents : Array<Content>
) : VersionVModel;
export function calcVersionVModel(
	currVersion : any,
	contents : Array<Content>
) : VersionVModel {
	let res : VersionVModel = { currentIndex: -1, options: [] } ;
	res.options = contents.map(( v, i ) => {
		const r : SelectOption = {
			label: null,
			value: v.documentation
		};
		if( res.currentIndex > -1 ) {
			r.label = ( <b>{ !Array.isArray( v.version ) ? v.version : `As of v${ ( v.version as Array<number> ).join( '.' ) }` }</b> );
		} else {
			const c = eqVersions( v.version, currVersion );
			if( c.equals ) { res.currentIndex = i }
			r.label = ( <b>{ !c.isArrayV1 ? v.version : `As of v${ ( v.version as Array<number> ).join( '.' ) }` }</b> );
		}
		return r;
	});
	if( res.currentIndex > -1 ) { return res }
	if( currVersion === strVersions[ 0 ] ) {
		res.currentIndex = calcNearestStrVersionIndex( contents, ( a, b ) => a > b );
		return res;
	}
	if( currVersion === strVersions[ 1 ] ) {
		res.currentIndex = calcNearestStrVersionIndex( contents, ( a, b ) => a < b );
		return res;
	}
	let closestVer = [ 0, 0, 0 ];
	const strVerIndex : Record<string, number> = { Latest: -1, Legacy: -1 };
	const verRange = new VersionRange();
	for( let s = 0, sLen = contents.length; s < sLen; s++ ) {
		{
			const version = contents[ s ].version as string;
			if( strVersions.includes( version ) ) {
				strVerIndex[ version ] = s;
				continue;
			}
		}
		const version = contents[ s ].version as Array<number>;
		if( VersionRange.gt( version as SemVer, currVersion ) ) {
			verRange.value = [ s, version as SemVer ];
			continue;
		}
		const sameVerTable : Array<boolean> = [];
		const SEMVER_LEN = 3;
		const newVerInfo = { index: -1, version: closestVer };
		for( let v = 0; v < SEMVER_LEN; v++ ) {
			sameVerTable.push( version[ v ] === currVersion[ v ] );
			if( version[ v ] === newVerInfo.version[ v ] ) { continue }
			if( v === 0 ) {
				newVerInfo.version = version.slice( 0, SEMVER_LEN );
				verRange.value = [ s, version as SemVer ];
				newVerInfo.index = s;
				continue;
			}
			for( let tLen = sameVerTable.length - 1, t = 0; t < tLen; t++ ) {
				if( !sameVerTable[ t ] ) {
					if( version[ v ] > newVerInfo.version[ v ] ) {
						newVerInfo.version = version.slice( 0, SEMVER_LEN );
						newVerInfo.index = s;
					}
					break;
				} 
			}
			if( newVerInfo.index === s ) { continue }
			if( version[ v ] > newVerInfo.version[ v ] && version[ v ] < currVersion[ v ] ) {
				newVerInfo.version = version.slice( 0, SEMVER_LEN );
				newVerInfo.index = s;
			}
		}
		if( newVerInfo.index === -1 || !VersionRange.gt(
			newVerInfo.version as SemVer, closestVer as SemVer
		)) { continue }
		res.currentIndex = newVerInfo.index;
		closestVer = newVerInfo.version;
	}
	if( verRange.info.max.index !== -1 && VersionRange.gt(
		currVersion, verRange.info.max.value
	) ) {
		res.currentIndex = strVerIndex.Latest === -1
			? verRange.info.max.index
			: strVerIndex.Latest;
	} else if( verRange.info.min.index !== -1 && VersionRange.lt(
		currVersion, verRange.info.min.value
	) ) {
		res.currentIndex = strVerIndex.Legacy === -1
			? verRange.info.min.index
			: strVerIndex.Legacy;
	}
	return res;
}

function eqVersions<
	COMPARER extends Version = "Latest",
	COMPRAHEND extends Version = "Latest"
>( v1 : COMPARER, v2 : COMPRAHEND ) {
	const isArrV1 = Array.isArray( v1 );
	const isArrV2 = Array.isArray( v2 );
	if( isArrV1 ) {
		return {
			equals: isArrV2 && v1.every(( v, i ) =>  v === v2[ i ]),
			isArrayV1: true
		};
	}
	const res =  { isArrayV1: false };
	if( isArrV2 ) { return { equals: false, ...res } }
	return { equals: v1 as string === v2 as string, ...res };
}

function calcNearestStrVersionIndex(
	options : Array<Content>,
	compare : ( a : number, b : number ) => boolean
) : number {
	let closestVer = [ 0, 0, 0 ];
	for( let s = 0, sLen = options.length; s < sLen; s++ ) {
		if( options[ s ].version === strVersions[ 1 ] ) { continue }
		const version = options[ s ].version as Array<number>;
		for( let SEMVER_LEN = 3, v = 0; v < SEMVER_LEN; v++ ) {
			if( version[ v ] === closestVer[ v ] ) { continue }
			if( compare( version[ v ], closestVer[ v ] ) ) {
				closestVer = version.slice( 0, SEMVER_LEN );
				return s;
			}
			break;
		}
	}
	return -1;
}
