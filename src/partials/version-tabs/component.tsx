import React, {
	FC,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react';

import {
	graphql,
	useStaticQuery
} from 'gatsby';

import SelectTab from '../../partials/select-tab';

import { UpdateCtx, ValueCtx } from '../../contexts/version-of-interest';
import { ValueCtx as BasePkgCtx } from '../../contexts/base-pkg';

import {
	calcVersionVModel,
	eqVersions,
	SEMVER_STR_PREFIX,
	strVersions,
	Version,
	VersionRange,
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
	const { version } = useContext( BasePkgCtx );

	useState(() => versionOfInterest === null && updateVersionOfInterest((
		typeof window !== 'undefined' && !!window.localStorage 
			? ( fromLocalStorage( V_INTEREST_LOCALSTORAGE_KEY ) ?? version ?? defaultValue )
			: version ?? defaultValue
	) as SemVer ));

	const [ shownVersion, setShownVersion ] = useState(() => sanitizeVersion( versionOfInterest, version ));

	useEffect(() => {
		const newVersion = sanitizeVersion( versionOfInterest, version );
		if( eqVersions( newVersion, shownVersion ).equals ) { return }
		localStorage.setItem(
			V_INTEREST_LOCALSTORAGE_KEY,
			( newVersion as SemVer ).join?.( '.' ) ?? versionOfInterest
		);
		setShownVersion( newVersion );
	}, [ versionOfInterest ]);
	
	const { currentIndex, options } = useMemo(
		() => calcVersionVModel( shownVersion as SemVer, sOptions ),
		[ shownVersion, sOptions ]
	);

	const onTabChange = useCallback(({ label } : typeof options[ 0 ]) => {
		let { props: { children: version } } = label as JSX.Element;
		if( !strVersions.includes( version ) ) {
			version = ( version as string ).slice( SEMVER_STR_PREFIX.length ).split( '.' ).map( n => +n );
		}
		!eqVersions( versionOfInterest as SemVer, version ).equals &&
		updateVersionOfInterest( version );
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

function sanitizeVersion(
	versionOfInterest : SemVer|string,
	latestVersion? : SemVer
) : Version;
function sanitizeVersion(
	versionOfInterest : any,
	latestVersion? : any
) : Version {
	let thisVersion : Version = versionOfInterest;
	if( !Array.isArray( thisVersion ) ) { return thisVersion }
	if( !latestVersion || VersionRange.gt(
		thisVersion, latestVersion as SemVer
	) ) { return 'Latest' }
	return thisVersion;
}

