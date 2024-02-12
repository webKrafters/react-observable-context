import { memo } from 'react';

import { clientOnly$, serverOnly$ } from 'vite-env-only';

import WarningTwoTone from '@ant-design/icons/WarningTwoTone';

let WarningTwoToneIcon : typeof WarningTwoTone;

clientOnly$((() => { WarningTwoToneIcon = WarningTwoTone })());
serverOnly$((() => { WarningTwoToneIcon = ( WarningTwoTone as any ).default })());

const Company : React.MemoExoticComponent<React.FC> = memo(() => (
    <WarningTwoToneIcon
        style={{ fontSize: 24 }}
        twoToneColor={[ '#f40', '#fd0' ]}
    />
));
Company.displayName = 'WarningIcon';

export default Company;