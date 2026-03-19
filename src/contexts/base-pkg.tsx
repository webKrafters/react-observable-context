import React, {
    Children,
    createContext,
    useEffect,
    useState
} from 'react';

import { SemVer } from '../partials/version-tabs/utils/calc-version-vmodel';

import { basePkgName } from '../../gatsby-config/metadata';

import RedMessageBox from '../partials/msg-box/red-msg-box';

export interface Props { children?: React.ReactNode };

export interface Data { version: SemVer }

export const ValueCtx = createContext<Data>( {} as Data );

const Provider : React.FC<Props> = props => {
    const [ value, setValue ] = useState(() => ( {} as Data ));
    const [ error, setError ] = useState( '' );
    useEffect(() => {
        fetch(
            `https://registry.npmjs.org/${ basePkgName }/latest`
        ).then( r => {
            r.json()
                .then(( v : Record<string, string> ) => {
                    const [ a, ...b ] = v.version.split( '-' );
                    const version = a.split( '.' ).map( i => +i ) as SemVer;
                    b.length && version.push( ...b );
                    setValue({ ...v, version });
                })
                .catch(() => setError( 'Error parsing base package info' ))
        } )
        .catch(() => setError( 'Error fetching base package info' ));
    }, []);
    if( error.length ) {
        return (
            <RedMessageBox>
                { error }.
                <br />
                Please reload later.
            </RedMessageBox> );
    }
    return (
        <ValueCtx.Provider value={ value }>
            { Children.map( props.children, c => c ) }
        </ValueCtx.Provider>
    ); 
};

export default Provider;

