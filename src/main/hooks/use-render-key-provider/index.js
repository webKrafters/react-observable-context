import { useRef } from 'react';

/**
 * @type {Provider<T>}
 * @template {State} T
 */
const getCurrKeys = selectorMap => {
	const currKeys = Object.values( selectorMap );
	return currKeys.length
		? Array.from( new Set( currKeys ) )
		: [];
};

/**
 * @type {Provider<T>}
 * @template {State} T
 */
const useRenderKeyProvider = selectorMap => {
	const renderKeys = useRef([]);
	const currKeys = getCurrKeys( selectorMap );
	if( ( renderKeys.current.length !== currKeys.length ||
		renderKeys.current.some(( k, i ) => k !== currKeys[ i ])
	) ) {
		renderKeys.current = currKeys;
	}
	return renderKeys.current;
};

export default useRenderKeyProvider;

/**
 * @callback Provider
 * @param {SelectorMap<T, MAP>} selectorMap Key:value pairs where `key` => arbitrary key given to Store.data property holding the state slices and `value` => property paths to state slices used by this component. May use `{..., state: '@@STATE'}` to indicate a desire to obtain the entire state object and assign to a `state` property of Store.data. A change in any of the referenced properties results in this component render. When using `['@@STATE']`, any change in the state object results in this component render.
 * @returns {[string|keyof T]} Property paths
 * @template {State} T
 * @template {BaseSelectorMap<T>} [MAP=BaseSelectorMap<T>]
 */

/**
 * @typedef {import("../../../types").SelectorMap<STATE>} SelectorMap
 * @template {State} [STATE=State]
 * @template {BaseSelectorMap<STATE>} [MAP=BaseSelectorMap<STATE>]
 */

/**
 * @typedef {import("../../../types").BaseSelectorMap<STATE>} BaseSelectorMap
 * @template {State} [STATE=State]
 */

/** @typedef {import("../../../types").State} State */
