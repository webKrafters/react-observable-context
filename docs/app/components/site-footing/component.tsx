import { useCallback, useRef } from 'react';
import { Link } from '@remix-run/react';

import Anchor from '../anchor';

import DarkModeSettings from '../dark-mode-settings';
import type { Props as DKMProps } from '../dark-mode-settings';

import useCurrentYear from '~/hooks/current-year';

import './style.css';

interface Props {
    isDarkMode: DKMProps["defaultValue"],
    onDarkModeChange: DKMProps["onChange"]
}

const DarkModeLink : React.FC<Props> = ({ isDarkMode, onDarkModeChange }) => {
    const dkmRef = useRef<HTMLElement>( null );
    const tripDkmSwitch = useCallback<
        React.MouseEventHandler<HTMLAnchorElement>
    >( e => {
        e.preventDefault();
        dkmRef.current?.click();
    }, [] );
    return (
        <>
            <DarkModeSettings
                defaultValue={ isDarkMode }
                onChange={ onDarkModeChange }
                ref={ dkmRef }
            />
            { ' ' }
            <a onClick={ tripDkmSwitch }>
                <strong>{ isDarkMode ? 'Light' : 'Dark' }</strong>
                { ' ' }
                mode?
            </a>
        </>
    );
                    
} 

const Component : React.FC<Props> = props => {
    const year = useCurrentYear();
    return (
        <footer className='site-footing'>
            <div className="affiliate-columns">
                <div>
                    <div>
                        <Link to="/getting-started">Getting Started</Link>
                    </div>
                    <div className="dkm-link">
                        <DarkModeLink { ...props } />
                    </div>
                </div>
                <div>
                    <div>
                        <Anchor
                            href="https://codesandbox.io/s/github/webKrafters/react-observable-context-app"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            Demo
                        </Anchor>
                    </div>
                </div>
                <div>
                    <div>
                        <Anchor
                            href="https://www.npmjs.com/package/@webkrafters/react-observable-context"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            NPM
                        </Anchor>
                    </div>
                    <div>
                        <Anchor
                            href="https://github.com/webKrafters/eagleeye"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            GitHub
                        </Anchor>
                    </div>
                </div>
            </div>
            <div className="ip">
                <div>
                    &copy;2024{ year !== 2024 && `-${ year }` }
                    { ' ' }
                    <img
                        alt="wk Logo"
                        height={ 10 }
                        src="/img/wk-logo.png"
                        width={ 64 }
                    />
                    { ' ' }
                    webKrafters, Incorporated.
                </div>
                <div>All rights reserved.</div>
            </div>
        </footer> 
    );
}

Component.displayName = 'Site.Footing';

export default Component;