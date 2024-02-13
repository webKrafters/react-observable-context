import { useCallback, useEffect, useState } from 'react';

import { clientOnly$, serverOnly$ } from 'vite-env-only';

import MoonFilled from '@ant-design/icons/MoonFilled';
import SunFilled from '@ant-design/icons/SunFilled';

import { Button } from 'antd';
import { DARKMODE_LOCALSTORAGE_KEY } from '~/constants';

let localStorage : Storage|undefined;
let MoonFilledIcon : typeof MoonFilled;
let SunFilledIcon : typeof SunFilled;

clientOnly$((() => {
    localStorage = window?.localStorage;
    MoonFilledIcon = MoonFilled;
    SunFilledIcon = SunFilled;
})());

serverOnly$((() => {
    MoonFilledIcon = ( MoonFilled as any ).default;
    SunFilledIcon = ( SunFilled as any ).default;
})());

const selectCurrentIcon = ( isDarkMode: boolean ) => isDarkMode
    ? ( <MoonFilledIcon style={{ color: '#fff', fontSize: '1.35rem' }} /> )
    : ( <SunFilledIcon style={{ color: '#fb8', fontSize: '2rem' }} /> );

const Component : React.FC<{
    defaultValue?: boolean,
    onChange?: (isDarkMode: boolean) => void
}> = ({ defaultValue, onChange }) => {
    const [ BTN_STYLE ] = useState(() => ({
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        marginLeft: '2rem'
    }));
    const [ isDark, setModeFlag ] = useState(() => {
        if( typeof defaultValue !== 'undefined' ) {
            return defaultValue;
        }
        if( typeof window === 'undefined' ) {
            onChange?.( true );
            return true;
        }
        const mode = window.localStorage.getItem( DARKMODE_LOCALSTORAGE_KEY );
        const flag = mode === 'true';
        onChange?.( flag );
        return flag;
    });

    const [ currentIcon, setCurrentIcon ] = useState(() => selectCurrentIcon( isDark ));
    
    useEffect(() => { setCurrentIcon( selectCurrentIcon( isDark ) ) }, [ isDark ]);

    const onClick = useCallback(() => setModeFlag( f => {
        const flag = !f;
        typeof window !== 'undefined' &&
        window.localStorage?.setItem(
            DARKMODE_LOCALSTORAGE_KEY,
            !flag ? 'false' : 'true'
        );
        onChange?.( flag );
        return flag;
    } ), [ onChange ]);

    return (
        <Button
            icon={ currentIcon }
            onClick={ onClick }
            style={ BTN_STYLE }
        />
    );
  };
  Component.displayName = 'DarkModeSetting';

  export default Component;