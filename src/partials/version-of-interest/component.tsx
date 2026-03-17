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

import { SemVer  } from '../version-tabs/utils/calc-version-vmodel';
import { ValueCtx } from '../version-tabs/context';
import { UpdateCtx } from '../version-tabs/context';

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
		const semver = value.split( '.' ).map( v => +v ) as SemVer;
		acitveVersionDesc !== semver.join( '.' ) && updateVofInterest( semver );
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
	const defaultVersion = useMemo(() => (
		acitveVersionDesc.indexOf( '.' ) !== -1
			? acitveVersionDesc.slice( 1 )
			: acitveVersionDesc
	), [ acitveVersionDesc ]);
	return (
		<div className="edit-form">
			<div>
				<span>version</span> 
				<input
					defaultValue={ defaultVersion }
					ref={ inputRef }
				/>
				{ processing
					? (
						<>
							<LoadingOutlined />
							<span>Processing</span>
						</>
					)
					: (
						<>
							<CheckSquareFilled
								role="button"
								onClick={ submitNewVersOfIndex }
							/>
							<CloseSquareFilled
								role="button"
								onClick={ close }
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
	const vText = useMemo(() => (
		Array.isArray( vofInterest )
			? `v${ vofInterest.join( '.' ) }`
			: vofInterest
	), [ vofInterest ]);
	return (
		<div className="version-of-interest">
			{ !editable
				? ( <span onClick={ makeEditable }>{ vText }</span> )
				: ( <EditForm
						acitveVersionDesc={ vText }
						close={ ceaseEdit }
					/>
				)
			}
		</div>
	);
}

export default Component;
