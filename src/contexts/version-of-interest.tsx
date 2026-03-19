import React, { Children, createContext, useState } from 'react';

import metadata from '../../gatsby-config/metadata';

import { SemVer, Version } from '../partials/version-tabs/utils/calc-version-vmodel';

export interface Props {
    children?: React.ReactNode;
    initValue? : Version;
};

export const UpdateCtx = createContext<React.Dispatch<React.SetStateAction<SemVer|string>>>(()=>{});
export const ValueCtx = createContext<SemVer|string>( null as unknown as string );

const Provider : React.FC<Props> = ({
    children,
    initValue = metadata.versionOfInterest.defaultValue
}) => {
    const [ versionOfInteret, setVersionOfInterest ] = useState( () => initValue );
    
    const t = React.useCallback(( v : any ) => {
        console.info( 'waht is our new version >>>>> ', v );
        setVersionOfInterest( v );
    }, []);
    
    return (
        <UpdateCtx.Provider value={ setVersionOfInterest }>
            <ValueCtx.Provider value={ versionOfInteret }>
                { Children.map( children, c => c ) }
            </ValueCtx.Provider>
        </UpdateCtx.Provider>
    );
};

export default Provider;
