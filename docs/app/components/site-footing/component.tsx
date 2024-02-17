import Anchor from '../anchor';

import useCurrentYear from '~/hooks/current-year';

import './style.css';

const Component : React.FC = () => {
    const year = useCurrentYear();
    return (
        <footer className='site-footing'>
            <div className="affiliate-columns">
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
                    &copy;2024{ year !== 2024 && `-${ year }` } webKrafters, Incorporated.
                </div>
                <div>All rights reserved.</div>
            </div>
        </footer> 
    );
}

Component.displayName = 'Site.Footing';

export default Component;