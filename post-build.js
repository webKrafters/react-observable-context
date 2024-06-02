var fs = require( 'fs' );
var path = require( 'path' );
var promisify = require( 'util' ).promisify;

var pkgJson = require( './package.json' );

var copyFile = promisify( fs.copyFile );
var read = promisify( fs.readFile );
var write = promisify( fs.writeFile );

var LOGO_FILENAME = 'logo.png';
var LOGO_SOURCEPATH = path.join( 'docs-dev', 'src', 'images', LOGO_FILENAME.replace( /([.])/, '_compressed$1' ) );
var fOpts = { encoding: 'utf8' };

Promise
    .allSettled([
        read( LOGO_SOURCEPATH, fOpts ),
        read( LOGO_FILENAME, fOpts )
    ])
    .then(([ officialLogo, appLogo ]) => {
        if( officialLogo.reason ) {
            throw new Error( officialLogo.reason );
        }
        if( appLogo.reason ) { appLogo.value = '' }
        appLogo.value !== officialLogo.value &&
        copyFile( LOGO_SOURCEPATH, LOGO_FILENAME );
        updateNpmWhitelist();
    })
    .catch( e => {
        console.log( 'FAILED TO COMPLETE BUILD -- SORRY!', e );
    } );

function updateNpmWhitelist() {
    var npmWhitelist = [ 'logo.png' ];
    var entries = fs.readdirSync( 'dist', {
        ...fOpts, recursive: true, withFileTypes: true
    } );
    for( let e = entries.length; e --; ) {
        let t = entries[ e ];
        if( !t.isFile() ) { continue }
        let ePath = path.join( t.path, t.name );
        ePath.indexOf( 'test' ) === -1 &&
        npmWhitelist.push( ePath );
    }
    pkgJson.files = npmWhitelist;
    write( 'package.json', JSON.stringify( pkgJson, null, 2 ), fOpts );
}
