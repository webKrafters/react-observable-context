import { Children, isValidElement, useMemo } from 'react';

import { clientOnly$, serverOnly$ } from 'vite-env-only';

import ExportOutlined from '@ant-design/icons/ExportOutlined';

import './style.css';

let ExportOutlinedIcon : typeof ExportOutlined;

clientOnly$((() => { ExportOutlinedIcon = ExportOutlined })());
serverOnly$((() => { ExportOutlinedIcon = ( ExportOutlined as any ).default })());

const Component : React.FC<
    {hideIcon?: boolean} & React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
    >
> = ({ children, className, hideIcon = false, ...props }) => {
    const [ noIcon, nodes ] = useMemo(() => {
        if( !hideIcon && Children.count( children ) === 1 ) {
            let isImage;
            const nodes = Children.map( children, c => {
                isImage = isValidElement( c ) && c.type === 'img';
                return c;
            } );
            return [ isImage, nodes ];
        }
        return [ hideIcon, Children.map( children, c => c ) ];
    }, [ children ]);
    return (
        <a
            className={ `anchor${ className ? ` ${ className }` : '' }` }
            { ...props }
        >
            { nodes as React.ReactNode }
            { !noIcon && ( <ExportOutlinedIcon size={ 4 } /> ) }
        </a>
    );
};

Component.displayName = 'Anchor';

export default Component;