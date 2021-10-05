/** @jsxImportSource theme-ui */
import { useResponsiveValue, useBreakpointIndex } from '@theme-ui/match-media';
import { Heading, Container, Flex, Divider, Button, Box, MenuButton, Close } from 'theme-ui';
import { Link } from 'gatsby';
import React, { useState } from 'react';
import Dropdown from './dropdown';
import NavLink from './navLink';
import Logo from './logo';
import MobileMenu from './mobile-menu';

const Header = ({ showNav, siteTitle, scrolled, navMenuItems = [] }) => {
	const [ isToggledOn, setToggle ] = useState(false);
	const toggle = () => setToggle(!isToggledOn);
	const index = useBreakpointIndex();

	return (
		<nav
			sx={{
				backgroundColor: 'lightgray',
				position: 'relative',
				zIndex: '2',
        borderBottom: "4px solid",
        borderBottomColor: "primary",
        boxShadow: '0 3px 5px -1px rgba(0, 0, 0, 0.3), 0 1px 18px 0 rgba(0, 0, 0, 0.32), 0 6px 10px 0 rgba(0, 0, 0, 0.24)'
			}}
		>
			<Container
				sx={{
					flexWrap: 'wrap',
					mt: '0px',
				}}
			>
				<Flex
					sx={{
						mx: 'auto',
						display: 'flex',
						alignItems: 'start',
						pl: [ '16px', '16px', '50px', '100px' ]
					}}
				>
					<Link
						activeClassName="active"
						id="siteTitle"
						to="/"
						sx={{
							color: 'text',
							textDecoration: 'none',
							display: 'flex',
							position: 'absolute'
						}}
					>
						<Logo />
					</Link>
					<div sx={{ mx: 'auto' }} />
					{showNav &&
					navMenuItems && (
						<div sx={{ height: '60px' }}>
							{index > 2 ? (
								<ul
									sx={{
										justifyContent: 'end',
										alignItems: 'center',
										display: 'inline-flex',
										height: '100%',
										p: '0px',
										m: '0px'
									}}
								>
									{navMenuItems.map((i) => {
										if (i.navigationItemUrl) {
											return <Dropdown key={i._key} {...i} />;
										} else if (i._type == 'link') {
											return <NavLink key={i._key} {...i} />;
										}
										// } else if (i._type == "cta") {
										//   return <CTALink key={i._key} {...i} />;
										// }
									})}
								</ul>
							) : (
								<div sx={{ display: 'inline-flex', alignItems: 'center' }}>
									{!isToggledOn ? (
										<MenuButton
											aria-label="open menu"
											sx={{ display: 'block', py: '20px' }}
											onClick={toggle}
										/>
									) : (
										<Close
											aria-label="close menu"
											sx={{ display: 'block', py: '20px', zIndex: "5"}}
											onClick={toggle}
										/>
									)}
								</div>
							)}
						</div>
					)}
				</Flex>
				<Flex>{isToggledOn ? <MobileMenu navItems={navMenuItems} /> : null}</Flex>
			</Container>
			{/* <Divider
				sx={{
					my: 0,
					py: 0,
					borderColor: 'primary',
					borderBottomWidth: 4,
					boxShadow:
						'0 3px 5px -1px rgba(0, 0, 0, 0.3), 0 1px 18px 0 rgba(0, 0, 0, 0.32), 0 6px 10px 0 rgba(0, 0, 0, 0.24)'
				}}
			/> */}
		</nav>
	);
};

export default Header;
