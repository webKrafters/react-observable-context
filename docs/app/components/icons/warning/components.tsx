import { memo } from 'react';

import { WarningTwoTone } from '@ant-design/icons';

const WarningIcon : React.MemoExoticComponent<React.FC> = memo(() => (
    <WarningTwoTone
        style={{ fontSize: 24 }}
        twoToneColor={[ '#f40', '#fd0' ]}
    />
));
WarningIcon.displayName = 'WarningIcon';

export default WarningIcon;