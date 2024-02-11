import { useEffect, useState } from 'react';

import { _24HOURS } from '~/constants';

const hook = () : number => {
    const [ timer, setTimer ] = useState<NodeJS.Timeout>();
    const [ year, setYear ] = useState( () => new Date().getFullYear() );
    useEffect(() => {
        !timer && setTimer(
            setTimeout( () => {
                setTimer( undefined );
                const _year = new Date().getFullYear();
                _year === year && setYear( _year )
            }, _24HOURS )
        );
    }, [ timer ]);
    return year;
};

export default hook;