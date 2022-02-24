import React from 'react';
import {SvgXml} from 'react-native-svg';

const xml = `<?xml version="1.0" encoding="iso-8859-1"?>
<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" fill="currentColor">
<g>
	<g>
		<path d="M0,435.2V512h512v-76.8C512,263.68,0,263.68,0,435.2z"/>
	</g>
</g>
<g>
	<g>
		<circle cx="256" cy="128" r="128"/>
	</g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
<g>
</g>
</svg>
`;

const User = ({size, color}) => {
  return <SvgXml width={size} height={size} xml={xml} fill={color} />;
};

export default User;
