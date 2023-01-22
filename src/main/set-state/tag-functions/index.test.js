import {
	CLEAR_TAG,
	DELETE_TAG,
	MOVE_TAG,
	PUSH_TAG,
	REPLACE_TAG,
	SET_TAG,
	SPLICE_TAG
} from '../../../constants';

import * as tag from '.';

import createSourceData from '../../../test-artifacts/data/create-state-obj';

let state, statsStub;
beforeAll(() => {
	statsStub = { hasChanges: false };
	state = createSourceData();
});

describe( '$delete(...)', () => {
	test( 'removes all listed properties residing at the provided stateKey = \'state\'', () => {
		const _state = { state: createSourceData() };
		const removedKeys = [ '_id', 'address', 'friends', 'picture' ];
		tag.$delete( _state, 'state', statsStub, { [ DELETE_TAG ]: removedKeys } )
		expect( removedKeys.every( k => !( k in _state.state ) ) ).toBe( true );
	} );
	test( 'removes all listed array indexes residing at the provided array state property named \'tags\'', () => {
		const _state = createSourceData();
		tag.$delete( _state, 'tags', statsStub, { [ DELETE_TAG ]: [ 0, 1, 2, 3, 6 ] } )
		expect( _state ).toEqual({ ...state, tags: [ state.tags[ 4 ], state.tags[ 5 ] ] });
	} );
} );
describe( `'${ MOVE_TAG }' tag property key`, () => {
	let state;
	beforeAll(() => { state = createSourceData() });
	test( 'moves contiguous array items(s) from one index to another', () => {
		const _state = createSourceData();
		setState( _state, {
			friends: { [ MOVE_TAG ]: [ 2, 1 ] },
			tags: { [ MOVE_TAG ]: [ 3, 5, 3 ] }
		} );
		expect( _state ).toEqual({
			...state,
			friends: [ 0, 2, 1 ].map( i => state.friends[ i ] ),
			tags: [ 0, 1, 2, 6, 3, 4, 5 ].map( i => state.tags[ i ] )
		});
	} );
	test( 'only updates state slices of the array type', () => {
		const _state = createSourceData();
		setState( _state, {
			company: { [ MOVE_TAG ]: [ 0, 2 ] }, // non-array `company` state will be ignored
			friends: { [ MOVE_TAG ]: [ 0, 2 ] }
		} );
		expect( _state ).toEqual({ ...state, friends: [ 1, 2, 0 ].map( i => state.friends[ i ] ) });
	} );
	describe( 'non-optional argument type validation', () => {
		test( 'only accepts an array value consisting of at least two integers', () => expect(
			() => setState( createSourceData(), { friends: { [ MOVE_TAG ]: [ 0, 1 ] } } )
		).not.toThrow( TypeError ) );
		test.each([
			[ null ], [ undefined ], [ '' ], [ 'test' ], [ {} ], [ { test: expect.anything() } ],
			[ true ], [ [] ], [ [ 3 ] ], [ [ true, true ] ], [ [ 4, true ] ], [ [ 1.2, 0.5 ] ],
			[ { 0: 2, 1: 1 } ]
		])( 'throws `TypeError` for arguments fitting this description: %p', args => expect(
			() => setState( state, { friends: { [ MOVE_TAG ]: args } } )
		).toThrow( TypeError ) );
	} );
	describe( 'optional third argumemt', () => {
		test( 'accepts a positive integer value for number of contiguous elements to move', () => {
			const _state = createSourceData();
			setState( _state, { friends: { [ MOVE_TAG ]: [ 0, 2, 2 ] } } );
			expect( _state ).toEqual({
				...state,
				friends: [ 2, 0, 1 ].map( i => state.friends[ i ] )
			});
		} );
		test.each([
			[ 'negative integers', -2 ], [ 'zero', 0 ], [ 'fractions', 0.5 ],
			[ 'non-integer values', true ], [ 'non-numeric values', '2' ]
		])( 'ignores %p', ( desc, numItems ) => {
			const _state = createSourceData();
			const onChangeMock = jest.fn();
			setState( _state, { friends: { [ MOVE_TAG ]: [ 0, 2, numItems ] } }, onChangeMock );
			expect( _state ).toEqual( state );
			expect( onChangeMock ).not.toHaveBeenCalled();
		} );
		test( 'moves contiguous elements from fromIndex to end of array when argument value exceeds array length', () => {
			const _state = createSourceData();
			setState( _state, { friends: { [ MOVE_TAG ]: [ 1, 0, 3 ] } } );
			expect( _state ).toEqual({
				...state,
				friends: [ 1, 2, 0 ].map( i => state.friends[ i ] )
			});
		} );
	} );
	describe( 'counting from end of state array', () => {
		let calcExpected;
		beforeAll(() => {
			state = createSourceData();
			calcExpected = indexes => ({ ...state, friends: indexes.map( i => state.friends[ i ] ) });
		});
		test.each([
			[ -1, 0, [ 2, 0, 1 ] ],
			[ 2, -2, [ 0, 2, 1 ] ],
			[ -2, -1, [ 0, 2, 1 ] ]
		])( 'accepts negative index in args %d and %d', ( from, to, expectedIndexes ) => {
			const _state = createSourceData();
			setState( _state, { friends: { [ MOVE_TAG ]: [ from, to ] } } );
			expect( _state ).toEqual( calcExpected( expectedIndexes ) );
		} );
	} );
	test( 'ignores non-existent properties', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, { testing: { [ MOVE_TAG ]: [ 1, 1 ] } }, onChangeMock );
		expect( _state ).toEqual( state );
		expect( onChangeMock ).not.toHaveBeenCalled();
	} );
	test( 'ignores move requests from same index to same index', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, { tags: { [ MOVE_TAG ]: [ 1, 1 ] } }, onChangeMock );
		expect( _state ).toEqual( state );
		expect( onChangeMock ).not.toHaveBeenCalled();
	} );
} );
describe( `'${ PUSH_TAG }' tag property key`, () => {
	let state, newItems;
	beforeAll(() => {
		newItems = [ expect.anything(), expect.anything() ];
		state = createSourceData();
	});
	test( 'appends values at the end of state array property', () => {
		const _state = createSourceData();
		setState( _state, {
			friends: { [ PUSH_TAG ]: newItems },
			tags: { [ PUSH_TAG ]: newItems }
		} );
		expect( _state ).toEqual({
			...state,
			friends: [ ...state.friends, ...newItems ],
			tags: [ ...state.tags, ...newItems ]
		});
	} );
	test( 'only updates state slices of the array type', () => {
		const _state = createSourceData();
		setState( _state, {
			company: { [ PUSH_TAG ]: newItems }, // non-array `company` state will be ignored
			friends: { [ PUSH_TAG ]: newItems }
		} );
		expect( _state ).toEqual({ ...state, friends: [ ...state.friends, ...newItems ] });
	} );
	describe( 'non-optional argument type validation', () => {
		test( 'only accepts an array value', () => expect(
			() => setState( createSourceData(), { friends: { [ PUSH_TAG ]: [] } } )
		).not.toThrow( TypeError ) );
		test.each([
			[ null ], [ undefined ], [ '' ], [ 'test' ], [ {} ],
			[ { test: expect.anything() } ], [ true ], [ { 0: 2, 1: 1 } ]
		])( 'throws `TypeError` for arguments fitting this description: %p', args => expect(
			() => setState( state, { friends: { [ PUSH_TAG ]: args } } )
		).toThrow( TypeError ) );
	} );
	test( 'ignores empty array argument', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, { tags: { [ PUSH_TAG ]: [] } }, onChangeMock );
		expect( _state ).toEqual( state );
		expect( onChangeMock ).not.toHaveBeenCalled();
	} );
	test( 'ignores non-existent properties', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, { testing: { [ PUSH_TAG ]: newItems } }, onChangeMock );
		expect( _state ).toEqual( state );
		expect( onChangeMock ).not.toHaveBeenCalled();
	} );
} );
describe( `'${ REPLACE_TAG }' tag property key`, () => {
	test( 'adds new and replaces existing referenced top level properties', () => {
		const _state = createSourceData();
		const stateReplacement = {
			averageScore: 87, // new
			// existing
			isActive: expect.any( Boolean ),
			name: expect.any( Object ),
			registered: expect.any( Object ),
			// new
			test1: expect.anything(),
			test2: expect.anything(),
			test3: expect.anything(),
			test4: expect.anything(),
			zone: 33
		};
		setState( _state, { [ REPLACE_TAG ]: stateReplacement } );
		expect( _state ).toEqual( stateReplacement );
	});
	test( 'replaces properties with new value', () => {
		const _state = createSourceData();
		const newValues = {
			company: 'TEST_COMPANY',
			friends: 'NEW TEST FRIENDS',
			name: { first: 'Priscilla', middle: 'Samantha', last: 'Williams' },
			phone: {},
			tags: []
		};
		setState( _state, {
			company: { [ REPLACE_TAG ]: newValues.company },
			friends: { [ REPLACE_TAG ]: newValues.friends },
			name: { [ REPLACE_TAG ]: newValues.name },
			phone: { [ REPLACE_TAG ]: newValues.phone },
			tags: { [ REPLACE_TAG ]: newValues.tags }
		});
		expect( _state ).toEqual({ ...state, ...newValues });
	} );
	test( 'adds new values to property when specified', () => {
		const _state = createSourceData();
		const newValues = {
			company: 'TEST_COMPANY',
			friends: 'NEW TEST FRIENDS',
			name: { first: 'Priscilla', middle: 'Samantha', last: 'Williams' },
			phone: { extension: 'x456' }, // ADDING `extension` to state.phone
			tags: []
		};
		setState( _state, {
			company: { [ REPLACE_TAG ]: newValues.company },
			friends: { [ REPLACE_TAG ]: newValues.friends },
			name: { [ REPLACE_TAG ]: newValues.name },
			phone: { extension: { [ REPLACE_TAG ]: newValues.phone.extension } },
			tags: { [ REPLACE_TAG ]: newValues.tags }
		});
		const expected = { ...state, ...newValues };
		expected.phone = { ...state.phone, extension: newValues.phone.extension };
		expect( _state ).toEqual( expected );
	} );
	test( 'ignores attempts to replace with identical values', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, {
			friends: { [ REPLACE_TAG ]: state.friends },
			tags: { [ REPLACE_TAG ]: state.tags }
		}, onChangeMock );
		expect( _state ).toEqual( state );
		expect( onChangeMock ).not.toHaveBeenCalled();
	} );
	test( 'adds new properties for attmepts to replace non-existent properties', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, {
			testing: { [ REPLACE_TAG ]: expect.anything() }
		}, onChangeMock );
		expect( _state ).toEqual({ ...state, testing: expect.anything() });
		expect( onChangeMock ).toHaveBeenCalled();
	} );
} );
describe( `'${ SET_TAG }' tag property key`, () => {
	let newPhone;
	beforeAll(() => { newPhone = { area: '312', line: '1212', local: '644' } });
	test( 'replaces state slice with new value', () => {
		const _state = createSourceData();
		setState( _state, {	phone: { [ SET_TAG ]: newPhone } } );
		expect( _state ).toEqual({ ...state, phone: newPhone })
	} );
	describe( 'using compute function', () => {
		let _state, arg;
		beforeAll(() => {
			_state = createSourceData();
			setState( _state, {
				phone: {
					[ SET_TAG ]: s => {
						arg = s;
						return newPhone;
					}
				}
			} );
		});
		test( 'replaces state slice with the return value', () => {
			expect( _state ).toEqual({ ...state, phone: newPhone });
		} );
		test( 'supplies currently held state slice value as argument', () => {
			expect( arg ).not.toBe( _state.phone );
			expect( arg ).toStrictEqual( state.phone );
		} );
	} );
	describe( 'setting referenced top level properties', () => {
		let _state, stateReplacement;
		beforeAll(() => {
			stateReplacement = {
				averageScore: 87, // new
				// existing
				isActive: expect.any( Boolean ),
				name: expect.any( Object ),
				registered: expect.any( Object ),
				// new
				test1: expect.anything(),
				test2: expect.anything(),
				test3: expect.anything(),
				test4: expect.anything(),
				zone: 33
			};
		});
		test( 'accepts ready-to-set data', () => {
			_state = createSourceData();
			setState( _state, { [ SET_TAG ]: stateReplacement } );
			expect( _state ).toEqual( stateReplacement );
		});
		describe( 'using compute function', () => {
			let arg;
			beforeAll(() => {
				_state = createSourceData();
				setState( _state, {
					[ SET_TAG ]: s => {
						arg = s;
						return stateReplacement;
					}
				} );
			});
			test( 'accepts the function return value', () => {
				expect( _state ).toEqual( stateReplacement );
			} );
			test( 'supplies currently held state value as argument', () => {
				expect( arg ).not.toBe( _state );
				expect( arg ).toStrictEqual( state );
			} );
		} );
	});
	test( 'replaces properties with new value', () => {
		const _state = createSourceData();
		const newValues = {
			company: 'TEST_COMPANY',
			friends: 'NEW TEST FRIENDS',
			name: { first: 'Priscilla', middle: 'Samantha', last: 'Williams' },
			phone: {},
			tags: []
		};
		setState( _state, {
			company: { [ SET_TAG ]: newValues.company },
			friends: { [ SET_TAG ]: newValues.friends },
			name: { [ SET_TAG ]: newValues.name },
			phone: { [ SET_TAG ]: newValues.phone },
			tags: { [ SET_TAG ]: newValues.tags }
		});
		expect( _state ).toEqual({ ...state, ...newValues });
	} );
	test( 'adds new values to property when specified', () => {
		const _state = createSourceData();
		const newValues = {
			company: 'TEST_COMPANY',
			friends: 'NEW TEST FRIENDS',
			name: { first: 'Priscilla', middle: 'Samantha', last: 'Williams' },
			phone: { extension: 'x456' }, // ADDING `extension` to state.phone
			tags: t => t.length > 3 ? t.slice( -2 ) : t
		};
		setState( _state, {
			company: { [ SET_TAG ]: newValues.company },
			friends: { [ SET_TAG ]: newValues.friends },
			name: { [ SET_TAG ]: newValues.name },
			phone: { extension: { [ SET_TAG ]: newValues.phone.extension } },
			tags: { [ SET_TAG ]: newValues.tags }
		});
		const expected = { ...state, ...newValues, tags: state.tags.slice( -2 ) };
		expected.phone = { ...state.phone, extension: newValues.phone.extension };
		expect( _state ).toEqual( expected );
	} );
	test( 'ignores attempts to replace with identical values', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, {
			friends: { [ SET_TAG ]: state.friends },
			tags: { [ SET_TAG ]: state.tags }
		}, onChangeMock );
		expect( _state ).toEqual( state );
		expect( onChangeMock ).not.toHaveBeenCalled();
	} );
	test( 'adds new properties for attmepts to replace non-existent properties', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, {
			testing: { [ SET_TAG ]: expect.anything() }
		}, onChangeMock );
		expect( _state ).toEqual({ ...state, testing: expect.anything() });
		expect( onChangeMock ).toHaveBeenCalled();
	} );
} );
describe( `'${ SPLICE_TAG }' tag property key`, () => {
	let state, newItems;
	/**
	 * "x" arrayIndex entry signifies when to insert new item values into expected array.
	 *
	 * @type {(field: string, indexPositions: Array<number|"x">, newItems: any) => Array}
	 */
	let computeExpectedArray;
	beforeAll(() => {
		newItems = [ expect.anything(), expect.anything() ];
		state = createSourceData();
		computeExpectedArray = ( field, indexPositions, newItems ) => indexPositions.reduce(( a, i ) => {
			i === 'x'
				? a.push( ...newItems )
				: a.push( state[ field ][ i ] );
			return a;
		}, []);
	});
	test( 'removes a specified number of elements from a specified state array index and inserts new items at that index', () => {
		const _state = createSourceData();
		setState( _state, {
			friends: { [ SPLICE_TAG ]: [ 2, 1, ...newItems ] },
			tags: { [ SPLICE_TAG ]: [ 3, 2, ...newItems ] }
		} );
		expect( _state ).toEqual({
			...state,
			friends: computeExpectedArray( 'friends', [ 0, 1, 'x' ], newItems ),
			tags: computeExpectedArray( 'tags', [ 0, 1, 2, 'x', 5, 6 ], newItems )
		});
	} );
	test( 'only updates state slices of the array type', () => {
		const _state = createSourceData();
		setState( _state, {
			company: { [ SPLICE_TAG ]: [ 0, 2 ] }, // non-array `company` state will be ignored
			friends: { [ SPLICE_TAG ]: [ 0, 2 ] }
		} );
		expect( _state ).toEqual({ ...state, friends: [ state.friends[ 2 ] ] });
	} );
	describe( 'non-optional argument type validation', () => {
		test( 'only accepts an array value consisting of at least two integers', () => expect(
			() => setState( createSourceData(), { friends: { [ SPLICE_TAG ]: [ 0, 1 ] } } )
		).not.toThrow( TypeError ) );
		test.each([
			[ null ], [ undefined ], [ '' ], [ 'test' ], [ {} ], [ { test: expect.anything() } ],
			[ true ], [ [] ], [ [ 3 ] ], [ [ true, true ] ], [ [ 4, true ] ], [ [ 1.2, 0.5 ] ],
			[ { 0: 2, 1: 1 } ]
		])( 'throws `TypeError` for arguments fitting this description: %p', args => expect(
			() => setState( state, { friends: { [ SPLICE_TAG ]: args } } )
		).toThrow( TypeError ) );
	} );
	describe( 'additional optional ...newItems variadic argumemt(s)', () => {
		test( 'accepts one or more values to insert contiguously starting from the fromIndex position of the state array', () => {
			const _state = createSourceData();
			setState( _state, {
				friends: { [ SPLICE_TAG ]: [ 2, 1, ...newItems ] },
				tags: { [ SPLICE_TAG ]: [ 3, 2, ...newItems ] }
			} );
			expect( _state ).toEqual({
				...state,
				friends: computeExpectedArray( 'friends', [ 0, 1, 'x' ], newItems ),
				tags: computeExpectedArray( 'tags', [ 0, 1, 2, 'x', 5, 6 ], newItems )
			});
		} );
	} );
	test( 'trims off all leading elements identical to the state array at same index; adjusts fromIndex & deleteCount inserting new items', () => {
		const _state = createSourceData();
		setState( _state, {
			friends: { [ SPLICE_TAG ]: [ 0, 3, state.friends[ 0 ], ...newItems ] },
			tags: { [ SPLICE_TAG ]: [ 2, 4, state.tags[ 2 ], state.tags[ 3 ], ...newItems, state.tags[ 0 ] ] }
		});
		expect( _state ).toEqual({
			...state,
			friends: computeExpectedArray( 'friends', [ 0, 'x' ], newItems ),
			tags: computeExpectedArray( 'tags', [ 0, 1, 2, 3, 'x', 0, 6 ], newItems )
		});
	} );
	test( 'ignores a combination of argument #2 = 0 and no new items to insert', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, { tags: { [ SPLICE_TAG ]: [ 3, 0 ] } }, onChangeMock );
		expect( _state ).toEqual( state );
		expect( onChangeMock ).not.toHaveBeenCalled();
	} );
	test( 'auto-corrects negative argument #2 to 0', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, { tags: { [ SPLICE_TAG ]: [ 3, -2 ] } }, onChangeMock );
		expect( _state ).toEqual( state );
		expect( onChangeMock ).not.toHaveBeenCalled();
	} );
	describe( 'counting from end of state array', () => {
		test.each([
			[ -1, 0, '', [ 0, 1, 2 ] ],
			[ -1, 0, ' along with the optional new element to insert', [ 0, 1, 'x', 2 ] ],
			[ 2, -2, '', [ 0, 1, 2 ] ],
			[ 2, -2, ' along with the optional new element to insert', [ 0, 1, 'x', 2 ] ],
			[ -2, 1, '', [ 0, 2 ] ],
			[ -2, 1, ' along with the optional new element to insert', [ 0, 'x', 2 ] ]
		])( 'accepts negative index in args %d and %d%s', ( from, to, desc, expectedIndices ) => {
			const _state = createSourceData();
			const args = [ from, to ];
			if( desc.length ) { args.push( ...newItems ) }
			setState( _state, { friends: { [ SPLICE_TAG ]: args } } );
			expect( _state ).toEqual({
				...state,
				friends: computeExpectedArray( 'friends', expectedIndices, desc.length ? newItems : undefined )
			});
		} );
	} );
	test( 'ignores attempts to remove and re-insert identical values', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, {
			friends: { [ SPLICE_TAG ]: [ 0, 1, state.friends[ 0 ] ] },
			tags: { [ SPLICE_TAG ]: [ 5, 1, state.tags[ 5 ] ] }
		}, onChangeMock );
		expect( _state ).toEqual( state );
		expect( onChangeMock ).not.toHaveBeenCalled();
	} );
	test( 'ignores non-existent properties', () => {
		const _state = createSourceData();
		const onChangeMock = jest.fn();
		setState( _state, { testing: { [ SPLICE_TAG ]: [ 1, 1 ] } }, onChangeMock );
		expect( _state ).toEqual( state );
		expect( onChangeMock ).not.toHaveBeenCalled();
	} );
} );
