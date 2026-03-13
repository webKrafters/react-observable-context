import React, { FC, useContext, useMemo } from 'react';

import { ValueCtx } from '../version-tabs/context';

const Component : FC = () => {
	const vofInterest = useContext( ValueCtx );
	const vText = useMemo(() => (
		Array.isArray( vofInterest )
			? `v${ vofInterest.join( '.' ) }`
			: vofInterest
	), [ vofInterest ]);
	return (
		<div className="version-of-interest">
			{ vText }
		</div>
	);
}

export default Component;
