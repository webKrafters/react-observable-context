import React, { FC, memo } from 'react';

import {
	graphql,
	useStaticQuery
} from 'gatsby';

import Anchor from '../anchor';

const Component = memo(() => {
	const { site } = useStaticQuery(
   		graphql`
     		query licenseInfo {
				site {
					siteMetadata {
						url {
							repo
						}
					}
				}
			}
		`
  	);
 	return (
		<Anchor to={ site.siteMetadata.url.repo.slice( 0, -4 )  + "/blob/master/LICENSE" }>
			GPLv3
		</Anchor>
	);
});

export default Component;
