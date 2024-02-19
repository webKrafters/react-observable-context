import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';

import { clientOnly$, serverOnly$ } from 'vite-env-only';

import MoonFilled from '@ant-design/icons/MoonFilled';
import SunFilled from '@ant-design/icons/SunFilled';

import { Button } from 'antd';

import { DARKMODE_LOCALSTORAGE_KEY } from '~/constants';

import storage from '~/util/universal-storage';

import { useLoaderData as useRootLoaderData } from '~/root';

import './style.css';

export interface Props {
    defaultValue?: boolean;
    onChange?: (isDarkMode: boolean) => void;
};

let MoonFilledIcon : typeof MoonFilled;
let SunFilledIcon : typeof SunFilled;

clientOnly$((() => {
    MoonFilledIcon = MoonFilled;
    SunFilledIcon = SunFilled;
})());

serverOnly$((() => {
    MoonFilledIcon = ( MoonFilled as any ).default;
    SunFilledIcon = ( SunFilled as any ).default;
})());

const selectCurrentIcon = ( isDarkMode: boolean ) => isDarkMode
    ? ( <MoonFilledIcon suppressHydrationWarning /> )
    : ( <SunFilledIcon /> );

const Component = forwardRef<HTMLElement, Props>(({ defaultValue, onChange }, ref ) => {

    const loadContext = useRootLoaderData();

    const [ isDark, setModeFlag ] = useState(() => {
        if( typeof defaultValue !== 'undefined' ) { return defaultValue }
        if( typeof window === 'undefined' ) { return true }
        const mode = storage.getItem( DARKMODE_LOCALSTORAGE_KEY, loadContext );
        const flag = mode === 'true';
        return flag;
    });

    const onClick = useCallback(() => setModeFlag( f => {
        const flag = !f;
        typeof window !== 'undefined' &&
        storage.setItem( DARKMODE_LOCALSTORAGE_KEY, `${ flag }` );
        return flag;
    } ), [ onChange ]);

    const [ currentIcon, setCurrentIcon ] = useState(() => selectCurrentIcon( isDark ));
    
    useEffect(() => {
        setCurrentIcon( selectCurrentIcon( isDark ) );
        onChange?.( isDark );
    }, [ isDark ]);

    useEffect(() => {
        defaultValue !== isDark && 
        typeof defaultValue !== 'undefined' &&
        setModeFlag( defaultValue );
    }, [ defaultValue ]);

    return (
        <Button
            className="dark-mode-settings"
            icon={ currentIcon }
            onClick={ onClick }
            ref={ ref }
            shape="circle"
        />
    );
} );
Component.displayName = 'DarkModeSetting';

export default Component;