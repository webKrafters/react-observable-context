import clonedeep from 'lodash.clonedeep';

import createSourceData from '../../test-artifacts/data/create-state-obj';

import { CLEAR_TAG, DELETE_TAG, REPLACE_TAG } from '../../constants';

import setState from '.';

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
			let state;
			beforeEach(() => { state = createSourceData() });
			test( 'results in no change when are equal', () => {
				const friends = state.friends;
				setState( state, { friends } );
				expect( state.friends ).toBe( friends );
			} );
			test( 'results in a merge of incoming into existing when are identical', () => {
				const friends = clonedeep( state.friends );
				setState( state, { friends } );
				expect( state.friends ).not.toBe( friends );
				expect( state.friends ).toStrictEqual( friends );
			} );
			test( 'results in a merge of incoming into existing when non-identical', () => {
				const friends = clonedeep( state.friends ).reverse();
				setState( state, { friends } );
				expect( state.friends ).not.toBe( friends );
				expect( state.friends ).toStrictEqual( friends );
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
		let reserved, state;
		beforeAll(() => { state = createSourceData() });
		beforeEach(() => {
			reserved = {
				company: state.company,
				friends: clonedeep( state.friends ),
				name: clonedeep( state.name ),
				phone: clonedeep( state.phone ),
				tags: clonedeep( state.tags )
			};
		});
		afterEach(() => { state = { ...state, ...reserved } });
		describe( `'${ CLEAR_TAG }' tag property key`, () => {
			test( 'sets the entire state to its default value', () => {
				let state = createSourceData();
				setState( state, CLEAR_TAG );
				expect( state ).toEqual({});
				state = createSourceData();
				setState( state, { [ CLEAR_TAG ]: expect.anything() } );
				expect( state ).toEqual({});
			});
			test( 'sets state slices to default values', () => {
				setState( state, {
					company: CLEAR_TAG,
					friends: { 1: CLEAR_TAG },
					name: CLEAR_TAG,
					phone: CLEAR_TAG,
					tags: CLEAR_TAG
				});
				expect( state ).toEqual({
					...state,
					company: null,
					friends: [ state.friends[ 0 ], {}, state.friends[ 2 ] ],
					name: {},
					phone: {},
					tags: []
				});
			} );
			test( 'also sets host property to default when present as a key in that property', () => {
				setState( state, {
					company: { [ CLEAR_TAG ]: state.company },
					friends: { 1: { [ CLEAR_TAG ]: state.friends } },
					name: { [ CLEAR_TAG ]: state.name },
					phone: { [ CLEAR_TAG ]: state.phone, ...state.phone },
					tags: { [ CLEAR_TAG ]: state.tags }
				});
				expect( state ).toEqual({
					...state,
					company: null,
					friends: [ state.friends[ 0 ], {}, state.friends[ 2 ] ],
					name: {},
					phone: {},
					tags: []
				});
			} );
			test( 'ignores non-existent properties', () => {
				const onChangeMock = jest.fn();
				setState( state, { testing: CLEAR_TAG }, onChangeMock );
				expect( state ).toEqual( createSourceData() );
				expect( onChangeMock ).not.toHaveBeenCalled();
			} );
			test( 'ignores properties already at their default states', () => {
				const onChangeMock = jest.fn();
				const _state = { ...state, friends: [], name: {} }
				setState( _state, { friends: CLEAR_TAG, name: CLEAR_TAG }, onChangeMock );
				expect( _state ).toEqual({ ...state, friends: [], name: {} });
				expect( onChangeMock ).not.toHaveBeenCalled();
			} );
		} );
		describe( `'${ DELETE_TAG }' tag property key`, () => {
			test( 'removes all listed top level properties', () => {
				const state = createSourceData();
				const removedKeys = [ '_id', 'address', 'friends', 'picture' ];
				setState( state, { [ DELETE_TAG ]: removedKeys } );
				expect( removedKeys.every( k => !( k in state ) ) ).toBe( true );
			});
			test( 'removes all listed properties', () => {
				const reserved = {
					friends: clonedeep( state.friends ),
					name: clonedeep( state.name ),
					phone: clonedeep( state.phone ),
					tags: clonedeep( state.tags )
				};
				setState( state, {
					friends: { [ DELETE_TAG ]: [ 0, 2 ] },
					name: { [ DELETE_TAG ]: [ 'first', 'last' ] },
					phone: { [ DELETE_TAG ]: [ 'area', 'country', 'line' ] },
					tags: { [ DELETE_TAG ]: [ 0, 1, 2, 3, 6 ] }
				});
				expect( state ).toEqual({
					...state,
					friends: [ undefined, state.friends[ 1 ], undefined ],
					name: {},
					phone: { local: state.phone.local },
					tags: [ undefined, undefined, undefined, undefined, state.tags[ 4 ], state.tags[ 5 ], undefined ]
				});
				state = { ...state, ...reserved };
			} );
			test( `throws \`TypeError\` when \`${ DELETE_TAG }\` property value is not an array`, () => {
				expect(() => setState( state, {
					company: { [ DELETE_TAG ]: state.company },
					friends: { 1: { [ DELETE_TAG ]: state.friends } },
					name: { [ DELETE_TAG ]: state.name },
					phone: { [ DELETE_TAG ]: state.phone, ...state.phone },
					tags: { [ DELETE_TAG ]: state.tags }
				})).toThrow( TypeError );
			} );
			test( `ignores non-existent property keys in the \`${ DELETE_TAG }\` property value`, () => {
				const onChangeMock = jest.fn();
				setState( state, {
					friends: { [ DELETE_TAG ]: [ -1, 55, 'test' ] },
					name: { [ DELETE_TAG ]: [ 'suffix' ] },
					phone: { [ DELETE_TAG ]: [ 'extension', 'isp' ] },
					tags: { [ DELETE_TAG ]: [ 101, 9, 30, 62 ] }
				}, onChangeMock );
				expect( state ).toEqual( createSourceData() );
				expect( onChangeMock ).not.toHaveBeenCalled();
			} );
			test( `ignores \`${ DELETE_TAG }\` property with empty array value`, () => {
				const onChangeMock = jest.fn();
				setState( state, {
					friends: { [ DELETE_TAG ]: [] },
					name: { [ DELETE_TAG ]: [] },
					phone: { [ DELETE_TAG ]: [] },
					tags: { [ DELETE_TAG ]: [] }
				}, onChangeMock );
				expect( state ).toEqual( createSourceData() );
				expect( onChangeMock ).not.toHaveBeenCalled();
			} );
		} );
		describe( `'${ REPLACE_TAG }' tag property key`, () => {
			test( 'adds new and replaces existing referenced top level properties', () => {
				const state = createSourceData();
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
				setState( state, { [ REPLACE_TAG ]: stateReplacement } );
				expect( state ).toEqual({ ...state, ...stateReplacement });
			});
			test( 'replaces properties with new value', () => {
				const newValues = {
					company: 'TEST_COMPANY',
					friends: 'NEW TEST FRIENDS',
					name: { first: 'Priscilla', middle: 'Samantha', last: 'Williams' },
					phone: {},
					tags: []
				};
				setState( state, {
					company: { [ REPLACE_TAG ]: newValues.company },
					friends: { [ REPLACE_TAG ]: newValues.friends },
					name: { [ REPLACE_TAG ]: newValues.name },
					phone: { [ REPLACE_TAG ]: newValues.phone },
					tags: { [ REPLACE_TAG ]: newValues.tags }
				});
				expect( state ).toEqual({ ...state, ...newValues });
			} );
			test( 'adds new values to property when specified', () => {
				const newValues = {
					company: 'TEST_COMPANY',
					friends: 'NEW TEST FRIENDS',
					name: { first: 'Priscilla', middle: 'Samantha', last: 'Williams' },
					phone: { extension: 'x456' }, // ADDING `extension` to state.phone
					tags: []
				};
				setState( state, {
					company: { [ REPLACE_TAG ]: newValues.company },
					friends: { [ REPLACE_TAG ]: newValues.friends },
					name: { [ REPLACE_TAG ]: newValues.name },
					phone: { extension: { [ REPLACE_TAG ]: newValues.phone.extension } },
					tags: { [ REPLACE_TAG ]: newValues.tags }
				});
				const expected = { ...state, ...newValues };
				expected.phone = { ...reserved.phone, extension: newValues.phone.extension };
				expect( state ).toEqual( expected );
			} );
		} );
	} );
} );
