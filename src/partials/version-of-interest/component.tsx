import React, {
	FC,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState
} from 'react';

import CheckSquareFilled  from '@ant-design/icons/CheckSquareFilled';
import CloseSquareFilled  from '@ant-design/icons/CloseSquareFilled';
import LoadingOutlined  from '@ant-design/icons/LoadingOutlined';

import { SemVer, VersionRange } from '../version-tabs/utils/calc-version-vmodel';
import { UpdateCtx, ValueCtx } from '../../contexts/version-of-interest';
import { ValueCtx as BasePkgCtx } from '../../contexts/base-pkg';

import './style.scss';

const EditForm : FC<{
	acitveVersionDesc : string,
	close: VoidFunction
}> = ({ acitveVersionDesc, close }) => {
	const [ VALID_INPUT ] = useState(() => /^[0-9]+\.[0-9]+\.[0-9]+$/ );
	const inputRef = useRef<HTMLInputElement>( null );
	const [ processing, setProcessFlag ] = useState( false );
	const [ error, setError ] = useState( '' );
	const updateVofInterest = useContext( UpdateCtx );
	const { version : currVersion } = useContext( BasePkgCtx );
	const submitNewVersOfIndex = useCallback(() => {
		setProcessFlag( true );
		setError( '' );
	}, []);
	useEffect(() => {
		if( !processing ) { return }
		setProcessFlag( false );
		const value = inputRef.current?.value ?? '';
		if( !VALID_INPUT.test( value ) ) {
			return setError( 'A semver input expect: e.g. "1.23.6"');
		};
		if( acitveVersionDesc === value ) { return close() }
		const semver = value.split( '.' ).map( v => +v ) as SemVer;
		updateVofInterest( currVersion && VersionRange.gt( semver, currVersion ) ? 'Latest' : semver );
		close();
	}, [ processing ]);
	useEffect(() => {
		inputRef.current!.focus();
		if( typeof document === 'undefined' ) { return }
		type Handler = ( e : { key : string, preventDefault : VoidFunction } ) => void;
		const fn : Handler = e => {
			if( e.key === 'Enter' ) {
				e.preventDefault();
				return submitNewVersOfIndex();
			}
			e.key === 'Escape' && close();
		}
		document.addEventListener( 'keydown', fn );
		return () => document.removeEventListener( 'keydown', fn );
    }, []);
	return (
		<div className="edit-form">
			<div>
				<span>version</span> 
				<input
					defaultValue={ acitveVersionDesc }
					ref={ inputRef }
				/>
				{ processing
					? (
						<span className="loading">
							<LoadingOutlined />
							<span>Processing...</span>
						</span>
					)
					: (
						<>
							<CheckSquareFilled
								onClick={ submitNewVersOfIndex }
								role="button"
								title="Enter"
							/>
							<CloseSquareFilled
								onClick={ close }
								role="button"
								title="Esc"
							/>
						</>
					)
				}
			</div>
			{ !!error.length && (
				<span className="error">{ error }</span>
			) }
		</div>
	);
};

const Component : FC = () => {
	const [ editable, setEditFlag ] = useState( false );
	const vofInterest = useContext( ValueCtx );
	const makeEditable = useCallback(() => setEditFlag( true ), []);
	const ceaseEdit = useCallback(() => setEditFlag( false ), []);
	const [ vName, vText ] = useMemo(() => {
		const v = [ vofInterest, vofInterest ];
		if( Array.isArray( vofInterest ) ) {
			v[ 0 ] = ( v[ 0 ] as number[] ).join( '.' );
			v[ 1 ] = `v${ v[ 0 ] }`;
		}
		return v as string[];
	}, [ vofInterest ]);
	useEffect(() => setEditFlag( false ), [ vofInterest ]);
	return (
		<div className="version-of-interest">
			{ !editable
				? ( <span onClick={ makeEditable }>{ vText }</span> )
				: ( <EditForm
						acitveVersionDesc={ vName }
						close={ ceaseEdit }
					/>
				)
			}
		</div>
	);
}

export default Component;
