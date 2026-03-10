import React, {
	FC,
	useCallback,
	useContext,
	useMemo,
	useState
} from 'react';

import {
	graphql,
	useStaticQuery
} from 'gatsby';

import SelectTab, {
	Content as SelectOption
} from '../../partials/select-tab';

import { UpdateCtx, ValueCtx } from './context';

export type SemVer = [number, number, number, string?];
export type Version = SemVer|'Legacy'|'Latest';

export interface Content {
	version : Version;
	documentation : React.ReactNode;
}

export type Props = Omit<JSX.IntrinsicElements[ "div" ], "children"> & {
	options : Array<Content>
}

const strVersions = Object.freeze([ 'Latest', 'Legacy' ]);

const VersionTabs : FC<Props> = ({ options: sOptions, ...props }) => {

	const { site: { siteMetadata: { versionOfInterest: {
		defaultValue,
		key: V_INTEREST_LOCALSTORAGE_KEY
	} } } } = useStaticQuery(
		graphql`
			query VersionOfInterestInfo {
				site {
					siteMetadata {
						versionOfInterest {
							defaultValue,
							key
						}
					}
				}
			}
		`
	);
	
	const updateVersionOfInterest = useContext( UpdateCtx );
	const versionOfInterest = useContext( ValueCtx );
	
	useState(() => {
		versionOfInterest === null && updateVersionOfInterest(
			typeof window !== 'undefined' && !!window.localStorage 
				? ( fromLocalStorage( V_INTEREST_LOCALSTORAGE_KEY ) ?? defaultValue )
				: defaultValue
		);
	});
	
	const { currentIndex, options } = useMemo(() => {
		let res : {
			currentIndex : number;
			options : Array<SelectOption>;
		} = { currentIndex: -1, options: [] } ;
		res.options = sOptions.map(( v, i ) => {
			const r : SelectOption = {
				label: null,
				value: v.documentation
			};
			if( res.currentIndex > -1 ) {
				r.label = ( <b>{ !Array.isArray( v.version ) ? v.version : `As of v${ ( v.version as Array<number> ).join( '.' ) }` }</b> );
			} else {
				const c = eqVersions( v.version, versionOfInterest as Version );
				if( c.equals ) { res.currentIndex = i }
				r.label = ( <b>{ !c.isArrayV1 ? v.version : `As of v${ ( v.version as Array<number> ).join( '.' ) }` }</b> );
			}
			return r;
		});
		if( res.currentIndex > -1 ) { return res }
		const SEMVER_LEN = 3;
		if( versionOfInterest === strVersions[ 0 ] ) {
			let closestVer = [ 0, 0, 0 ];
			for( let s = 0, sLen = sOptions.length; s < sLen; s++ ) {
				if( sOptions[ s ].version === strVersions[ 1 ] ) { continue }
				const version = sOptions[ s ].version as Array<number>;
				for( let v = 0; v < SEMVER_LEN; v++ ) {
					if( version[ v ] === closestVer[ v ] ) { continue }
					if( version[ v ] > closestVer[ v ] ) {
						closestVer = version.slice( 0, SEMVER_LEN );
						res.currentIndex = s;
					}
					break;
				}
			}
			return res;
		}
		if( versionOfInterest === strVersions[ 1 ] ) {
			let closestVer = [ 0, 0, 0 ];
			for( let s = 0, sLen = sOptions.length; s < sLen; s++ ) {
				if( sOptions[ s ].version === strVersions[ 0 ] ) { continue }
				const version = sOptions[ s ].version as Array<number>;
				for( let v = 0; v < SEMVER_LEN; v++ ) {
					if( version[ v ] === closestVer[ v ] ) { continue }
					if( version[ v ] < closestVer[ v ] ) {
						closestVer = version.slice( 0, SEMVER_LEN );
						res.currentIndex = s;
					}
					break;
				}
			}
			return res;
		}
		const semverOfInterest = versionOfInterest as unknown as Array<number>;
		let closestVer = [ 0, 0, 0 ];
		const strVerIndex = { Latest: -1, Legacy: -1 };
		const verRange = new VersionRange();
		for( let s = 0, sLen = sOptions.length; s < sLen; s++ ) {
			for( const v of strVersions ) {
				if( sOptions[ s ].version === v ) {
					strVerIndex[ v ] = s;
					continue;
				}
			}
			const version = sOptions[ s ].version as Array<number>;
			if( version[ 0 ] > semverOfInterest[ 0 ] ) {
				verRange.value = [ s, version as SemVer ];
				continue;
			}
			const sameVerTable : Array<boolean> = [];
			for( let v = 0; v < SEMVER_LEN; v++ ) {
				sameVerTable.push( version[ v ] === semverOfInterest[ v ] );
				if( version[ v ] === closestVer[ v ] ) { continue }
				if( v === 0 ) {
					closestVer = version.slice( 0, SEMVER_LEN );
					verRange.value = [ s, version as SemVer ];
					res.currentIndex = s;
					continue;
				}
				for( let tLen = sameVerTable.length - 1, t = 0; t < tLen; t++ ) {
					if( !sameVerTable[ t ] ) {
						if( version[ v ] > closestVer[ v ] ) {
							closestVer = version.slice( 0, SEMVER_LEN );
							res.currentIndex = s;
						}
						break;
					} 
				}
				if( res.currentIndex === s ) { continue }
				if( version[ v ] > closestVer[ v ] && version[ v ] < semverOfInterest[ v ] ) {
					closestVer = version.slice( 0, SEMVER_LEN );
					res.currentIndex = s;
				}
			}
		}
		if( res.currentIndex !== -1 ) { return res }
		if( verRange.info.max.index !== -1 && VersionRange.gt(
			semverOfInterest as SemVer,
			verRange.info.max.value
		) ) {
			res.currentIndex = strVerIndex.Latest === -1
				? verRange.info.max.index
				: strVerIndex.Latest;
		} else if( verRange.info.min.index === -1 ) {
			if( strVerIndex.Legacy !== -1 ) {
				res.currentIndex = strVerIndex.Legacy;
			}
		} else if( VersionRange.lt(
			semverOfInterest as SemVer,
			verRange.info.min.value
		) ) {
			res.currentIndex = strVerIndex.Legacy === -1
				? verRange.info.min.index
				: strVerIndex.Legacy;
		} else if( strVerIndex.Latest !== -1 ) {
			res.currentIndex = strVerIndex.Latest;
		}
		return res;
	}, [ sOptions ]);

	const onTabChange = useCallback(( i : number ) => {
		if( i === currentIndex ) { return }
		updateVersionOfInterest( sOptions[ i ].version );
		localStorage.setItem( V_INTEREST_LOCALSTORAGE_KEY, ( sOptions[ i ].version as SemVer ).join?.( '.' ) ?? sOptions[ i ].version );
		location.hash &&
		document.getElementById(
			location.hash.slice( 1 )
		)?.scrollIntoView({ 
			behavior: 'smooth',
			block: 'start'
		});
	}, [ sOptions ]);

	return ( <SelectTab { ...{ currentIndex, onTabChange, options, ...props } } /> );
};

export default VersionTabs;

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

export function fromLocalStorage( storageKey : string ) {
	let v = localStorage.getItem( storageKey ) as string;
	if( !!v && v.indexOf( '.' ) !== -1 ) {
		const [ w, y, z, ...rest ] = v.split( '.' );
		const ver = [ w, y ];
		const [ v3, ...descStart ] = z.split( '-' );
		ver.push( v3 );
		descStart.length && ver.push(
			`${ descStart.join( '-' ) }.${ rest.join( '.' ) }`
		);
		return ver;
	}
	return v;
}

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
	private _max = { index: -1, value: [ 0, 0, 0 ] as SemVer };
	private _min = { index: -1, value: [ 0, 0, 0 ] as SemVer };
	get info () { return { max: this._max, min: this._min } }
	set value([ index, value ] : [ number, SemVer ] ) {
		if( VersionRange.gt( value, this._max.value ) ) {
			this._max = { index, value };
		} else if( VersionRange.lt( value, this._min.value ) ) {
			this._min = { index, value };
		}
	}
}
