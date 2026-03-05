import type {
	NamedExoticComponent,
	ReactNode
} from 'react';

import React, {
	forwardRef,
	useCallback,
	useEffect,
	useState
} from 'react';

import { Select } from 'antd';

import './style.scss';

export interface Content {
	label : ReactNode;
	value : ReactNode;
}

interface IProps {
	currentIndex? : number;
	onTabChange?: (newTabIndex : number) => void;
	options : Array<Content>;
}

export type Props = Omit<JSX.IntrinsicElements[ "div" ], "children"> & IProps

const SelectTab : NamedExoticComponent<Props> = forwardRef<
	HTMLDivElement, Props
>(({ className, onTabChange = noop, options, currentIndex = 0, ...props }, ref ) => {
	const [ content, setContent ] = useState( options[ currentIndex ] );
	useEffect(() => {
		onTabChange( currentIndex );
		setContent( options[ currentIndex ] );
	}, [ options, currentIndex ]);
	const onSelect = useCallback(( opt: Content ) => {
		onTabChange( options.findIndex( c => c.label === opt.label ) );
		setContent( opt );
	}, [ onTabChange ]);
	return (
		<div
			role="tabpanel"
			{ ...props }
			className={ `select-tab${ className ? ` ${ className }` : '' }` }
			ref={ ref }
		>
			<Select
				labelInValue
				onSelect={ onSelect }
				options={ options }
				popupClassName="select-tab__dropdown"
				style={{ width: 132 }}
				value={ content }
			/>
			<div className="content">
				{ content.value }
			</div>
		</div>
	);
});

SelectTab.displayName = 'SelectTab';

export default SelectTab;

function noop(){}
