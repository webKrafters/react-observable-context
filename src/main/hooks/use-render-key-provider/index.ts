import type {
	SelectorMap,
	State
 } from '../../..';

import { useRef } from 'react';

const getCurrKeys = <
	T extends State,
	SELECTOR_MAP extends SelectorMap<T>
>( selectorMap : SELECTOR_MAP ) => {
	const currKeys = Object.values( selectorMap );
	return currKeys.length
		? Array.from( new Set( currKeys ) )
		: [];
};


const useRenderKeyProvider = <
	T extends State,
	SELECTOR_MAP extends SelectorMap<T>
>( selectorMap : SELECTOR_MAP ) => {
	const renderKeys = useRef<Array<string|keyof T>>([]);
	const currKeys = getCurrKeys( selectorMap );
	if( ( renderKeys.current.length !== currKeys.length ||
		renderKeys.current.some(( k, i ) => k !== currKeys[ i ])
	) ) {
		renderKeys.current = currKeys;
	}
	return renderKeys.current;
};

export default useRenderKeyProvider;
