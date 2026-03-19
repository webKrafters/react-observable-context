import React from 'react';

import NotePad from '../pad/note';

import './style.scss';

const MessageBox : React.FC<{
	children : React.ReactNode,
	className? : string
}> = ({ className, children }) => (
	<div className={ `msg-box${ className ? ` ${ className }` : '' }` }>
		<NotePad>
			{ children }
		</NotePad>
	</div>
);

MessageBox.displayName = 'MessageBox';

export default MessageBox;
