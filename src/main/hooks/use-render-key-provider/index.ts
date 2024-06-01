import type {
	ArraySelector,
	ObjectSelector,
	SelectorMap,
	Text
} from '../../..';

import { useRef } from 'react';

import isPlainObject from 'lodash.isplainobject';

function getCurrKeys( selectorMap : ArraySelector ) : Array<Text>;
function getCurrKeys( selectorMap : ObjectSelector ) : Array<Text>;
function getCurrKeys( selectorMap ) : Array<Text> {
	if( isPlainObject( selectorMap ) || Array.isArray( selectorMap ) ) {
		return Array.from( new Set<Text>( Object.values( selectorMap ) ) );
	}
	if( typeof selectorMap === 'undefined' || selectorMap === null ) {
		return [];
	}
	throw new TypeError( 'Incompatible Selector Map type provided.' );
};

function useRenderKeyProvider( selectorMap : ArraySelector ) : Array<Text>;
function useRenderKeyProvider( selectorMap : ObjectSelector ) : Array<Text>;
function useRenderKeyProvider( selectorMap : SelectorMap ) : Array<Text>;
function useRenderKeyProvider( selectorMap ) : Array<Text> {
	const renderKeys = useRef<Array<Text>>([]);
	const currKeys = getCurrKeys( selectorMap );
	if( ( renderKeys.current.length !== currKeys.length ||
		renderKeys.current.some(( k, i ) => k !== currKeys[ i ])
	) ) {
		renderKeys.current = currKeys;
	}
	return renderKeys.current;
};

export default useRenderKeyProvider;
