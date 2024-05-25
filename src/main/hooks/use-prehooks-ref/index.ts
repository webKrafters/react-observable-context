import { useEffect, useRef } from 'react';

import type { Prehooks, State } from '../../..';

function usePrehooksRef<T extends State>( prehooks : Prehooks<T> ){
	const prehooksRef = useRef( prehooks );
	useEffect(() => { prehooksRef.current = prehooks }, [ prehooks ]);
	return prehooksRef;
};

export default usePrehooksRef;

