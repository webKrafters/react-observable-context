import React, { Children, createContext, useState } from 'react';

import metadata from '../../../gatsby-config/metadata';

import { SemVer, Version } from './component';

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

    // @debug
    const setter = React.useCallback(( ...args : any[] ) => {
        console.info( 'ARGS TO CONTEXT >>>>> ', args );
        // @ts-expect-error
        setVersionOfInterest( ...args );
    }, []);

    return (
        // @debug
        // <UpdateCtx.Provider value={ setVersionOfInterest }>
        <UpdateCtx.Provider value={ setter }>
            <ValueCtx.Provider value={ versionOfInteret }>
                { Children.map( children, c => c ) }
            </ValueCtx.Provider>
        </UpdateCtx.Provider>
    );
};

export default Provider;
