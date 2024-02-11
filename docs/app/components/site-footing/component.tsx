import useCurrentYear from '~/hooks/current-year';

import './style.css';

const Component : React.FC = () => {
    const year = useCurrentYear();
    return (
        <footer className='site-footing'>
            <div>
                &copy;2024{ year !== 2024 && `-${ year }` } webKrafters, Incorporated.
            </div>
            <div>All rights reserved.</div>
        </footer> 
    );
}

Component.displayName = 'Site.Footing';

export default Component;