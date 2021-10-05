/** @jsxImportSource theme-ui */
import React, { useState }  from "react";
import { Heading, Container, Flex, Divider, Button, Box, Text, Close } from 'theme-ui';
import { Link } from 'gatsby';
import MobileNavLink from './mobileNavLink';
import MobileCTALink from './mobileCTALink';

const MobileMenu = (props) => {
	const [ isToggledOn, setToggle ] = useState(false);
	const toggle = () => setToggle(!isToggledOn);
	const navItems = props.navItems;
	return (
        <div sx={{
            backgroundColor: 'lightgray',
            position: 'fixed',
            width: '100%',
            height: "100%",
            textAlign: 'center',
            display: 'block',
            my: "-60px",
            py: "40px",
            
        }}>
		<ul
			sx={{
				listStyle: 'none',
				m: 0,
				p: 0,
                backgroundColor: 'lightgray',



			}}
		>
			{navItems.map((i) => {
				const link = i.navigationItemUrl;
				if (i.navigationItemUrl) {
					return (
						<ul
							sx={{
								listStyle: 'none',
								margin: 0,
								padding: 0,
								color: 'text'
							}}
						>
							<li
								sx={{
									display: 'block',
									height: '100%'
									//mx: "0.5rem",
								}}
							>
								<Divider sx={{ color: 'darkgray' }} />
								<Text variant="text.label">{i.title}</Text>
								{link.items && link.items.length > 0 ? (
									<div
										sx={{
											listStyle: 'none',
											m: 0,
											p: 0,
											display: 'flex',
											flexDirection: 'column',
											cursor: 'pointer'
										}}
									>
										{link.items.map((subLink) => <MobileNavLink {...subLink} />)}
									</div>
								) : null}
							</li>
						</ul>
					);
				} else if (i._type == 'link') {
					return <MobileNavLink key={i._key} {...i} />;
				} else if (i._type == 'cta') {
					return <MobileCTALink key={i._key} {...i} />;
				}
			})}
		</ul>
        </div>
	);
};
export default MobileMenu;
