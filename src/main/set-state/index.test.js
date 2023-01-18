import {
	CLEAR_TAG,
	DELETE_TAG,
	MOVE_TAG,
	REPLACE_TAG,
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
		let onChangeMock, registered, newState;
		beforeAll(() => {
			onChangeMock = jest.fn();
			registered = clonedeep( state.registered );
			newState = {
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
			setState( state, newState, onChangeMock );
		});
		afterAll(() => { state.registered = registered });
		test( 'updates only new incoming changes', () => {
			expect( state.registered.time ).toStrictEqual( registered.time );
			[ 'day', 'year' ].forEach( k => {
				expect( state.registered[ k ] ).not.toEqual( registered[ k ] );
				expect( state.registered[ k ] ).toBe( newState.registered[ k ] );
			} );
			const state2 = createSourceData();
			const registered2 = clonedeep( state2.registered );
			const newState2 = clonedeep( newState );
			newState2.registered.time.hours = 17; // also add new `hours` value update to `time` object
			setState( state2, newState2 );
			expect( state2.registered.time ).not.toEqual( registered2.time );
			expect( state2.registered.time.hours ).not.toBe( registered2.time.hours );
			expect( state2.registered.time.minutes ).toBe( registered2.time.minutes );
			expect( state2.registered.time.seconds ).toBe( registered2.time.seconds );
		} )
		test( 'sends state change notifications', () => {
			expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
		} );
		test( 'communicates proposed changes as part of state change notification', () => {
			expect( onChangeMock ).toHaveBeenCalledWith( newState );
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
			let newState, onChangeMock;
			let origFriendsSlice;
			beforeAll(() => {
				origFriendsSlice = clonedeep( state.friends );
				newState = {
					friends: {
						1: { name: { first: 'Virginia' } },
						2: {
							id: 5,
							name: { first: 'Kathy', last: 'Smith' }
						}
					}
				};
				onChangeMock = jest.fn();
				setState( state, newState, onChangeMock );
			});
			afterAll(() => { state.friends = origFriendsSlice });
			test( 'maintains structural integrity of the subtree', () => {
				expect( Array.isArray( state.friends ) ).toBe( true );
			} );
			test( 'updates state with new changes', () => {
				expect( state.friends[ 0 ] ).toEqual( origFriendsSlice[ 0 ] ); // remains untouched
				expect( state.friends[ 1 ].name.first ).toBe( newState.friends[ 1 ].name.first );
				expect( state.friends[ 2 ] ).toEqual( newState.friends[ 2 ] );
			} );
			test( 'notifies listeners of state changes', () => {
				expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
				expect( onChangeMock ).toHaveBeenCalledWith( newState );
			} );
		} );
		describe( 'using indexed object to create new array entry', () => {
			let newEntryIndex, newState, onChangeMock, origFriendsSlice;
			beforeAll(() => {
				origFriendsSlice = clonedeep( state.friends );
				newEntryIndex = origFriendsSlice.length + 2;
				newState = {
					friends: {
						[ newEntryIndex ]: {
							id: newEntryIndex,
							name: { first: 'Rudie', last: 'Carson' }
						}
					}
				};
				onChangeMock = jest.fn();
				setState( state, newState, onChangeMock );
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
				expect( state.friends[ newEntryIndex ] ).toEqual( newState.friends[ newEntryIndex ] );
			} );
			test( 'notifies listeners of state changes', () => {
				expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
				expect( onChangeMock ).toHaveBeenCalledWith( newState );
			} );
		} );
		describe( 'using indexed object resulting in no new state change', () => {
			let newState, onChangeMock, origPlacesSlice;
			beforeAll(() => {
				origPlacesSlice = clonedeep( state.history.places );
				newState = {
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
				setState( state, newState, onChangeMock );
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
			let newState, onChangeMock;
			let origFriendsSlice;
			beforeAll(() => {
				origFriendsSlice = clonedeep( state.friends );
				newState = { friends: [ origFriendsSlice[ 2 ] ] };
				onChangeMock = jest.fn();
				setState( state, newState, onChangeMock );
			});
			afterAll(() => { state.friends = origFriendsSlice });
			test( 'truncates existing array to new array size', () => {
				expect( state.friends ).toHaveLength( newState.friends.length );
				expect( state.friends.length ).toBeLessThan( origFriendsSlice.length );
			} );
			test( 'updates state with new changes', () => {
				expect( state.friends ).toEqual( newState.friends );
			} );
			test( 'notifies listeners of state changes', () => {
				expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
				expect( onChangeMock ).toHaveBeenCalledWith( newState );
			} );
		} );
		describe( 'incoming array is a subset of existing array', () => {
			let newState, onChangeMock;
			let origFriendsSlice;
			beforeAll(() => {
				origFriendsSlice = clonedeep( state.friends );
				newState = { friends: origFriendsSlice.slice( 0, 2 ) }; // takes 1st 2 entries and omits the last
				onChangeMock = jest.fn();
				setState( state, newState, onChangeMock );
			});
			afterAll(() => { state.friends = origFriendsSlice });
			test( 'truncates existing array to new array size', () => {
				expect( state.friends ).toHaveLength( newState.friends.length );
				expect( state.friends.length ).toBeLessThan( origFriendsSlice.length );
			} );
			test( 'updates state with new changes', () => {
				expect( state.friends ).toEqual( newState.friends );
			} );
			test( 'notifies listeners of the removed last entry', () => {
				expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
				expect( onChangeMock ).toHaveBeenCalledWith( newState );
			} );
		} );
		describe( 'incoming array > existing array', () => {
			describe( 'where incoming array is completely different from existing array', () => {
				let newState, onChangeMock;
				let origFriendsSlice;
				beforeAll(() => {
					origFriendsSlice = clonedeep( state.friends );
					newState = { friends: [] };
					for( let i = 7; --i; ) {
						newState.friends.push({
							id: expect.any( Number ), name: { first: expect.any( String ), last: expect.any( String ) }
						});
					}
					onChangeMock = jest.fn();
					setState( state, newState, onChangeMock );
				});
				afterAll(() => { state.friends = origFriendsSlice });
				test( 'increases existing array size to fit new array items', () => {
					expect( state.friends ).toHaveLength( newState.friends.length );
					expect( state.friends.length ).toBeGreaterThan( origFriendsSlice.length );
				} );
				test( 'updates state with new changes', () => {
					expect( state.friends ).toEqual( newState.friends );
				} );
				test( 'notifies listeners of total state slice replacement', () => {
					const replacedFriendsSlice = {};
					newState.friends.forEach(( f, i ) => { replacedFriendsSlice[ i ] = f });
					expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
					expect( onChangeMock ).toHaveBeenCalledWith( newState );
				} );
			} );
			describe( 'where incoming array contains existing array entries at the matching indexes', () => {
				let newState, onChangeMock, lastNewStateEntry, origFriendsSlice, originalNewStateEntry0, originalNewStateEntry1;
				beforeAll(() => {
					origFriendsSlice = clonedeep( state.friends );
					originalNewStateEntry0 = { id: 15, name: { first: 'Sue', last: 'Jones' } };
					originalNewStateEntry1 = {
						id: expect.any( Number ), name: { first: expect.any( String ), last: expect.any( String ) }
					};
					lastNewStateEntry = origFriendsSlice[ 0 ];
					newState = { friends: clonedeep( origFriendsSlice ) };
					newState.friends[ 0 ] = originalNewStateEntry0;
					newState.friends.push( originalNewStateEntry1 );
					newState.friends.push( lastNewStateEntry );
					onChangeMock = jest.fn();
					setState( state, newState, onChangeMock );
				});
				afterAll(() => { state.friends = origFriendsSlice });
				test( 'increases existing array size to fit new array items', () => {
					expect( state.friends ).toHaveLength( newState.friends.length );
					expect( state.friends.length ).toBeGreaterThan( origFriendsSlice.length );
				} );
				test( 'updates state with new changes', () => {
					expect( state.friends ).toEqual( newState.friends );
				} );
				test( 'maintains 2nd and 3rd elements from previous array', () => {
					expect( state.friends[ 0 ] ).not.toEqual( origFriendsSlice[ 0 ] );
					expect( state.friends[ 1 ] ).toEqual( origFriendsSlice[ 1 ] );
					expect( state.friends[ 2 ] ).toEqual( origFriendsSlice[ 2 ] );
				} );
				test( 'notifies listeners of updated array entries', () => {
					expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
					expect( onChangeMock ).toHaveBeenCalledWith( newState );
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
					nullableDefaultTester: new Map()
				};
				setState( _state, {
					company: CLEAR_TAG,
					friends: { 1: CLEAR_TAG },
					history: { places: [ CLEAR_TAG, CLEAR_TAG ] },
					name: CLEAR_TAG,
					nullableDefaultTester: CLEAR_TAG,
					phone: CLEAR_TAG,
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
					friends: [ undefined, state.friends[ 1 ], undefined ],
					name: {},
					phone: { local: state.phone.local },
					tags: [ undefined, undefined, undefined, undefined, state.tags[ 4 ], state.tags[ 5 ], undefined ]
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
					// name: {},
					// phone: { local: state.phone.local },
					// tags: [ undefined, undefined, undefined, undefined, state.tags[ 4 ], state.tags[ 5 ], undefined ]
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
					friends: { [ DELETE_TAG ]: [ -1, 55, 'test' ] },
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
			test( 'sets the entire state to its default value', () => {
				let state = createSourceData();
				setState( state, MOVE_TAG );
				expect( state ).toEqual({});
				state = createSourceData();
				setState( state, { [ MOVE_TAG ]: expect.anything() } );
				expect( state ).toEqual({});
			} );
			test( `throws \`TypeError\` when \`${ MOVE_TAG }\` property value is not an array`, () => {
				expect(() => setState( createSourceData(), {
					company: { [ MOVE_TAG ]: state.company },
					friends: { 1: { [ MOVE_TAG ]: state.friends } },
					name: { [ MOVE_TAG ]: state.name },
					phone: { [ MOVE_TAG ]: state.phone, ...state.phone },
					tags: { [ MOVE_TAG ]: state.tags }
				} ) ).toThrow( TypeError );
			} );
			test( 'ignores non-existent properties', () => {
				const _state = createSourceData();
				const onChangeMock = jest.fn();
				setState( _state, { testing: MOVE_TAG }, onChangeMock );
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
				expect( _state ).toEqual({ ...state, ...stateReplacement });
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
		} );
	} );
	describe( `'${ SPLICE_TAG }' tag property key`, () => {
		test( 'sets the entire state to its default value', () => {
			let state = createSourceData();
			setState( state, SPLICE_TAG );
			expect( state ).toEqual({});
			state = createSourceData();
			setState( state, { [ SPLICE_TAG ]: expect.anything() } );
			expect( state ).toEqual({});
		} );
		test( `throws \`TypeError\` when \`${ SPLICE_TAG }\` property value is not an array`, () => {
			expect(() => setState( createSourceData(), {
				company: { [ SPLICE_TAG ]: state.company },
				friends: { 1: { [ SPLICE_TAG ]: state.friends } },
				name: { [ SPLICE_TAG ]: state.name },
				phone: { [ SPLICE_TAG ]: state.phone, ...state.phone },
				tags: { [ SPLICE_TAG ]: state.tags }
			} ) ).toThrow( TypeError );
		} );
		test( 'ignores non-existent properties', () => {
			const _state = createSourceData();
			const onChangeMock = jest.fn();
			setState( _state, { testing: SPLICE_TAG }, onChangeMock );
			expect( _state ).toEqual( state );
			expect( onChangeMock ).not.toHaveBeenCalled();
		} );
	} );
	describe( 'running all capabilities in a single call', () => {
		let state, newState;
		beforeAll(() => {
			state = createSourceData();
			state.pets = [ 'Coco', 'Mimi', 'Kiki', 'Titi', 'Fifi', 'Lili' ];
			newState = clonedeep( state );
			setState( newState, {
				age: 97,
				friends: {
					[ DELETE_TAG ]: [ 0, 1 ],
					1: { name: { first: 'Mary' } },
					2: CLEAR_TAG
				},
				history: {
					places: {
						[ DELETE_TAG ]: [ 0, 2 ]
					}
				},
				pets: [ 'Titi', 'Deedee', 'Coco', 'Lulu', 'Lala', 'Momo', 'Chuchu' ]
			} );
		});
		test( 'testing', () => {
			// expect( JSON.stringify( newState, null, 2 ) ).toBeNull();
			expect( newState ).toBeNull();
		});
	} );
} );
