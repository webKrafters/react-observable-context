import { memo, useState } from 'react';

import { graphql, useStaticQuery } from 'gatsby';

const Component = memo(() => {
	const { site } = useStaticQuery(
		graphql`query projectName { site { siteMetadata { title } } }`
	);
	const [ name ] = useState(() => site.siteMetadata.title.slice( 0, -3 ));
	return name;
});

export default Component;
