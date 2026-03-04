import React from 'react';

import NotePad from '../../partials/pad/note';

import './style.scss';

const RedMessageBox : React.FC<{
	children : React.ReactNode
}> = ({ children }) => (
	<div className="red-msg-box">
		<NotePad>
			{ children }
		</NotePad>
	</div>
);

RedMessageBox.displayName = 'RedMessageBox';

export default RedMessageBox;
