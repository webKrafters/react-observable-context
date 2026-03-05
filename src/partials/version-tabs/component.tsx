import React, { FC, useCallback, useContext, useMemo, useState } from 'react';

import { graphql, useStaticQuery } from 'gatsby';

import SelectTab from '../../partials/select-tab';

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
		let currentIndex : number = 0;
		const options = sOptions.map(( v, i ) => {
			const c = eqVersions( v.version, versionOfInterest as Version );
			if( c.equals ) { currentIndex = i }
			return {
				label: <b>{ !c.isArrayV1 ? v.version : `As of v${ ( v.version as Array<number> ).join( '.' ) }` }</b>,
				value: v.documentation
			};
		});
		return { currentIndex, options };
	}, [ sOptions ]);

	const onTabChange = useCallback(( i : number ) => {
		updateVersionOfInterest( sOptions[ i ].version );
		localStorage.setItem( V_INTEREST_LOCALSTORAGE_KEY, ( sOptions[ i ].version as SemVer ).join?.( '.' ) ?? sOptions[ i ].version );
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
	if( v?.indexOf( '.' ) !== -1 ) {
		const [ w, y, z, ...rest ] = v.split( '.' );
		const ver = [ w, y ];
		const [ v3, ...descStart ] = z.split( '-' );
		ver.push( v3 );
		ver.push( `${ descStart.join( '-' ) }.${ rest.join( '.' ) }` )
		return ver;
	}
	return v;
}
