import React, { memo, useState } from 'react';

import {
	graphql,
	useStaticQuery
} from 'gatsby';

import Anchor from '../anchor';

const Component = memo(() => {
	const { site } = useStaticQuery(
   		graphql`query licenseInfo { site { siteMetadata { url { repo } } } }`
  	);
	const [ licUrl ] = useState( () => `${ site.siteMetadata.url.repo.slice( 0, -4 ) }/blob/master/LICENSE` );
 	return (
		<Anchor to={ licUrl }>
			GPLv3
		</Anchor>
	);
});

export default Component;
