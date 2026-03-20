import pkgJson from '../package.json';

export const basePkgName = '@webkrafters/react-observable-context';

export const NO_SIDER_URI_PATTERN = /^$/; // /^(?:\/(?:quick-start\/?)?(?:\?.*)?)?$/;

export default {
    _24Hours: 8.64e7,
    contact: pkgJson.author.email,
    copyright: 'This website is a copyright of webKrafters Inc. 2024-Present',
    darkmode: {
        defaultValue: true,
        key: 'DKM-E'
    },
    description: pkgJson.description,
    device: {
        backgroundColor: '#22222f',
        maxWidth: {
            handheldPortait: 991
        },
        themeColor: '#da4'
    },
    language: 'en',
    siteUrl: 'https://react-observable-context.js.org',
    title: pkgJson.name
        .replace( /-dev$/i, '-jS' )
        .split( /-+/ )
        .map(( t : string ) => `${ t[ 0 ].toUpperCase() }${ t.substring( 1 ) }` )
        .join( ' ' ),
    url: {
        demo: `https://codesandbox.io/s/github/${ basePkgName.slice( 1 ) }-app`,
        npm: `https://www.npmjs.com/package/${ basePkgName }`,
        repo: `https://github.com/${ basePkgName.slice( 1 ) }.js.git`,
        site: pkgJson.homepage
    },
    versionOfInterest: {
        defaultValue: 'Latest',
        key: 'VEROI-E'
    },
};
