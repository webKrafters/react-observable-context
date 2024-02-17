import { useCallback, useEffect, useState } from 'react';

import { clientOnly$, serverOnly$ } from 'vite-env-only';

import MoonFilled from '@ant-design/icons/MoonFilled';
import SunFilled from '@ant-design/icons/SunFilled';

import { Button } from 'antd';

import { DARKMODE_LOCALSTORAGE_KEY } from '~/constants';

import storage from '~/util/universal-storage';

import { useLoaderData as useRootLoaderData } from '~/root';

import './style.css';

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
    ? ( <MoonFilledIcon style={{ color: '#fff', fontSize: '1.35rem' }} suppressHydrationWarning /> )
    : ( <SunFilledIcon style={{ color: '#fb8', fontSize: '2rem' }} /> );

const Component : React.FC<{
    defaultValue?: boolean,
    onChange?: (isDarkMode: boolean) => void
}> = ({ defaultValue, onChange }) => {

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
    
    useEffect(() => { setCurrentIcon( selectCurrentIcon( isDark ) ) }, [ isDark ]);

    useEffect(() => onChange?.( isDark ), [ isDark ]);

    return (
        <Button
            className="dark-mode-settings"
            icon={ currentIcon }
            onClick={ onClick }
            shape="circle"
        />
    );
  };
  Component.displayName = 'DarkModeSetting';

  export default Component;