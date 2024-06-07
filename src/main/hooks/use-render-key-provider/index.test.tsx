import clonedeep from '@webkrafters/clone-total';

import useRenderKeyProvider from '.';

import { renderHook } from '@testing-library/react';

import '../../../test-artifacts/suppress-render-compat';

describe( 'useRenderKeyProvider', () => {
	let selectorMap;
	beforeAll(() => { selectorMap = { _a: 'a', _b: 'b', _c: 'c' } });
	test( 'calculates new selectors for new selectorMap', () => {
		const initialProps = clonedeep( selectorMap );
		const { result, rerender } = renderHook( useRenderKeyProvider, { initialProps } );
		const selectors = result.current;
		const updateProps = { ...selectorMap, _y: 'y', _z: 'z' };
		rerender( updateProps );
		expect( result.current ).toEqual( Object.values( updateProps ) );
		expect( result.current ).not.toEqual( selectors );
		expect( result.current ).not.toBe( selectors );
	} );
	test( 'ensures no abrupt updates to selectors for new list with same selectorMap', () => {
		const { result, rerender } = renderHook( useRenderKeyProvider, { initialProps: selectorMap } );
		const selectors = result.current;
		rerender( clonedeep( selectorMap ) );
		expect( result.current ).toBe( selectors );
	} );
	describe( 'productive call', () => {
		let expected;
		beforeAll(() => { expected = [ 'a', 'b', 'c' ] } );
		test.each([
			[ 'object', { _a: 'a', _b: 'b', _c: 'c' } ],
			[ 'array', [ 'a', 'b', 'c' ] ]
		])( 'allows an %s type selectoMap', ( label, value ) => {
			const { result } = renderHook( useRenderKeyProvider, { initialProps: value } );
			expect( result.current ).toEqual( expected );
		} )
	} );
	describe.each([
		[ 'undefined', undefined ],
		[ 'null', null ],
		[ '[]', [] ],
		[ '{}', {} ]
	])( 'empty selectoMap = %s', ( label, value ) => {
		test( 'returns empty renderKeys list', () => {
			const { result } = renderHook( useRenderKeyProvider, { initialProps: value } );
			expect( result.current ).toEqual([]);
		} );
	} );
	describe.each([
		[ 'string', 'abc' ],
		[ 'number', 22 ],
		[ 'function', () => {} ],
		[ 'boolean', true ],
		[ 'Map', new Map() ],
		[ 'Set', new Set() ],
		[ 'Uint8Array', new Uint8Array() ]
	])( 'incompatible selectorMap type = %s', ( label, value ) => {
		test( 'throws Type error', () => {
			try {
				renderHook( useRenderKeyProvider, {
					initialProps: value as unknown
				} );
			} catch( e ) {
				expect( e.constructor.name ).toEqual( 'TypeError' );
				expect( e.message ).toEqual( 'Incompatible Selector Map type provided.' );
			}
		} );
	} );
} );
