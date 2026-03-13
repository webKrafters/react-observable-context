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

import SelectTab from '../../partials/select-tab';

import { UpdateCtx, ValueCtx } from './context';

import {
	calcVersionVModel,
	type Content,
	type SemVer
} from './utils/calc-version-vmodel';

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
	
	const { currentIndex, options } = useMemo(
		() => calcVersionVModel(
			versionOfInterest as SemVer,
			sOptions
		),
		[ sOptions ]
	);

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
