import React, { FC } from 'react';

import RedMessageBox from '../../red-msg-box';

const DepecateAlert : FC = () => (
	<RedMessageBox>
		<b>DEPRECATED.</b>
	</RedMessageBox>
);

DepecateAlert.displayName = 'Alert.Depecated';

export default DepecateAlert;
