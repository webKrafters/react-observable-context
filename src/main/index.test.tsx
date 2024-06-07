
import type {
	ConnectProps,
	ObservableContext as ObservableContextType,
	Store,
	StoreRef
} from '..';

import React, {
	useRef,
	useEffect,
	useCallback
} from 'react';

import {
	cleanup as cleanupPerfTest,
	perf,
	RenderCountField,
	wait
} from 'react-performance-testing';

import {
	cleanup,
	fireEvent,
	render,
	screen,
	SelectorMatcherOptions
} from '@testing-library/react';

import '@testing-library/jest-dom';

import * as AutoImmutableModule from '@webkrafters/auto-immutable';

import clonedeep from '@webkrafters/clone-total';

import { FULL_STATE_SELECTOR } from '../constants';

import {
	connect,
	createContext,
	UsageError,
	useContext
} from '.';

import type { SourceData } from '../test-artifacts/data/create-state-obj';

import createSourceData from '../test-artifacts/data/create-state-obj';

import AppNormal, {
	ObservableContext,
	Product,
	TallyDisplay
} from './test-apps/normal';
import AppWithConnectedChildren from './test-apps/with-connected-children';
import AppWithPureChildren from './test-apps/with-pure-children';

import {
	DELETE_TAG,
	MOVE_TAG,
	REPLACE_TAG
} from '../constants';

const { default: AutoImmutable } = AutoImmutableModule;

beforeAll(() => {
	jest.spyOn( console, 'log' ).mockImplementation(() => {});
	jest.spyOn( console, 'error' ).mockImplementation(() => {});
});
afterAll(() => jest.resetAllMocks());
afterEach( cleanup );

const transformRenderCount = ( renderCount, baseRenderCount = {} ) => {
	const netCount = {};
	for( const k of new Set([
		...Object.keys( renderCount.current ),
		...Object.keys( baseRenderCount )
	]) ) {
		netCount[ k ] = ( renderCount.current[ k ]?.value || 0 ) - ( baseRenderCount[ k ] || 0 );
	}
	return netCount;
};

describe( 'ReactObservableContext', () => {
	test( 'throws usage error on attempts to use context store outside of the Provider component tree', () => {
		// note: TallyDisplay component utilizes the ReactObservableContext store
		expect(() => render( <TallyDisplay /> )).toThrow( UsageError );
	} );
	describe( 'store updates from within the Provider tree', () => {
		describe( 'updates only subscribed components', () => {
			describe( 'using connected store subscribers', () => {
				test( 'scenario 1', async () => {
					const { renderCount } = perf( React );
					render( <AppWithConnectedChildren /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Price:' ), { target: { value: '123' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update price' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for price data
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for price data
						expect( netCount.PriceSticker ).toBe( 1 );
						expect( netCount.ProductDescription ).toBe( 0 ); // unaffected: no use for price data
						expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for price data
						expect( netCount.TallyDisplay ).toBe( 1 );
					});
					cleanupPerfTest();
				} );
				test( 'scenario 2', async () => {
					const { renderCount } = perf( React );
					render( <AppWithConnectedChildren /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Color:' ), { target: { value: 'Navy' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update color' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for product color data
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product color data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product color data
						expect( netCount.ProductDescription ).toBe( 1 );
						expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for product color data
						expect( netCount.TallyDisplay ).toBe( 1 );
					});
					cleanupPerfTest();
				} );
				test( 'scenario 3', async () => {
					const { renderCount } = perf( React );
					render( <AppWithConnectedChildren /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.ProductDescription ).toBe( 1 );
						expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.TallyDisplay ).toBe( 1 );
					});
					cleanupPerfTest();
				} );
				test( 'does not render subscribed components for resubmitted changes', async () => {
					const { renderCount } = perf( React );
					render( <AppWithConnectedChildren /> );
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no new product type data
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no new product type data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no new product type data
						expect( netCount.ProductDescription ).toBe( 0 ); // unaffected: no new product type data
						expect( netCount.Reset ).toBe( 0 ); // unaffected: no new product type data
						expect( netCount.TallyDisplay ).toBe( 0 ); // unaffected: no new product type data
					});
					cleanupPerfTest();
				} );
			} );
	 		describe( 'using pure-component store subscribers', () => {
				test( 'scenario 1', async () => {
					const { renderCount } = perf( React );
					render( <AppWithPureChildren /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Price:' ), { target: { value: '123' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update price' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for price data
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for price data
						expect( netCount.PriceSticker ).toBe( 1 );
						expect( netCount.ProductDescription ).toBe( 0 ); // unaffected: no use for price data
						expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for price data
						expect( netCount.TallyDisplay ).toBe( 1 );
					});
					cleanupPerfTest();
				} );
				test( 'scenario 2', async () => {
					const { renderCount } = perf( React );
					render( <AppWithPureChildren /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Color:' ), { target: { value: 'Navy' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update color' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for product color data
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product color data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product color data
						expect( netCount.ProductDescription ).toBe( 1 );
						expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for product color data
						expect( netCount.TallyDisplay ).toBe( 1 );
					});
					cleanupPerfTest();
				} );
				test( 'scenario 3', async () => {
					const { renderCount } = perf( React );
					render( <AppWithPureChildren /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.ProductDescription ).toBe( 1 );
						expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.TallyDisplay ).toBe( 1 );
					});
					cleanupPerfTest();
				} );
				test( 'does not render subscribed components for resubmitted changes', async () => {
					const { renderCount } = perf( React );
					render( <AppWithPureChildren /> );
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 );
						expect( netCount.Editor ).toBe( 0 );
						expect( netCount.PriceSticker ).toBe( 0 );
						expect( netCount.ProductDescription ).toBe( 0 ); // unaffected: no new product type data
						expect( netCount.Reset ).toBe( 0 );
						expect( netCount.TallyDisplay ).toBe( 0 ); // unaffected: no new product type data
					});
					cleanupPerfTest();
				} );
			} );
			describe( 'using non pure-component store subscribers', () => {
				test( 'scenario 1', async () => {
					const { renderCount } = perf( React );
					render( <AppNormal /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Price:' ), { target: { value: '123' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update price' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product price data
						expect( netCount.PriceSticker ).toBe( 1 );
						expect( netCount.ProductDescription ).toBe( 0 ); // unaffected: no use for product price data
						expect( netCount.Reset ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.TallyDisplay ).toBe( 1 );
					});
					cleanupPerfTest();
				} );
				test( 'scenario 2', async () => {
					const { renderCount } = perf( React );
					render( <AppNormal /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Color:' ), { target: { value: 'Navy' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update color' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product price data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product price data
						expect( netCount.ProductDescription ).toBe( 1 );
						expect( netCount.Reset ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.TallyDisplay ).toBe( 1 );
					});
					cleanupPerfTest();
				} );
				test( 'scenario 3', async () => {
					const { renderCount } = perf( React );
					render( <AppNormal /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.ProductDescription ).toBe( 1 );
						expect( netCount.Reset ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.TallyDisplay ).toBe( 1 );
					});
					cleanupPerfTest();
				} );
				test( 'does not render resubmitted changes', async () => {
					const { renderCount } = perf( React );
					render( <AppNormal /> );
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 );
						expect( netCount.Editor ).toBe( 0 );
						expect( netCount.PriceSticker ).toBe( 0 );
						expect( netCount.ProductDescription ).toBe( 0 ); // unaffected: no new product type data
						expect( netCount.Reset ).toBe( 0 );
						expect( netCount.TallyDisplay ).toBe( 0 ); // unaffected: no new product type data
					});
					cleanupPerfTest();
				} );
			} );
		} );
	} );
	describe( 'store updates from outside the Provider tree', () => {
		describe( 'with connected component children', () => {
			test( 'only re-renders Provider children affected by the Provider parent prop change', async () => {
				const { renderCount } = perf( React );
				render( <AppWithConnectedChildren /> );
				let baseRenderCount;
				await wait(() => { baseRenderCount = transformRenderCount( renderCount ); });
				fireEvent.keyUp( screen.getByLabelText( 'Type:' ), { target: { value: 'A' } } );
				await wait(() => {
					const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
					expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for product type data
					expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
					expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
					expect( netCount.ProductDescription ).toBe( 1 );
					expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for product type data
					expect( netCount.TallyDisplay ).toBe( 1 );
				});
				cleanupPerfTest();
			} );
			test( 'only re-renders parts of the Provider tree directly affected by the Provider parent state update', async () => {
				const { renderCount } = perf( React );
				render( <AppWithConnectedChildren /> );
				let baseRenderCount;
				await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
				fireEvent.keyUp( screen.getByLabelText( '$', {
					key: '5',
					code: 'Key5'
				} as SelectorMatcherOptions ) );
				await wait(() => {
					const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
					expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for product price data
					expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product price data
					expect( netCount.PriceSticker ).toBe( 1 );
					expect( netCount.ProductDescription ).toBe( 0 ); // unaffected: no use for product price data
					expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for product price data
					expect( netCount.TallyDisplay ).toBe( 1 );
				});
				cleanupPerfTest();
			} );
	 	} );
		describe( 'with pure-component children', () => {
			test( 'only re-renders Provider children affected by the Provider parent prop change', async () => {
				const { renderCount } = perf( React );
				render( <AppWithPureChildren /> );
				let baseRenderCount;
				await wait(() => { baseRenderCount = transformRenderCount( renderCount ); });
				fireEvent.keyUp( screen.getByLabelText( 'Type:' ), { target: { value: 'A' } } );
				await wait(() => {
					const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
					expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for product type data
					expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
					expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
					expect( netCount.ProductDescription ).toBe( 1 );
					expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for product type data
					expect( netCount.TallyDisplay ).toBe( 1 );
				});
				cleanupPerfTest();
			} );
			test( 'only re-renders parts of the Provider tree directly affected by the Provider parent state update', async () => {
				const { renderCount } = perf( React );
				render( <AppWithPureChildren /> );
				let baseRenderCount;
				await wait(() => { baseRenderCount = transformRenderCount( renderCount ); });
				fireEvent.keyUp( screen.getByLabelText( '$', { key: '5', code: 'Key5' } as SelectorMatcherOptions ) );
				await wait(() => {
					const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
					expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for product price data
					expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product price data
					expect( netCount.PriceSticker ).toBe( 1 );
					expect( netCount.ProductDescription ).toBe( 0 ); // unaffected: no use for product price data
					expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for product price data
					expect( netCount.TallyDisplay ).toBe( 1 );
				});
				cleanupPerfTest();
			} );
		} );
		describe( 'with non pure-component children ', () => {
			test( 'only re-renders Provider children affected by the Provider parent prop change', async () => {
				const { renderCount } = perf( React );
				render( <AppNormal /> );
				let baseRenderCount;
				await wait(() => { baseRenderCount = transformRenderCount( renderCount ); });
				fireEvent.keyUp( screen.getByLabelText( 'Type:' ), { target: { value: 'A' } } );
				await wait(() => {
					const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
					expect( netCount.CustomerPhoneDisplay ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
					expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
					expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
					expect( netCount.ProductDescription ).toBe( 1 );
					expect( netCount.Reset ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
					expect( netCount.TallyDisplay ).toBe( 1 );
				});
				cleanupPerfTest();
			} );
			test( 'oonly re-renders parts of the Provider tree directly affected by the Provider parent state update', async () => {
				const { renderCount } = perf( React );
				render( <AppNormal /> );
				let baseRenderCount;
				await wait(() => { baseRenderCount = transformRenderCount( renderCount ); });
				fireEvent.keyUp( screen.getByLabelText( '$', { key: '5', code: 'Key5' } as SelectorMatcherOptions ) );
				await wait(() => {
					const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;;
					expect( netCount.CustomerPhoneDisplay ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
					expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product price data
					expect( netCount.PriceSticker ).toBe( 1 );
					expect( netCount.ProductDescription ).toBe( 0 ); // unaffected: no use for product price data
					expect( netCount.Reset ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
					expect( netCount.TallyDisplay ).toBe( 1 );
				});
				cleanupPerfTest();
			} );
		} );
	} );
	describe( 'accessing store externally through its provider', () => {
		const sourceData = createSourceData();
		let storeRef : React.MutableRefObject<StoreRef<SourceData>>;
		let ObservableContext : ObservableContextType<Partial<SourceData>>;
		let TestComp;
		beforeAll(() => {
			ObservableContext = createContext();
			TestComp = ({ children }) => {
				const ref = useRef<StoreRef<SourceData>>();
				useEffect(() => { storeRef = ref }, []);
				return (
					<ObservableContext.Provider
						children={ children }
						ref={ ref }
						value={ sourceData }
					/>
				)
			}
		});
		test( 'is successful', () => {
			storeRef = undefined;
			render( <TestComp /> );
			expect( storeRef.current )
				.toEqual( expect.objectContaining({
					getState: expect.any( Function ),
					resetState: expect.any( Function ),
					setState: expect.any( Function ),
					subscribe: expect.any( Function )
				})
			);	
		});
		test( 'can read the current store data', async () => {
			storeRef = undefined;
			const NEW_AGE = 71;
			const Child =  connect( ObservableContext )(({ setState }) => {
				const setAge = React.useCallback(
					() => setState({ age: NEW_AGE }),
					[ setState ]
				);
				return ( <button value="set age" onClick={ setAge } /> );
			});
			render( <TestComp><Child /></TestComp> );
			expect( storeRef.current.getState().age ).toBe( sourceData.age );
			fireEvent.click( screen.getByRole( 'button' ) );
			expect( storeRef.current.getState().age ).toBe( NEW_AGE );
			cleanupPerfTest();
		});
		test( 'can update store and propagate observing components', async () => {
			storeRef = undefined;
			const Child =  connect( ObservableContext, {
				fName: 'name.first'
			})(({ data: { fName } }) => (
				<>They call me: <span data-testid="fname">{ fName }</span></>
			));
			render( <TestComp><Child /></TestComp> );
			expect( screen.getByTestId( 'fname' ).textContent )
				.toEqual( sourceData.name.first );
			const NEW_FNAME = 'Imagene';
			storeRef.current.setState({
				name: {
					first: NEW_FNAME
				} as SourceData["name"]
			});
			await wait(() => {
				expect( screen.getByTestId( 'fname' ).textContent )
					.toEqual( NEW_FNAME );
			});
			cleanupPerfTest();
		});
		test( 'can reset store and propagate observing components', async () => {
			storeRef = undefined;
			const NEW_EMAIL = 'some.gobbledygook.co.uk';
			const Child =  connect( ObservableContext, {
				myEmail: 'email'
			} )(({ data: { myEmail }, setState }) => {
				const setEmail = React.useCallback(
					() => setState({ email: NEW_EMAIL }),
					[ setState ]
				);
				return (
					<>
						<>Here is my email: <span data-testid="myemail">{ myEmail }</span></>
						<button value="set email" onClick={ setEmail } />
					</>
				);
			});
			render( <TestComp><Child /></TestComp> );
			expect( screen.getByTestId( 'myemail' ).textContent )
				.toEqual( sourceData.email );
			fireEvent.click( screen.getByRole( 'button' ) );
			await await(() => {
				expect( screen.getByTestId( 'myemail' ).textContent )
					.toEqual( NEW_EMAIL );
			});
			storeRef.current.resetState([ 'email' ]);
			await wait(() => {
				expect( screen.getByTestId( 'myemail' ).textContent )
					.toEqual( sourceData.email );
			});
			cleanupPerfTest();
		});
		test( 'can observe state changes coming into the store', async () => {
			storeRef = undefined;
			const Child =  connect( ObservableContext )(({ setState }) => {
				const setCompany = React.useCallback(
					e => setState({ company: e.target.value }),
					[ setState ]
				);
				return ( <button value="set company" onClick={ setCompany } /> );
			});
			render( <TestComp><Child /></TestComp> );
			const onChangeMock = jest.fn();
			const unsub = storeRef.current.subscribe( onChangeMock );
			const NEW_CNAME = 'What is my company name again?????';
			fireEvent.click( screen.getByRole( 'button' ), {
				target: { value: NEW_CNAME }
			});
			expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
			expect( onChangeMock ).toHaveBeenCalledWith({
				company: NEW_CNAME
			});
			onChangeMock.mockClear();
			const NEW_CNAME2 = 'Alright! let me tell you what\'s what!!!!!';
			fireEvent.click( screen.getByRole( 'button' ), {
				target: { value: NEW_CNAME2 }
			});
			expect( onChangeMock ).toHaveBeenCalledTimes( 1 );
			expect( onChangeMock ).toHaveBeenCalledWith({
				company: NEW_CNAME2
			});
			unsub(); // unsubscribe store change listener
			onChangeMock.mockClear();
			const NEW_CNAME3 = 'Geez! Did you get the name I just gave ya?????';
			fireEvent.click( screen.getByRole( 'button' ), {
				target: { value: NEW_CNAME3 }
			});
			expect( onChangeMock ).not.toHaveBeenCalled();
			cleanupPerfTest();
		});
	} );
	describe( 'prehooks', () => {
		describe( 'resetState prehook', () => {
			describe( 'when `resetState` prehook does not exist on the context', () => {
				test( 'completes `store.resetState` method call', async () => {
					const { renderCount } = perf( React );
					const prehooks = {};
					render( <Product prehooks={ prehooks } type="Computer" /> );
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.click( screen.getByRole( 'button', { name: 'reset context' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.ProductDescription ).toBe( 1 ); // DULY UPDATED WITH NEW STATE RESET
						expect( netCount.Reset ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.TallyDisplay ).toBe( 1 ); // DULY UPDATED WITH NEW STATE RESET
					});
					cleanupPerfTest();
				} );
			} );
			describe( 'when `resetState` prehook exists on the context', () => {
				test( 'is called by the `store.resetState` method', async () => {
					const prehooks = Object.freeze({ resetState: jest.fn().mockReturnValue( false ) });
					render( <Product prehooks={ prehooks } type="Computer" /> );
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					fireEvent.change( screen.getByLabelText( 'New Color:' ), { target: { value: 'Teal' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update color' } ) );
					prehooks.resetState.mockClear();
					fireEvent.click( screen.getByRole( 'button', { name: 'reset context' } ) );
					expect( prehooks.resetState ).toHaveBeenCalledTimes( 1 );
					expect( prehooks.resetState ).toHaveBeenCalledWith({
						[ REPLACE_TAG ]: {
							// data slices from original state to reset current state slices
							color: 'Burgundy',
							customer: {
								name: { first: null, last: null },
								phone: null
							},
							price: 22.5,
							type: 'Computer'
						}
					}, {
						// current: context state value after the `update type` & `update color` button clicks
						current: {
							color: 'Teal',
							customer: {
								name: { first: null, last: null },
								phone: null
							},
							price: 22.5,
							type: 'Bag'
						},
						// original: obtained from the './normal' Product >> Provider value prop
						original: {
							color: 'Burgundy',
							customer: {
								name: { first: null, last: null },
								phone: null
							},
							price: 22.5,
							type: 'Computer'
						}
					});
				} );
				test( 'completes `store.setState` method call if `setState` prehook returns TRUTHY', async () => {
					const { renderCount } = perf( React );
					const prehooks = Object.freeze({ resetState: jest.fn().mockReturnValue( true ) });
					render( <Product prehooks={ prehooks } type="Computer" /> );
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.click( screen.getByRole( 'button', { name: 'reset context' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;;
						expect( netCount.CustomerPhoneDisplay ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.ProductDescription ).toBe( 1 ); // DULY UPDATED WITH NEW STATE RESET
						expect( netCount.Reset ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.TallyDisplay ).toBe( 1 ); // DULY UPDATED WITH NEW STATE RESET
					});
					cleanupPerfTest();
				} );
				test( 'aborts `store.setState` method call if `setState` prehook returns FALSY', async () => {
					const { renderCount } = perf( React );
					const prehooks = Object.freeze({ resetState: jest.fn().mockReturnValue( false ) });
					render( <Product prehooks={ prehooks } type="Computer" /> );
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.click( screen.getByRole( 'button', { name: 'reset context' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.ProductDescription ).toBe( 0 ); // NORMAL UPDATE DUE CANCELED: RESET STATE ABORTED
						expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.TallyDisplay ).toBe( 0 ); // NORMAL UPDATE DUE CANCELED: RESET STATE ABORTED
					});
					cleanupPerfTest();
				} );
			} );
		} );
		describe( 'setState prehook', () => {
			describe( 'when `setState` prehook does not exist on the context', () => {
				test( 'completes `store.setState` method call', async () => {
					const { renderCount } = perf( React );
					const prehooks = Object.freeze( expect.any( Object ) );
					render( <Product prehooks={ prehooks } type="Computer" /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.ProductDescription ).toBe( 1 ); // DULY UPDATED WITH NEW STATE CHANGE
						expect( netCount.Reset ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.TallyDisplay ).toBe( 1 ); // DULY UPDATED WITH NEW STATE CHANGE
					});
					cleanupPerfTest();
				} );
			} );
			describe( 'when `setState` prehook exists on the context', () => {
				test( 'is called by the `store.setState` method', async () => {
					const prehooks = Object.freeze({ setState: jest.fn().mockReturnValue( false ) });
					render( <Product prehooks={ prehooks } type="Computer" /> );
					prehooks.setState.mockClear();
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					expect( prehooks.setState ).toHaveBeenCalledTimes( 1 );
					expect( prehooks.setState ).toHaveBeenCalledWith({ type: 'Bag' });
				} );
				test( 'completes `store.setState` method call if `setState` prehook returns TRUTHY', async () => {
					const { renderCount } = perf( React );
					const prehooks = Object.freeze({ setState: jest.fn().mockReturnValue( true ) });
					render( <Product prehooks={ prehooks } type="Computer" /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.ProductDescription ).toBe( 1 ); // DULY UPDATED WITH NEW STATE CHANGE
						expect( netCount.Reset ).toBe( 1 ); // UPDATED BY REACT PROPAGATION (b/c no memoization)
						expect( netCount.TallyDisplay ).toBe( 1 ); // DULY UPDATED WITH NEW STATE CHANGE
					});
					cleanupPerfTest();
				} );
				test( 'aborts `store.setState` method call if `setState` prehook returns FALSY', async () => {
					const { renderCount } = perf( React );
					const prehooks = Object.freeze({ setState: jest.fn().mockReturnValue( false ) });
					render( <Product prehooks={ prehooks } type="Computer" /> );
					let baseRenderCount;
					await wait(() => { baseRenderCount = transformRenderCount( renderCount ) });
					fireEvent.change( screen.getByLabelText( 'New Type:' ), { target: { value: 'Bag' } } );
					fireEvent.click( screen.getByRole( 'button', { name: 'update type' } ) );
					await wait(() => {
						const netCount = transformRenderCount( renderCount, baseRenderCount ) as any;
						expect( netCount.CustomerPhoneDisplay ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.Editor ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.PriceSticker ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.ProductDescription ).toBe( 0 ); // NORMAL UPDATE DUE CANCELED: SET STATE ABORTED
						expect( netCount.Reset ).toBe( 0 ); // unaffected: no use for product type data
						expect( netCount.TallyDisplay ).toBe( 0 ); // NORMAL UPDATE DUE CANCELED: SET STATE ABORTED
					});
					cleanupPerfTest();
				} );
			} );
		} );
	} );

	describe( 'API', () => {
		describe( 'connect(...)', () => {
			let state : {items: Array<{name: string}>};
			let connector, ObservableContext, selectorMap;
			let ConnectedComponent1, ConnectedComponent2, ConnectedRefForwardingComponent, ConnectedMemoizedComponent;
			let compOneProps, compTwoProps, refForwardingCompProps, memoCompProps;
			beforeAll(() => {
				state = {
					items: [
						{ name: 'box_0' },
						{ name: 'box_1' },
						{ name: 'box_2' },
						{ name: 'box_3' }
					]
				};
				ObservableContext = createContext<typeof state>();
				selectorMap = {
					all: FULL_STATE_SELECTOR,
					box: 'items.1.name'
				};
				connector = connect( ObservableContext, selectorMap );
				ConnectedComponent1 = connector( props => { compOneProps = props; return null } );
				ConnectedComponent2 = connector( props => { compTwoProps = props; return null } );
				const RefForwardingComponent = React.forwardRef(( props, ref ) => { refForwardingCompProps = props; return null });
				RefForwardingComponent.displayName = 'Connect.RefForwardingComponent';
				ConnectedRefForwardingComponent = connector( RefForwardingComponent );
				const MemoizedComponent = React.memo( props => { memoCompProps = props; return null });
				MemoizedComponent.displayName = 'Connect.MemoizedComponent';
				ConnectedMemoizedComponent = connector( MemoizedComponent );
			});
			test( 'returns a function', () => expect( connector ).toBeInstanceOf( Function ) );
			describe( "returned function's return value", () => {
				beforeAll(() => {
					const Ui = () => (
						<article>
							<header>Just a Nested Content Tester</header>
							<main>
								<ConnectedComponent1 />
								<ConnectedComponent2 />
								<ConnectedRefForwardingComponent />
								<ConnectedMemoizedComponent />
							</main>
							<footer>The End</footer>
						</article>
					);
					render(
						<ObservableContext.Provider value={ state }>
							<Ui />
						</ObservableContext.Provider>
					);
				});
				test( 'is always a memoized component', () => {
					expect( 'compare' in ConnectedComponent1 ).toBe( true );
					expect( 'compare' in ConnectedComponent2 ).toBe( true );
					expect( 'compare' in ConnectedRefForwardingComponent ).toBe( true );
					expect( 'compare' in ConnectedMemoizedComponent ).toBe( true );
				} );
				test( 'is always interested in the same context state data', () => {
					expect( compOneProps.data ).toStrictEqual( compTwoProps.data );
					expect( compOneProps.data ).toStrictEqual( refForwardingCompProps.data );
					expect( compOneProps.data ).toStrictEqual( memoCompProps.data );
				} );
				test( "contains the store's public API", () => {
					const data = {};
					for( const k in selectorMap ) { data[ k ] = expect.anything() }
					expect( compOneProps ).toEqual({
						data,
						resetState: expect.any( Function ),
						setState: expect.any( Function )
					});
				} );
				test( 'accepts own props (i.e. additional props at runtime)', () => {
					let capturedProps;
					const selectorMap = {
						fullBox2: 'items[1]',
						nameFirstBox: 'items.0.name'
					};
					const ownProps = {
						anotherOwnProp: expect.anything(),
						ownProp: expect.anything()
					};
					const WrappedComponent : React.ComponentType<ConnectProps<
						typeof ownProps,
						typeof state,
						typeof selectorMap
					>> = props => {
						capturedProps = props;
						return ( <div /> );
					};
					const ConnectedComponent = connect( ObservableContext, selectorMap )( WrappedComponent );
					const App = () => (
						<ObservableContext.Provider value={ state }>
							<ConnectedComponent { ...ownProps } ref={ React.useRef() } />
						</ObservableContext.Provider>
					);
					render( <App /> );
					const data = {};
					for( const k in selectorMap ) { data[ k ] = expect.anything() }
					expect( capturedProps ).toEqual({
						...ownProps,
						data,
						resetState: expect.any( Function ),
						setState: expect.any( Function )
					});
				} );
				describe( 'prop name conflict resolution: ownProps vs store API props', () => {
					test( 'defaults to ownProps', () => {
						let capturedProps;
						const selectorMap = {
							fullBox2: 'items[1]',
							nameFirstBox: 'items.0.name'
						};
						const T = props => {
							capturedProps = props;
							return null
						};
						const ownProps = {
							data: {
								anotherOwnProp: expect.anything(),
								ownProp: expect.anything()
							}
						};
						const ConnectedComponent = connect( ObservableContext, selectorMap )( T );
						render(
							<ObservableContext.Provider value={ state }>
								<ConnectedComponent { ...ownProps } />
							</ObservableContext.Provider>
						);
						const data = {};
						for( const k in selectorMap ) { data[ k ] = expect.anything() }
						expect( capturedProps ).toEqual({
							...ownProps, // using `data` from ownProps
							resetState: expect.any( Function ),
							setState: expect.any( Function )
						});
					} );
				} );
			} );
		} );
		describe( 'createContext(...)', () => {
			test( 'returns observable context', () => {
				expect( ObservableContext ).toEqual(
					expect.objectContaining({
						"$$typeof": expect.any( Symbol ),
						Consumer: expect.any( Object ),
						Provider: expect.any( Object )
					})
				);
				expect( ObservableContext.Consumer.$$typeof.toString() )
					.toEqual( 'Symbol(react.context)' );
				expect( ObservableContext.Provider.$$typeof.toString() )
					.toEqual( 'Symbol(react.forward_ref)' );
			} );
			describe( 'Context provider component property', () => {
				test( 'also allows for no children', () => {
					let renderResult;
					expect(() => { renderResult = render( <ObservableContext.Provider value={{}} /> ) }).not.toThrow();
					expect( renderResult.container ).toBeEmptyDOMElement();
				} );
				describe( 'with store object reference for external exposure', () => {
					let state, storeRef, TestProvider;
					beforeAll(() => {
						state = {
							color: 'Burgundy',
							customer: {
								name: { first: 'tFirst', last: 'tLast' },
								phone: null
							},
							price: 22.5,
							type: 'TEST TYPE'
						}
						TestProvider = () => { // eslint-disable-line react/display-name
							storeRef = React.useRef();
							return (
								<ObservableContext.Provider ref={ storeRef } value={ state }>
									<TallyDisplay />
								</ObservableContext.Provider>
							);
						};
					});
					test( 'is provided', () => {
						render( <TestProvider /> );
						expect( storeRef.current ).toStrictEqual( expect.objectContaining({
							getState: expect.any( Function ),
							resetState: expect.any( Function ),
							setState: expect.any( Function ),
							subscribe: expect.any( Function )
						}) );
					} );
					test( 'gets a copy of the current state', () => {
						render( <TestProvider /> );
						const currentState = storeRef.current.getState();
						expect( currentState ).not.toBe( state );
						expect( currentState ).toStrictEqual( state );
					} );
					test( 'updates internal state', async () => {
						const { renderCount } = perf( React );
						render( <TestProvider /> );
						await wait(() => {});
						expect( ( renderCount.current.TallyDisplay as RenderCountField ).value ).toBe( 1 );
						const currentState = storeRef.current.getState();
						storeRef.current.setState({ price: 45 });
						const newState = { ...state, price: 45 };
						await wait(() => {});
						await new Promise( resolve => setTimeout( resolve, 50 ) );
						expect( ( renderCount.current.TallyDisplay as RenderCountField ).value ).toBe( 2 );
						expect( currentState ).not.toEqual( newState );
						expect( storeRef.current.getState() ).toEqual( newState );
						storeRef.current.resetState([ FULL_STATE_SELECTOR ]); // resets store internal state
						await wait(() => {});
						await new Promise( resolve => setTimeout( resolve, 50 ) );
						expect( ( renderCount.current.TallyDisplay as RenderCountField ).value ).toBe( 3 );
						const currentState2 = storeRef.current.getState();
						expect( currentState2 ).not.toBe( state );
						expect( currentState2 ).toStrictEqual( state );
						expect( currentState2 ).not.toBe( currentState );
						expect( currentState2 ).toStrictEqual( currentState );
						cleanupPerfTest();
					} );
					test( 'subscribes to state changes', async () => {
						render( <TestProvider /> );
						const changes = { price: 45 };
						const onChangeMock = jest.fn();
						const unsub = storeRef.current.subscribe( onChangeMock );
						expect( onChangeMock ).not.toHaveBeenCalled();
						storeRef.current.setState( changes );
						expect( onChangeMock ).toHaveBeenCalled();
						expect( onChangeMock ).toHaveBeenCalledWith( changes );
						onChangeMock.mockClear();
						storeRef.current.resetState([ FULL_STATE_SELECTOR ]);
						expect( onChangeMock ).toHaveBeenCalled();
						expect( onChangeMock ).toHaveBeenCalledWith({ [ REPLACE_TAG ]: state });
						onChangeMock.mockClear();
						unsub();
						storeRef.current.setState( changes );
						expect( onChangeMock ).not.toHaveBeenCalled();
						storeRef.current.resetState([ FULL_STATE_SELECTOR ]);
						expect( onChangeMock ).not.toHaveBeenCalled();
					} );
				} );
			} );
		} );
		describe( 'useContext(...)', () => {
			let Client, Wrapper;
			let sourceData : SourceData;
			let ObservableContext : ObservableContextType<SourceData>;
			let selectorMapOnRender : Record<string, string>;
			beforeAll(() => {
				sourceData = createSourceData();
				selectorMapOnRender = {
					year3: 'history.places[2].year',
					isActive: 'isActive',
					tag6: 'tags[5]'
				};
				/* eslint-disable react/display-name */
				Client = ({ selectorMap, onChange = (...args) => {} }) => {
					const store = useContext( ObservableContext, selectorMap );
					React.useMemo(() => onChange( store ), [ store ]);
					return (
						<div data-testid="data-output">
							{ JSON.stringify( store.data ) }
						</div>
					);
				};
				Client.displayName = 'Client';
				ObservableContext = createContext<SourceData>();
				Wrapper = ({ children }) => (
					<ObservableContext.Provider value={ sourceData }>
						{ children }
					</ObservableContext.Provider>
				);
				Wrapper.displayName = 'Wrapper';
				/* eslint-disable react/display-name */
			});
			test( 'returns an observable context store', () => {
				let store : Store<SourceData>;
				const onChange = s => { store = s };
				render(
					<Wrapper>
						<Client
							onChange={ onChange }
							selectorMap={{
								all: FULL_STATE_SELECTOR,
								tags: 'tags'
							}}
						/>
					</Wrapper>
				);
				expect( store ).toEqual({
					data: {
						all: sourceData,
						tags: sourceData.tags
					},
					resetState: expect.any( Function ),
					setState: expect.any( Function )
				});
			} );
			describe( 'selectorMap update', () => {
				let selectorMapOnRerender : Record<string, string>;
				let mockGetReturnValue : Record<string, string>
				beforeAll(() => {
					selectorMapOnRerender = clonedeep( selectorMapOnRender );
					selectorMapOnRerender.country3 = 'history.places[2].country';
					mockGetReturnValue = Array.from( new Set(
						Object.values( selectorMapOnRender ).concat(
							Object.values( selectorMapOnRerender )
						)
					) ).reduce(( o, k ) => {
						o[ k ] = null;
						return o;
					}, {});
				});
				describe( 'normal flow', () => {
					test( 'adjusts the store on selctorMap change', () => {
						let _data : Record<any, any>;
						const onChange = ({ data }) => { _data = data };
						const { rerender } = render(
							<Wrapper>
								<Client
									onChange={ onChange }
									selectorMap={ selectorMapOnRender }
								/>
							</Wrapper>
						);
						expect( Object.keys( _data ) )
							.toEqual( Object.keys( selectorMapOnRender ));
						rerender(
							<Wrapper>
								<Client
									onChange={ onChange }
									selectorMap={ selectorMapOnRerender }
								/>
							</Wrapper>
						);
						expect( Object.keys( _data ) )
							.toEqual( Object.keys( selectorMapOnRerender ));
					});
					test( 'destroys previous and obtains new connection', () => {
						const cache = new AutoImmutable( createSourceData() );
						const connection = cache.connect();
						const disconnectSpy = jest.spyOn( connection, 'disconnect' );
						const getSpy = jest
							.spyOn( connection, 'get' )
							.mockReturnValue( mockGetReturnValue );
						const connectSpy = jest
							.spyOn( cache, 'connect' )
							.mockReturnValue( connection )
						const cacheSpy = jest
							.spyOn( AutoImmutableModule, 'default' )
							.mockReturnValue( cache );
						const mockUnsubscribe = jest.fn();
						const mockSubscribe = jest.fn()
							.mockReturnValue( mockUnsubscribe );
						
						const reactUseContextSpy = jest
							.spyOn( React, 'useContext' )
							.mockReturnValue({
								cache,
								resetState: () => {},
								setState: () => {},
								subscribe: mockSubscribe
							});
						const { rerender } = render(
							<Wrapper>
								<Client selectorMap={ selectorMapOnRender } />
							</Wrapper>
						);
						expect( connectSpy ).toHaveBeenCalledTimes( 3 );
						expect( mockSubscribe ).toHaveBeenCalledTimes( 1 );
						expect( disconnectSpy ).not.toHaveBeenCalled();
						expect( mockUnsubscribe ).not.toHaveBeenCalled();
						rerender(
							<Wrapper>
								<Client selectorMap={ selectorMapOnRerender } />
							</Wrapper>
						);
						expect( connectSpy ).toHaveBeenCalledTimes( 4 );
						expect( mockSubscribe ).toHaveBeenCalledTimes( 2 );
						expect( disconnectSpy ).toHaveBeenCalledTimes( 1 );
						expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
						reactUseContextSpy.mockRestore();
						cacheSpy.mockRestore();
					});
					describe( 'when the new selectorMap is not empty', () => {
						test( 'refreshes state data', () => {
							const cache = new AutoImmutable( createSourceData() );
							const connection = cache.connect();
							const getSpy = jest
								.spyOn( connection, 'get' )
								.mockReturnValue( mockGetReturnValue );
							const connectSpy = jest
								.spyOn( cache, 'connect' )
								.mockReturnValue( connection )
							const cacheSpy = jest
								.spyOn( AutoImmutableModule, 'default' )
								.mockReturnValue( cache );
							expect( getSpy ).not.toHaveBeenCalled();
							const { rerender } = render(
								<Wrapper>
									<Client selectorMap={ selectorMapOnRender } />
								</Wrapper>
							);
							expect( getSpy ).toHaveBeenCalledTimes( 2 );
							expect( getSpy.mock.calls[ 1 ] ).toEqual(
								Object.values( selectorMapOnRender )
							);
							getSpy.mockClear();
							rerender(
								<Wrapper>
									<Client selectorMap={ selectorMapOnRerender } />
								</Wrapper>
							);
							expect( getSpy ).toHaveBeenCalledTimes( 1 );
							expect( getSpy ).toHaveBeenCalledWith(
								...Object.values( selectorMapOnRerender )
							);
							cacheSpy.mockRestore();
						});
						test( 'sets up new subscription with the consumer', () => {
							const mockUnsubscribe = jest.fn();
							const mockSubscribe = jest.fn()
								.mockReturnValue( mockUnsubscribe );
							const reactUseContextSpy = jest
								.spyOn( React, 'useContext' )
								.mockReturnValue({
									cache: new AutoImmutable( createSourceData() ),
									resetState: () => {},
									setState: () => {},
									subscribe: mockSubscribe
								});
							const { rerender } = render(
								<Wrapper>
									<Client selectorMap={ selectorMapOnRender } />
								</Wrapper>
							);
							expect( mockSubscribe ).toHaveBeenCalledTimes( 1 );
							expect( mockUnsubscribe ).not.toHaveBeenCalled();
							rerender(
								<Wrapper>
									<Client selectorMap={ selectorMapOnRerender } />
								</Wrapper>
							);
							expect( mockSubscribe ).toHaveBeenCalledTimes( 2 );
							expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
							reactUseContextSpy.mockRestore();
						});
					});
				} );
				describe( 'accepting an array of propertyPaths in place of a selector map', () => {
					let store : Store<SourceData>;
					beforeAll(() => {
						const onChange = s => { store = s };
						render(
							<Wrapper>
								<Client onChange={ onChange } selectorMap={[
									...Object.values( selectorMapOnRender ),
									FULL_STATE_SELECTOR
								]} />
							</Wrapper>
						);
					});
					test( 'produces an indexed-based context state data object', () => {
						const stateSource = createSourceData();
						expect( store.data ).toStrictEqual({
							0: stateSource.history.places[ 2 ].year,
							1: stateSource.isActive,
							2: stateSource.tags[ 5 ],
							3: stateSource
						});
					} );
				} );
				describe( 'when the new selectorMap is empty', () => {
					describe( 'and existing data is not empty', () => {
						test( 'adjusts the store on selctorMap change', () => {
							let _data : Record<any, any>;
							const onChange = ({ data }) => { _data = data };
							const { rerender } = render(
								<Wrapper>
									<Client
										onChange={ onChange }
										selectorMap={ selectorMapOnRender }
									/>
								</Wrapper>
							);
							expect( Object.keys( _data ) )
								.toEqual( Object.keys( selectorMapOnRender ));
							rerender(
								<Wrapper>
									<Client
										onChange={ onChange }
										selectorMap={{}}
									/>
								</Wrapper>
							);
							expect( Object.keys( _data ) )
								.toEqual( Object.keys({}));
						} );
						test( 'destroys previous and obtains new connection', () => {
							const cache = new AutoImmutable( createSourceData() );
							const connection = cache.connect();
							const disconnectSpy = jest.spyOn( connection, 'disconnect' );
							const getSpy = jest
								.spyOn( connection, 'get' )
								.mockReturnValue( mockGetReturnValue );
							const connectSpy = jest
								.spyOn( cache, 'connect' )
								.mockReturnValue( connection )
							const cacheSpy = jest
								.spyOn( AutoImmutableModule, 'default' )
								.mockReturnValue( cache );
							const mockUnsubscribe = jest.fn();
							const mockSubscribe = jest.fn()
								.mockReturnValue( mockUnsubscribe );
							
							const reactUseContextSpy = jest
								.spyOn( React, 'useContext' )
								.mockReturnValue({
									cache,
									resetState: () => {},
									setState: () => {},
									subscribe: mockSubscribe
								});
							const { rerender } = render(
								<Wrapper>
									<Client selectorMap={ selectorMapOnRender } />
								</Wrapper>
							);
							expect( connectSpy ).toHaveBeenCalledTimes( 3 );
							expect( mockSubscribe ).toHaveBeenCalledTimes( 1 );
							expect( disconnectSpy ).not.toHaveBeenCalled();
							expect( mockUnsubscribe ).not.toHaveBeenCalled();
							connectSpy.mockClear();
							mockSubscribe.mockClear();
							rerender(
								<Wrapper>
									<Client selectorMap={ selectorMapOnRerender } />
								</Wrapper>
							);
							expect( connectSpy ).toHaveBeenCalledTimes( 1 );
							expect( mockSubscribe ).toHaveBeenCalledTimes( 1 );
							expect( disconnectSpy ).toHaveBeenCalledTimes( 1 );
							expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
							reactUseContextSpy.mockRestore();
							cacheSpy.mockRestore();
						} );
						test( 'refreshes state data with empty object', async () => {
							const cache = new AutoImmutable( createSourceData() );
							const connection = cache.connect();
							const getSpy = jest
								.spyOn( connection, 'get' )
								.mockReturnValue( mockGetReturnValue );
							const connectSpy = jest
								.spyOn( cache, 'connect' )
								.mockReturnValue( connection )
							const cacheSpy = jest
								.spyOn( AutoImmutableModule, 'default' )
								.mockReturnValue( cache );
							expect( getSpy ).not.toHaveBeenCalled();
							const { rerender } = render(
								<Wrapper>
									<Client selectorMap={ selectorMapOnRender } />
								</Wrapper>
							);
							await wait(() => {});
							expect( getSpy ).toHaveBeenCalledTimes( 2 );
							expect( getSpy.mock.calls[ 1 ] ).toEqual(
								Object.values( selectorMapOnRender )
							);
							expect( screen.getByTestId( 'data-output' ).textContent ).not.toEqual( '{}' );
							getSpy.mockClear();
							rerender(
								<Wrapper>
									<Client selectorMap={{}} />
								</Wrapper>
							);
							await wait(() => {});
							expect( getSpy ).not.toHaveBeenCalled();
							expect( screen.getByTestId( 'data-output' ).textContent ).toEqual( '{}' );
							cacheSpy.mockRestore();
						} );
						test( 'does not set up new subscription with the consumer', () => {
							const mockUnsubscribe = jest.fn();
							const mockSubscribe = jest.fn()
								.mockReturnValue( mockUnsubscribe );
							const reactUseContextSpy = jest
								.spyOn( React, 'useContext' )
								.mockReturnValue({
									cache: new AutoImmutable( createSourceData() ),
									resetState: () => {},
									setState: () => {},
									subscribe: mockSubscribe
								});
							const { rerender } = render(
								<Wrapper>
									<Client selectorMap={ selectorMapOnRender } />
								</Wrapper>
							);
							expect( mockSubscribe ).toHaveBeenCalledTimes( 1 );
							expect( mockUnsubscribe ).not.toHaveBeenCalled();
							mockSubscribe.mockClear();
							rerender(
								<Wrapper>
									<Client selectorMap={{}} />
								</Wrapper>
							);
							expect( mockSubscribe ).not.toHaveBeenCalled();
							expect( mockUnsubscribe ).toHaveBeenCalledTimes( 1 );
							reactUseContextSpy.mockRestore();
						} );
					} );
					describe( 'and existing data is empty', () => {
						test( 'leaves the store as-is on selctorMap change', () => {
							let _origData : Record<any, any>;
							let _data : Record<any, any>;
							const onChange = ({ data }) => { _data = data };
							const { rerender } = render(
								<Wrapper>
									<Client
										onChange={ onChange }
										selectorMap={{}}
									/>
								</Wrapper>
							);
							_origData = _data;
							expect( Object.keys( _origData ) )
								.toEqual( Object.keys({}));
							rerender(
								<Wrapper>
									<Client
										onChange={ onChange }
										selectorMap={{}}
									/>
								</Wrapper>
							);
							expect( _data ).toBe( _origData );
						} );
						test( 'performs no state data update', async () => {
							const cache = new AutoImmutable( createSourceData() );
							const connection = cache.connect();
							const getSpy = jest
								.spyOn( connection, 'get' )
								.mockReturnValue( mockGetReturnValue );
							const connectSpy = jest
								.spyOn( cache, 'connect' )
								.mockReturnValue( connection )
							const cacheSpy = jest
								.spyOn( AutoImmutableModule, 'default' )
								.mockReturnValue( cache );
							expect( getSpy ).not.toHaveBeenCalled();
							const { rerender } = render(
								<Wrapper>
									<Client selectorMap={{}} />
								</Wrapper>
							);
							await wait(() => {});
							expect( getSpy ).not.toHaveBeenCalled();
							expect( screen.getByTestId( 'data-output' ).textContent ).toEqual( '{}' );
							getSpy.mockClear();
							rerender(
								<Wrapper>
									<Client selectorMap={{}} />
								</Wrapper>
							);
							await wait(() => {});
							expect( getSpy ).not.toHaveBeenCalled();
							expect( screen.getByTestId( 'data-output' ).textContent ).toEqual( '{}' );
							cacheSpy.mockRestore();
						} );
						test( 'does not set up new subscription with the consumer', () => {
							const mockUnsubscribe = jest.fn();
							const mockSubscribe = jest.fn()
								.mockReturnValue( mockUnsubscribe );
							const reactUseContextSpy = jest
								.spyOn( React, 'useContext' )
								.mockReturnValue({
									cache: new AutoImmutable( createSourceData() ),
									resetState: () => {},
									setState: () => {},
									subscribe: mockSubscribe
								});
							const { rerender } = render(
								<Wrapper>
									<Client selectorMap={{}} />
								</Wrapper>
							);
							expect( mockSubscribe ).not.toHaveBeenCalled();
							expect( mockUnsubscribe ).not.toHaveBeenCalled();
							rerender(
								<Wrapper>
									<Client selectorMap={{}} />
								</Wrapper>
							);
							expect( mockSubscribe ).not.toHaveBeenCalled();
							expect( mockUnsubscribe ).not.toHaveBeenCalled();
							reactUseContextSpy.mockRestore();
						} );
						describe( 'and previous property path is empty', () => {
							test( 'skips refreshing connection: no previous connections to the consumer existed', () => {
								const cache = new AutoImmutable( createSourceData() );
								const connection = cache.connect();
								const disconnectSpy = jest.spyOn( connection, 'disconnect' );
								const getSpy = jest
									.spyOn( connection, 'get' )
									.mockReturnValue( mockGetReturnValue );
								const connectSpy = jest
									.spyOn( cache, 'connect' )
									.mockReturnValue( connection )
								const cacheSpy = jest
									.spyOn( AutoImmutableModule, 'default' )
									.mockReturnValue( cache );
								const mockUnsubscribe = jest.fn();
								const mockSubscribe = jest.fn()
									.mockReturnValue( mockUnsubscribe );
								const reactUseContextSpy = jest
									.spyOn( React, 'useContext' )
									.mockReturnValue({
										cache,
										resetState: () => {},
										setState: () => {},
										subscribe: mockSubscribe
									});
								const { rerender } = render(
									<Wrapper>
										<Client selectorMap={{}} />
									</Wrapper>
								);
								expect( connectSpy ).toHaveBeenCalledTimes( 3 );
								expect( mockSubscribe ).not.toHaveBeenCalled();
								expect( disconnectSpy ).not.toHaveBeenCalled();
								expect( mockUnsubscribe ).not.toHaveBeenCalled();
								connectSpy.mockClear();
								rerender(
									<Wrapper>
										<Client selectorMap={{}} />
									</Wrapper>
								);
								expect( connectSpy ).not.toHaveBeenCalled();
								expect( mockSubscribe ).not.toHaveBeenCalled();
								expect( disconnectSpy ).not.toHaveBeenCalled();
								expect( mockUnsubscribe ).not.toHaveBeenCalled();
								reactUseContextSpy.mockRestore();
								cacheSpy.mockRestore();
							} );
						} );
					} );
				} );
			} );
			describe( 'store.data', () => {
				let Client;
				beforeAll(() => {
					Client = ({ selectorMap, onChange }) => {
						const store = useContext( ObservableContext, selectorMap );
						React.useMemo(() => onChange( store ), [ store ]);
						return null;
					};
					Client.displayName = 'Client';
				});
				test( 'carries the latest state data as referenced by the selectorMap', async () => {
					let store : Store<SourceData>;
					const onChange = s => { store = s };
					render(
						<Wrapper>
							<Client onChange={ onChange } selectorMap={{
								city3: 'history.places[2].city',
								country3: 'history.places[2].country',
								friends: 'friends',
								year3: 'history.places[2].year',
								isActive: 'isActive',
								tag6: 'tags[5]',
								tag7: 'tags[6]',
								tags: 'tags'
							}} />
						</Wrapper>
					);
					const defaultState = createSourceData();
					const expectedValue = {
						city3: defaultState.history.places[ 2 ].city,
						country3: defaultState.history.places[ 2 ].country,
						friends: defaultState.friends,
						year3: defaultState.history.places[ 2 ].year,
						isActive: defaultState.isActive,
						tag6: defaultState.tags[ 5 ],
						tag7: defaultState.tags[ 6 ],
						tags: defaultState.tags
					};
					expect( store.data ).toEqual( expectedValue );
					store.setState({
						friends: { [ MOVE_TAG ]: [ -1, 1 ] } as unknown as Array<any>,
						isActive: true,
						history: {
							places: {
								2: {
									city: 'Marakesh',
									country: 'Morocco'
								} as SourceData["history"]["places"][0]
							} as unknown as SourceData["history"]["places"]
						},
						tags: { [ DELETE_TAG ]: [ 3, 5 ] } as unknown as SourceData["tags"]
					} as SourceData );
					await new Promise( resolve => setTimeout( resolve, 10 ) );
					expect( store.data ).toEqual({
						...expectedValue,
						city3: 'Marakesh',
						country3: 'Morocco',
						friends: [ 0, 2, 1 ].map( i => defaultState.friends[ i ] ),
						isActive: true,
						tag6: undefined,
						tag7: undefined,
						tags: [ 0, 1, 2, 4, 6 ].map( i => defaultState.tags[ i ] )
					});
				} );
				test( 'holds the complete current state object whenever `@@STATE` entry appears in the selectorMap', async () => {
					let store : Store<SourceData>;
					const onChange = s => { store = s };
					render(
						<Wrapper>
							<Client onChange={ onChange } selectorMap={{
								city3: 'history.places[2].city',
								country3: 'history.places[2].country',
								year3: 'history.places[2].year',
								isActive: 'isActive',
								tag6: 'tags[5]',
								tag7: 'tags[6]',
								state: '@@STATE'
							}} />
						</Wrapper>
					);
					const defaultState = createSourceData();
					const expectedValue = {
						city3: defaultState.history.places[ 2 ].city,
						country3: defaultState.history.places[ 2 ].country,
						year3: defaultState.history.places[ 2 ].year,
						isActive: defaultState.isActive,
						tag6: defaultState.tags[ 5 ],
						tag7: defaultState.tags[ 6 ],
						state: defaultState
					};
					expect( store.data ).toEqual( expectedValue );
					store.setState({
						isActive: true,
						history: {
							places: {
								2: {
									city: 'Marakesh',
									country: 'Morocco'
								} as unknown as SourceData["history"]["places"][0]
							} as unknown as SourceData["history"]["places"]
						} as SourceData["history"]
					} as SourceData );
					await new Promise( resolve => setTimeout( resolve, 10 ) );
					const updatedDataEquiv = createSourceData();
					updatedDataEquiv.history.places[ 2 ].city = 'Marakesh';
					updatedDataEquiv.history.places[ 2 ].country = 'Morocco';
					updatedDataEquiv.isActive = true;
					expect( store.data ).toEqual({
						...expectedValue,
						city3: 'Marakesh',
						country3: 'Morocco',
						isActive: true,
						state: updatedDataEquiv
					});
				} );
				test( 'holds an empty object when no renderKeys provided ', async () => {
					let store : Store<SourceData>;
					const onChange = s => { store = s };
					render( <Wrapper><Client onChange={ onChange } /></Wrapper> );
					expect( store.data ).toEqual({});
					store.setState({ // can still update state
						isActive: true,
						history: {
							places: {
								2: {
									city: 'Marakesh',
									country: 'Morocco'
								} as unknown as SourceData["history"]["places"][0]
							} as unknown as SourceData["history"]["places"]
						} as SourceData["history"]
					} as SourceData );
					await new Promise( resolve => setTimeout( resolve, 10 ) );
					expect( store.data ).toEqual({});
				} );
			} );
			describe( 'store.resetState', () => {
				let Client : React.FC<{
					selectorMap? : Record<string, string>;
					resetPaths? : Array<string>
				}> ;
				beforeAll(() => {
					Client = props => {
						const { resetState } = useContext(
							ObservableContext,
							props.selectorMap
						)
						const doReset = useCallback(() => {
							resetState( props.resetPaths );
						}, [ resetState ]);
						return (<button onClick={ doReset } /> )
					};
				});
				describe( 'when selectorMap is present in the consumer', () => {
					describe( 'and called with own property paths arguments to reset', () => {
						test( 'resets with original slices and removes non-original slices for entries found in property paths', async () => {
							const sourceData = createSourceData();
							const autoImmutable = new AutoImmutable( sourceData );
							const connection = autoImmutable.connect();
							const setSpy = jest.spyOn( connection, 'set' );
							jest.spyOn( autoImmutable, 'connect' )
								.mockReturnValue( connection );
							const connectSpy = jest
								.spyOn( AutoImmutableModule, 'default' )
								.mockReturnValue( autoImmutable )
							const args = [ 'blatant', 'company', 'xylophone', 'yodellers', 'zenith' ];
							const { rerender } = render(
								<Wrapper>
									<Client
										selectorMap={ selectorMapOnRender }
										resetPaths={ args }
									/>
								</Wrapper>
							);
							await wait(() => {});
							setSpy.mockClear();
							fireEvent.click( screen.getByRole( 'button' ) );
							expect( setSpy ).toHaveBeenCalledTimes( 1 );
							expect( setSpy.mock.calls[ 0 ][ 0 ] ).toEqual({
								[ DELETE_TAG ]: [ 'blatant', 'xylophone', 'yodellers', 'zenith' ],
								company: {
									[ REPLACE_TAG ]: sourceData.company
								}
							});
							connectSpy.mockRestore();
						} );
					} );
					describe( 'and called with NO  own property paths argument to reset', () => {
						test( 'calculates setstate changes using state slice matching property paths derived from the selectorMap', async () => {
							const sourceData = createSourceData();
							const autoImmutable = new AutoImmutable( sourceData );
							const connection = autoImmutable.connect();
							const setSpy = jest.spyOn( connection, 'set' );
							jest.spyOn( autoImmutable, 'connect' )
								.mockReturnValue( connection );
							const connectSpy = jest
								.spyOn( AutoImmutableModule, 'default' )
								.mockReturnValue( autoImmutable )
							render(
								<Wrapper>
									<Client selectorMap={ selectorMapOnRender } />
								</Wrapper>
							);
							await wait(() => {});
							setSpy.mockClear();
							fireEvent.click( screen.getByRole( 'button' ) );
							expect( setSpy ).toHaveBeenCalledTimes( 1 );
							expect( setSpy.mock.calls[ 0 ][ 0 ] ).toEqual({
								history: {
									places: {
									    2: {
									    	year: {
									    		[ REPLACE_TAG ]: sourceData.history.places[ 2 ].year,
									      	},
									    },
									},
								},
								isActive: {
									[ REPLACE_TAG ]: sourceData.isActive
								},
								tags: {
									5: {
										[ REPLACE_TAG ]: sourceData.tags[ 5 ]
									},
								},
							});
							connectSpy.mockRestore();
						} );
					} );
				} );
				describe( 'when selectorMap is NOT present in the consumer', () => {
					describe( 'and called with own property paths arguments to reset', () => {
						test( 'resets with original slices and removes non-original slices for entries found in property paths', async () => {
							const args = [ 'blatant', 'company', 'xylophone', 'yodellers', 'zenith' ];
							const sourceData = createSourceData();
							const autoImmutable = new AutoImmutable( sourceData );
							const connection = autoImmutable.connect();
							const setSpy = jest.spyOn( connection, 'set' );
							jest.spyOn( autoImmutable, 'connect' )
								.mockReturnValue( connection );
							const connectSpy = jest
								.spyOn( AutoImmutableModule, 'default' )
								.mockReturnValue( autoImmutable )
							render(
								<Wrapper>
									<Client resetPaths={ args } />
								</Wrapper>
							);
							await wait(() => {});
							setSpy.mockClear();
							fireEvent.click( screen.getByRole( 'button' ) );
							expect( setSpy ).toHaveBeenCalledTimes( 1 );
							expect( setSpy.mock.calls[ 0 ][ 0 ] ).toEqual({
								[ DELETE_TAG ]: [ 'blatant','xylophone','yodellers','zenith' ],
								company: {
									[ REPLACE_TAG ]: sourceData.company
								},
							});
							connectSpy.mockRestore();
						} );
					} );
					describe( 'and called with NO own property paths arguments to reset', () => {
						test( 'calculates setstate changes using no property paths -- the consumer applies no store reset [see usestore(...)]', async () => {
							const sourceData = createSourceData();
							const autoImmutable = new AutoImmutable( sourceData );
							const connection = autoImmutable.connect();
							const setSpy = jest.spyOn( connection, 'set' );
							jest.spyOn( autoImmutable, 'connect' )
								.mockReturnValue( connection );
							const connectSpy = jest
								.spyOn( AutoImmutableModule, 'default' )
								.mockReturnValue( autoImmutable )
							render( <Wrapper><Client /></Wrapper> );
							await wait(() => {});
							setSpy.mockClear();
							fireEvent.click( screen.getByRole( 'button' ) );
							expect( setSpy ).toHaveBeenCalledTimes( 1 );
							expect( setSpy.mock.calls[ 0 ][ 0 ] ).toEqual({});
							connectSpy.mockRestore();
						} );
					} );
				} );
			} );
		} );
	} );
} );
