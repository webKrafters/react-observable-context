import {
	CLEAR_TAG,
	DELETE_TAG,
	MOVE_TAG,
	PUSH_TAG,
	REPLACE_TAG,
	SET_TAG,
	SPLICE_TAG
} from '../../constants';
import { clonedeep } from '../../utils';
import setState from '.';

import createSourceData from '../../test-artifacts/data/create-state-obj';

describe( 'setState(...)', () => {
	const state = createSourceData();
	describe( 'basics', () => {
		let newAge, changes, onChangeMock, prevAge;
		beforeAll(() => {
			newAge = 56;
			changes = { age: newAge };
			onChangeMock = jest.fn();
			prevAge = state.age;
			setState( state, changes, onChangeMock );
		});
		afterAll(() => { state.age = prevAge })
		test( 'updates state with new changes', () => expect( state.age ).toBe( newAge ) );
		test( 'notifies listeners of state changes', () => {
			expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
			expect( onChangeMock ).toHaveBeenCalledWith( changes );
		} );
	} );
	describe( 'attempt resulting in state change', () => {
		let onChangeMock, registered, changes;
		beforeAll(() => {
			onChangeMock = jest.fn();
			registered = clonedeep( state.registered );
			changes = {
				registered: {
					day: 30, // new value
					month: 2,
					time: {
						hours: 9,
						seconds: 46
					},
					year: 2020 // new value
				}
			};
			setState( state, changes, onChangeMock );
		});
		afterAll(() => { state.registered = registered });
		test( 'updates only new incoming changes', () => {
			expect( state.registered.time ).toStrictEqual( registered.time );
			[ 'day', 'year' ].forEach( k => {
				expect( state.registered[ k ] ).not.toEqual( registered[ k ] );
				expect( state.registered[ k ] ).toBe( changes.registered[ k ] );
			} );
			const state2 = createSourceData();
			const registered2 = clonedeep( state2.registered );
			const changes2 = clonedeep( changes );
			changes2.registered.time.hours = 17; // also add new `hours` value update to `time` object
			setState( state2, changes2 );
			expect( state2.registered.time ).not.toEqual( registered2.time );
			expect( state2.registered.time.hours ).not.toBe( registered2.time.hours );
			expect( state2.registered.time.minutes ).toBe( registered2.time.minutes );
			expect( state2.registered.time.seconds ).toBe( registered2.time.seconds );
		} )
		test( 'sends state change notifications', () => {
			expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
		} );
		test( 'communicates proposed changes as part of state change notification', () => {
			expect( onChangeMock ).toHaveBeenCalledWith( changes );
		} );
	} );
	describe( 'attempt resulting in no state change', () => {
		let onChangeMock, registered;
		beforeAll(() => {
			onChangeMock = jest.fn();
			registered = clonedeep( state.registered );
			setState( state, {
				registered: {
					day: 18,
					month: 2,
					time: {
						hours: 9,
						seconds: 46
					},
					year: 2016
				}
			}, onChangeMock );
		});
		test( 'performs no updates', () => {
			expect( state.registered ).toStrictEqual( registered );
		} );
		test( 'sends no state change notifications', () => {
			expect( onChangeMock ).not.toHaveBeenCalled();
		} );
	} );
	describe( 'array state subtree', () => {
		test( 'is wholly replaced if new value is neither an array nor an indexed object', () => {
			const state = createSourceData();
			const friends = 'TEST FRIEND STUB';
			setState( state, { friends } );
			expect( state.friends ).toBe( friends );
		} );
		describe( 'using indexed object to update array at specific indexes', () => {
			let changes, onChangeMock;
			let origFriendsSlice;
			beforeAll(() => {
				origFriendsSlice = clonedeep( state.friends );
				changes = {
					friends: {
						1: { name: { first: 'Virginia' } },
						'-1': {
							id: 5,
							name: { first: 'Kathy', last: 'Smith' }
						}
					}
				};
				onChangeMock = jest.fn();
				setState( state, changes, onChangeMock );
			});
			afterAll(() => { state.friends = origFriendsSlice });
			test( 'maintains structural integrity of the subtree', () => {
				expect( Array.isArray( state.friends ) ).toBe( true );
			} );
			test( 'updates state with new changes', () => {
				expect( state.friends[ 0 ] ).toEqual( origFriendsSlice[ 0 ] ); // remains untouched
				expect( state.friends[ 1 ].name.first ).toBe( changes.friends[ 1 ].name.first );
				expect( state.friends[ 2 ] ).toEqual( changes.friends[ -1 ] );
			} );
			test( 'recognizes update by negative indexing', () => {
				expect( state.friends[ 2 ] ).toEqual( changes.friends[ -1 ] );
			} );
			test( 'notifies listeners of state changes', () => {
				expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
				expect( onChangeMock ).toHaveBeenCalledWith( changes );
			} );
		} );
		describe( 'using indexed object to create new array entry', () => {
			let newEntryIndex, changes, onChangeMock, origFriendsSlice;
			beforeAll(() => {
				origFriendsSlice = clonedeep( state.friends );
				newEntryIndex = origFriendsSlice.length + 2;
				changes = {
					friends: {
						[ newEntryIndex ]: {
							id: newEntryIndex,
							name: { first: 'Rudie', last: 'Carson' }
						}
					}
				};
				onChangeMock = jest.fn();
				setState( state, changes, onChangeMock );
			});
			afterAll(() => { state.friends = origFriendsSlice });
			test( 'maintains structural integrity of the subtree', () => {
				expect( Array.isArray( state.friends ) ).toBe( true );
			} );
			test( 'leaves existing items untouched', () => {
				origFriendsSlice.forEach(( f, i ) => {
					expect( state.friends[ i ] ).toEqual( f );
				});
			} );
			test( 'creates `undefined` entries for any unoccupied indexes leading the new entry', () => {
				for( let i = origFriendsSlice.length; i < newEntryIndex; i++ ) {
					expect( state.friends[ i ] ).toBe( undefined );
				}
			} );
			test( 'places new entry at the referenced index', () => {
				expect( state.friends[ newEntryIndex ] ).toEqual( changes.friends[ newEntryIndex ] );
			} );
			test( 'notifies listeners of state changes', () => {
				expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
				expect( onChangeMock ).toHaveBeenCalledWith( changes );
			} );
		} );
		describe( 'using indexed object resulting in no new change', () => {
			let changes, onChangeMock, origPlacesSlice;
			beforeAll(() => {
				origPlacesSlice = clonedeep( state.history.places );
				changes = {
					history: {
						places: {
							0: {
								city: 'Topeka',
								year: '1997 - 2002'
							}
						}
					}
				};
				onChangeMock = jest.fn();
				setState( state, changes, onChangeMock );
			});
			afterAll(() => { state.history.places = origPlacesSlice });
			test( 'maintains structural integrity of the subtree', () => {
				expect( Array.isArray( state.history.places ) ).toBe( true );
			} );
			test( 'leaves items untouched', () => {
				expect( state.history.places ).toHaveLength( origPlacesSlice.length );
				origPlacesSlice.forEach(( p, i ) => {
					expect( state.history.places[ i ] ).toEqual( p );
				});
			} );
			test( 'does not notify listeners due to no state changes', () => {
				expect( onChangeMock ).not.toHaveBeenCalled();
			} );
		} );
		describe( 'existing and incoming arrays of equal lengths', () => {
			let onChangeMock, state;
			beforeAll(() => { onChangeMock = jest.fn() });
			beforeEach(() => { state = createSourceData() });
			afterEach(() => onChangeMock.mockClear());
			test( 'results in no change when equal', () => {
				const friends = state.friends;
				setState( state, { friends }, onChangeMock );
				expect( state.friends ).toBe( friends );
				expect( onChangeMock ).not.toHaveBeenCalled();
			} );
			test( 'results in no change when identical', () => {
				const friends = state.friends;
				const friendsUpdate = clonedeep( state.friends );
				setState( state, { friends: friendsUpdate }, onChangeMock );
				expect( state.friends ).toBe( friends );
				expect( state.friends ).not.toBe( friendsUpdate );
				expect( state.friends ).toStrictEqual( friendsUpdate );
				expect( onChangeMock ).not.toHaveBeenCalled();
			} );
			test( 'results in a merge of incoming into existing when non-identical', () => {
				const friends = clonedeep( state.friends ).reverse();
				setState( state, { friends }, onChangeMock );
				expect( state.friends ).not.toBe( friends );
				expect( state.friends ).toStrictEqual( friends );
				expect( onChangeMock ).toHaveBeenCalled();
			} );
		} );
		describe( 'incoming array < existing array', () => {
			let changes, onChangeMock;
			let origFriendsSlice;
			beforeAll(() => {
				origFriendsSlice = clonedeep( state.friends );
				changes = { friends: [ origFriendsSlice[ 2 ] ] };
				onChangeMock = jest.fn();
				setState( state, changes, onChangeMock );
			});
			afterAll(() => { state.friends = origFriendsSlice });
			test( 'truncates existing array to new array size', () => {
				expect( state.friends ).toHaveLength( changes.friends.length );
				expect( state.friends.length ).toBeLessThan( origFriendsSlice.length );
			} );
			test( 'updates state with new changes', () => {
				expect( state.friends ).toEqual( changes.friends );
			} );
			test( 'notifies listeners of state changes', () => {
				expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
				expect( onChangeMock ).toHaveBeenCalledWith( changes );
			} );
		} );
		describe( 'incoming array is a subset of existing array', () => {
			let changes, onChangeMock;
			let origFriendsSlice;
			beforeAll(() => {
				origFriendsSlice = clonedeep( state.friends );
				changes = { friends: origFriendsSlice.slice( 0, 2 ) }; // takes 1st 2 entries and omits the last
				onChangeMock = jest.fn();
				setState( state, changes, onChangeMock );
			});
			afterAll(() => { state.friends = origFriendsSlice });
			test( 'truncates existing array to new array size', () => {
				expect( state.friends ).toHaveLength( changes.friends.length );
				expect( state.friends.length ).toBeLessThan( origFriendsSlice.length );
			} );
			test( 'updates state with new changes', () => {
				expect( state.friends ).toEqual( changes.friends );
			} );
			test( 'notifies listeners of the removed last entry', () => {
				expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
				expect( onChangeMock ).toHaveBeenCalledWith( changes );
			} );
		} );
		describe( 'incoming array > existing array', () => {
			describe( 'where incoming array is completely different from existing array', () => {
				let changes, onChangeMock;
				let origFriendsSlice;
				beforeAll(() => {
					origFriendsSlice = clonedeep( state.friends );
					changes = { friends: [] };
					for( let i = 7; --i; ) {
						changes.friends.push({
							id: expect.any( Number ), name: { first: expect.any( String ), last: expect.any( String ) }
						});
					}
					onChangeMock = jest.fn();
					setState( state, changes, onChangeMock );
				});
				afterAll(() => { state.friends = origFriendsSlice });
				test( 'increases existing array size to fit new array items', () => {
					expect( state.friends ).toHaveLength( changes.friends.length );
					expect( state.friends.length ).toBeGreaterThan( origFriendsSlice.length );
				} );
				test( 'updates state with new changes', () => {
					expect( state.friends ).toEqual( changes.friends );
				} );
				test( 'notifies listeners of total state slice replacement', () => {
					const replacedFriendsSlice = {};
					changes.friends.forEach(( f, i ) => { replacedFriendsSlice[ i ] = f });
					expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
					expect( onChangeMock ).toHaveBeenCalledWith( changes );
				} );
			} );
			describe( 'where incoming array contains existing array entries at the matching indexes', () => {
				let changes, onChangeMock, lastNewStateEntry, origFriendsSlice, originalNewStateEntry0, originalNewStateEntry1;
				beforeAll(() => {
					origFriendsSlice = clonedeep( state.friends );
					originalNewStateEntry0 = { id: 15, name: { first: 'Sue', last: 'Jones' } };
					originalNewStateEntry1 = {
						id: expect.any( Number ), name: { first: expect.any( String ), last: expect.any( String ) }
					};
					lastNewStateEntry = origFriendsSlice[ 0 ];
					changes = { friends: clonedeep( origFriendsSlice ) };
					changes.friends[ 0 ] = originalNewStateEntry0;
					changes.friends.push( originalNewStateEntry1 );
					changes.friends.push( lastNewStateEntry );
					onChangeMock = jest.fn();
					setState( state, changes, onChangeMock );
				});
				afterAll(() => { state.friends = origFriendsSlice });
				test( 'increases existing array size to fit new array items', () => {
					expect( state.friends ).toHaveLength( changes.friends.length );
					expect( state.friends.length ).toBeGreaterThan( origFriendsSlice.length );
				} );
				test( 'updates state with new changes', () => {
					expect( state.friends ).toEqual( changes.friends );
				} );
				test( 'maintains 2nd and 3rd elements from previous array', () => {
					expect( state.friends[ 0 ] ).not.toEqual( origFriendsSlice[ 0 ] );
					expect( state.friends[ 1 ] ).toEqual( origFriendsSlice[ 1 ] );
					expect( state.friends[ 2 ] ).toEqual( origFriendsSlice[ 2 ] );
				} );
				test( 'notifies listeners of updated array entries', () => {
					expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
					expect( onChangeMock ).toHaveBeenCalledWith( changes );
				} );
			} );
		} );
	} );
	describe( 'summary setState by the', () => {
		let state;
		beforeAll(() => { state = createSourceData() });
		describe( `'${ CLEAR_TAG }' tag property key`, () => {
			test( 'sets the entire state to its default value', () => {
				let state = createSourceData();
				setState( state, CLEAR_TAG );
				expect( state ).toEqual({});
				state = createSourceData();
				setState( state, { [ CLEAR_TAG ]: expect.anything() } );
				expect( state ).toEqual({});
			} );
			test( 'sets state slices to default values', () => {
				const _state = {
					...createSourceData(),
					nullableDefaultTester: new Map(),
					strs: [ 'zero', 'one', 'two', 'three' ]
				};
				setState( _state, {
					company: CLEAR_TAG,
					friends: { 1: CLEAR_TAG },
					history: { places: [ CLEAR_TAG, CLEAR_TAG ] },
					name: CLEAR_TAG,
					nullableDefaultTester: CLEAR_TAG,
					phone: CLEAR_TAG,
					strs: [ CLEAR_TAG ],
					tags: CLEAR_TAG
				} );
				expect( _state ).toEqual({
					..._state,
					company: '',
					friends: [ _state.friends[ 0 ], {}, _state.friends[ 2 ] ],
					history: { places: [ {}, {} ] },
					name: {},
					nullableDefaultTester: null,
					phone: {},
					strs: [ '' ],
					tags: []
				});
			} );
			test( 'also sets host property to default when present as a key in that property', () => {
				const _state = createSourceData();
				setState( _state, {
					company: { [ CLEAR_TAG ]: expect.anything() },
					friends: { 1: { [ CLEAR_TAG ]: expect.anything() } },
					history: {
						places: {
							0: { [ CLEAR_TAG ]: expect.anything() },
							1: { [ CLEAR_TAG ]: expect.anything() }
						}
					},
					name: { [ CLEAR_TAG ]: expect.anything() },
					phone: { [ CLEAR_TAG ]: expect.anything(), ...state.phone },
					tags: { [ CLEAR_TAG ]: expect.anything() }
				} );
				expect( _state ).toEqual({
					...state,
					company: '',
					friends: [ state.friends[ 0 ], {}, state.friends[ 2 ] ],
					history: { places: [ {}, {}, state.history.places[ 2 ] ] },
					name: {},
					phone: {},
					tags: []
				});
			} );
			test( 'ignores non-existent properties', () => {
				const _state = createSourceData();
				const onChangeMock = jest.fn();
				setState( _state, { testing: CLEAR_TAG }, onChangeMock );
				expect( _state ).toEqual( state );
				expect( onChangeMock ).not.toHaveBeenCalled();
			} );
			test( 'ignores undefined & properties already at their default states', () => {
				const onChangeMock = jest.fn();
				const _state = {
					...createSourceData(),
					friends: [],
					name: {},
					nilValuesTester: {
						_null: null,
						_undefined: undefined
					}
				};
				const _state2 = clonedeep( _state );
				setState( _state, {
					friends: CLEAR_TAG,
					name: CLEAR_TAG,
					nilValuesTester: {
						_null: CLEAR_TAG,
						_undefined: CLEAR_TAG
					}
				}, onChangeMock );
				expect( _state ).toStrictEqual( _state2 );
				expect( onChangeMock ).not.toHaveBeenCalled();
			} );
		} );
		describe( `'${ DELETE_TAG }' tag property key`, () => {
			test( 'removes all listed top level properties', () => {
				const state = createSourceData();
				const removedKeys = [ '_id', 'address', 'friends', 'picture' ];
				setState( state, { [ DELETE_TAG ]: removedKeys } );
				expect( removedKeys.every( k => !( k in state ) ) ).toBe( true );
			} );
			test( 'removes all listed properties', () => {
				const _state = createSourceData();
				setState( _state, {
					friends: { [ DELETE_TAG ]: [ 0, 2 ] },
					name: { [ DELETE_TAG ]: [ 'first', 'last' ] },
					phone: { [ DELETE_TAG ]: [ 'area', 'country', 'line' ] },
					tags: { [ DELETE_TAG ]: [ 0, 1, 2, 3, 6 ] }
				} );
				expect( _state ).toEqual({
					...state,
					friends: [ state.friends[ 1 ] ],
					name: {},
					phone: { local: state.phone.local },
					tags: [ state.tags[ 4 ], state.tags[ 5 ] ]
				});
			} );
			test( 'removes all listed properties from an element and replaces the array with the element', () => {
				const _state = createSourceData();
				setState( _state, {
					friends: [{ [ DELETE_TAG ]: [ 'name' ] }],
					history: { places: [ state.history.places[ 0 ], { [ DELETE_TAG ]: [ 'country', 'year' ] } ] }
				} );
				expect( _state ).toEqual({
					...state,
					friends: [{ id: state.friends[ 0 ].id }],
					history: {
						places: [ state.history.places[ 0 ], {
							city: state.history.places[ 1 ].city,
							state: state.history.places[ 1 ].state
						} ]
					}
				});
			} );
			test( `throws \`TypeError\` when \`${ DELETE_TAG }\` property value is not an array`, () => {
				expect(() => setState( createSourceData(), {
					company: { [ DELETE_TAG ]: state.company },
					friends: { 1: { [ DELETE_TAG ]: state.friends } },
					name: { [ DELETE_TAG ]: state.name },
					phone: { [ DELETE_TAG ]: state.phone, ...state.phone },
					tags: { [ DELETE_TAG ]: state.tags }
				} ) ).toThrow( TypeError );
			} );
			test( `ignores non-existent property keys in the \`${ DELETE_TAG }\` property value`, () => {
				const onChangeMock = jest.fn();
				const _state = createSourceData();
				setState( _state, {
					friends: { [ DELETE_TAG ]: [ -9, 55, 'test' ] },
					name: { [ DELETE_TAG ]: [ 'suffix' ] },
					phone: { [ DELETE_TAG ]: [ 'extension', 'isp' ] },
					tags: { [ DELETE_TAG ]: [ 101, 9, 30, 62 ] }
				}, onChangeMock );
				expect( _state ).toEqual( state );
				expect( onChangeMock ).not.toHaveBeenCalled();
			} );
			test( `ignores \`${ DELETE_TAG }\` property with empty array value`, () => {
				const onChangeMock = jest.fn();
				const _state = createSourceData()
				setState( _state, {
					friends: { [ DELETE_TAG ]: [] },
					name: { [ DELETE_TAG ]: [] },
					phone: { [ DELETE_TAG ]: [] },
					tags: { [ DELETE_TAG ]: [] }
				}, onChangeMock );
				expect( _state ).toEqual( state );
				expect( onChangeMock ).not.toHaveBeenCalled();
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
			let newPhone, newTag0;
			beforeAll(() => {
				newPhone = { area: '312', line: '1212', local: '644' };
				newTag0 = 'first item';
			});
			test( 'replaces state slice with new value', () => {
				const _state = createSourceData();
				setState( _state, {
					phone: { [ SET_TAG ]: newPhone },
					tags: [ { [ SET_TAG ]: newTag0 }, ..._state.tags ]
				} );
				expect( _state ).toEqual({
					...state,
					phone: newPhone,
					tags: [ newTag0, ...state.tags ]
				});
			} );
			describe( 'concerning values data type', () => {
				test( 'allows replacing atomic state slice with composite values', () => {
					const _state = createSourceData();
					const newInfo = { value: false, reason: expect.anything() };
					setState( _state, {	isActive: { [ SET_TAG ]: newInfo } } );
					expect( _state ).toEqual({ ...state, isActive: newInfo })
				} );
				test( 'allows replacing composite state slice with atomic values', () => {
					const _state = createSourceData();
					const phoneNumber = 'TEST PHONE NUMBER';
					setState( _state, {	phone: { [ SET_TAG ]: phoneNumber } } );
					expect( _state ).toEqual({ ...state, phone: phoneNumber })
				} );
			} );
			describe( 'using compute function', () => {
				let _state, phoneArg, newPropArg;
				beforeAll(() => {
					_state = createSourceData();
					setState( _state, {
						phone: {
							[ SET_TAG ]: s => {
								phoneArg = s;
								return newPhone;
							}
						},
						newProp: {
							[ SET_TAG ]: s => {
								newPropArg = s;
								return s;
							}
						}
					} );
				});
				test( 'replaces state slice with the return value', () => {
					expect( _state ).toEqual({ ...state, newProp: newPropArg, phone: newPhone });
				} );
				test( 'supplies currently held state slice value as argument', () => {
					expect( newPropArg ).toBeUndefined();
					expect( phoneArg ).not.toBe( _state.phone );
					expect( phoneArg ).toStrictEqual( state.phone );
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
	} );
	describe( 'utilizing all set tags in a single call', () => {
		test( 'testing', () => {
			const onChangeMock = jest.fn();
			const state = createSourceData();
			state.faveColors = [ 'white', 'grey', 'green', 'blue', 'navy', 'midnight blue', 'indigo', 'sky blue' ];
			state.pets = [ 'Coco', 'Mimi', 'Kiki', 'Titi', 'Fifi', 'Lili' ];
			const _state = clonedeep( state );
			const changes = {
				age: 97,
				faveColors: {
					[ MOVE_TAG ]: [ -5, 2, 4 ], // => ['white', 'grey', 'blue', 'navy', 'midnight blue', 'indigo', 'green', 'sky blue']
					[ SPLICE_TAG ]: [ 0, 2, 'red', 'orange', 'yellow' ], // ['red', 'orange', 'yellow', 'blue', 'navy', 'midnight blue', 'indigo', 'green', 'sky blue']
					[ PUSH_TAG ]: [ 'silver', 'gold', 'bronze' ] // [...,'silver', 'gold', 'bronze']
				},
				friends: {
					[ DELETE_TAG ]: [ 0, -2 ],
					1: { name: { first: 'Mary' } },
					2: CLEAR_TAG
				},
				history: {
					places: {
						[ DELETE_TAG ]: [ 0, 2 ],
						testing: expect.anything() // this will be ignored: `testing` is neither a tag command key nor a valid array index
					}
				},
				pets: [
					{ [ REPLACE_TAG ]: 'Titi' },
					'Deedee',
					{ [ CLEAR_TAG ]: expect.anything() },
					'Momo',
					{ [ SET_TAG ]: s => s },
					'Lala',
					'Lulu',
					'Chuchu'
				],
				tags: {
					'-1': { [ SET_TAG ]: 'new last item' },
					1: { [ REPLACE_TAG ]: 'new 2nd item' },
					4: { [ SET_TAG ]: s => `${ s }_${ s.length }` }
				}
			};
			setState( _state, changes, onChangeMock );
			expect( _state ).toEqual({
				...state,
				age: 97,
				faveColors: ['red', 'orange', 'yellow', 'blue', 'navy', 'midnight blue', 'indigo', 'green', 'sky blue', 'silver', 'gold', 'bronze' ],
				friends: [ state.friends[ 2 ], { name: { first: 'Mary' } }, undefined ],
				history: { places: [ state.history.places[ 1 ] ] },
				pets: [ 'Titi', 'Deedee', '', 'Momo', state.pets[ 4 ], 'Lala', 'Lulu', 'Chuchu' ],
				tags: [ 'minim', 'new 2nd item', 'dolor', 'in', 'ullamco_7', 'laborum', 'new last item' ]
			});
			const arg = onChangeMock.mock.calls[ 0 ][ 0 ];
			expect( arg ).toBe( changes );
			expect( arg ).toEqual( changes );
			expect( arg ).toStrictEqual( changes );
		} );
		test( `allows '${ REPLACE_TAG } as an alias for '${ SET_TAG }' without the compute function`, () => {
			const state1 = createSourceData();
			const state2 = createSourceData();
			setState( state1, { name: { [ REPLACE_TAG ]: { first: 'Jame', last: 'Doe' }, age: 24 } } );
			setState( state2, { name: { [ SET_TAG ]: { first: 'Jame', last: 'Doe' }, age: 24 } } );
			expect( state1 ).toStrictEqual( state2 );
			expect( state ).not.toEqual( state1 );
		} );
		test( `does not allow '${ REPLACE_TAG } as an alias for '${ SET_TAG }' with the compute function`, () => {
			const state = createSourceData();
			const state1 = createSourceData();
			const state2 = createSourceData();
			const newBalance = 'TEST_BALANCE';
			const computeNewBalance = s => newBalance;
			setState( state1, { balance: { [ REPLACE_TAG ]: computeNewBalance } } );
			setState( state2, { balance: { [ SET_TAG ]: computeNewBalance } } );
			expect( state1 ).toEqual({ ...state, balance: computeNewBalance });
			expect( state2 ).toEqual({ ...state, balance: newBalance });
		} );
	} );
} );
