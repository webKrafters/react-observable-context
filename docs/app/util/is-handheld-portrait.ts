import { clientOnly$ } from 'vite-env-only';

import { HANDHELD_PORTAIT_MAX_WIDTH as BREAKPOINT } from '~/constants';

const fn = () => clientOnly$( window.innerWidth <= BREAKPOINT ) ?? false;

export default fn;