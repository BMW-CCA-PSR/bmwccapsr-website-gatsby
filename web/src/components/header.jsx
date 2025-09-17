/** @jsxImportSource theme-ui */
import { useBreakpointIndex } from '@theme-ui/match-media';
import { Container, Flex, Divider, MenuButton, Close, Text } from 'theme-ui';
import { Link } from 'gatsby';
import React, { useState, useEffect } from 'react';
import Dropdown from './dropdown';
import NavLink from './navLink';
import Logo from './logo';
import MobileNavLink from './mobileNavLink';
import MobileCTALink from './mobileCTALink';

const Header = ({ showNav, siteTitle, scrolled, navMenuItems = [] }) => {
	const [ isToggledOn, setToggle ] = useState(false);
	const toggle = () => setToggle(!isToggledOn);
	const index = useBreakpointIndex();
	useEffect(() => {
		const html = document.querySelector('html')
		isToggledOn ? (html.style.overflow = 'hidden') : (html.style.overflow = 'visible')
	  }, [isToggledOn])

	return (
    <>
    <div sx={{ overflowX: "hidden", position: "relative", zIndex: 1300 }}>
		<nav
			sx={{
				backgroundColor: 'lightgray',
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				zIndex: 1200,
				width: "100%",
        borderBottom: "4px solid",
        borderBottomColor: "primary",
        boxShadow: '0 3px 5px -1px rgba(0, 0, 0, 0.3), 0 1px 18px 0 rgba(0, 0, 0, 0.32), 0 6px 10px 0 rgba(0, 0, 0, 0.24)'
			}}
		>
      <div sx={{ position: "relative", zIndex: 20, overflow: "visible" }}>
			<Container
				sx={{
					flexWrap: 'wrap',
					mt: '0px',
					overflow: 'visible'
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
							position: 'absolute',
							zIndex: 1250
						}}
					>
						<Logo />
					</Link>
					<div sx={{ mx: 'auto' }} />
					{showNav &&
					navMenuItems && (
						<div sx={{ height: '60px', pr: "1rem" }}>
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
											return <NavLink key={i._key} {...i} sx={{height: "100%"}} />;
										}
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
									) : null }
								</div>
							)}
						</div>
					)}
				</Flex>
				<Flex>
					{isToggledOn ? 
					<div sx={{
						backgroundColor: 'lightgray',
						position: 'fixed',
						width: '100%',
						height: "100vh",
						display: 'block',
						my: "-60px",
						py: "40px",
						z: 5
						
					}}>
					<div sx={{ my: "-20px",textAlign: "right"}}>
						<Close
							aria-label="close menu"
							onClick={toggle}
						/>
					</div>
					<ul
						sx={{
							listStyle: 'none',
							textAlign: 'center',
							mt: "3rem",
							p: 0,
							backgroundColor: 'lightgray',

						}}
					>
						{navMenuItems.map((i) => {
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
								return (
									<div>
										<Divider sx={{ color: 'darkgray' }} />
										<MobileNavLink key={i._key} {...i} />
									</div>)
							} else if (i._type == 'cta') {
								return (
								<div>
									<Divider sx={{ color: 'darkgray' }} />
									<MobileCTALink key={i._key} {...i} />
								</div>)
							}
						})}
					</ul>
					</div>
					: null}
				</Flex>
			</Container>
      </div>
		</nav>
    </div>
    <div sx={{ mt: ["65px"] }} />
    </>
	);
};

export default Header;
