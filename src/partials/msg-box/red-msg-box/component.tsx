import React from 'react';

import MessageBox from '..';

import './style.scss';

const RedMessageBox : React.FC<{
	children : React.ReactNode
}> = props => (
	<MessageBox className="red-msg-box">
		{ props.children }
	</MessageBox>
);

RedMessageBox.displayName = 'RedMessageBox';

export default RedMessageBox;
