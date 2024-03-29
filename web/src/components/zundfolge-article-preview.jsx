/** @jsxImportSource theme-ui */
import { format, parseISO } from 'date-fns';
import { Link } from 'gatsby';
import React from 'react';
import { Card, Box, Text, Heading, Flex, Avatar } from 'theme-ui';
import { getZundfolgeUrl } from '../lib/helpers';
import SanityImage from 'gatsby-plugin-sanity-image';
import { imageUrlFor } from "../lib/image-url";

function ZundfolgeArticlePreview(props) {
	const authorString = String(props.authors.map((author) => (` ${author.author.name}`)))
	const cat = props.category ? props.category.title : 'null'
	const avatarImg = props.authors[0].author && imageUrlFor(props.authors[0].author.image)
		.width(48)
		.height(48)
		.fit("fill")
		.auto("format")
		.url()
	const bg =
			props.mainImage
			? props.mainImage.asset.metadata.palette.dominant.background
			: 'lightgrey';
	const fg =
		props.mainImage
		? props.mainImage.asset.metadata.palette.dominant.foreground 
		: 'black';
	return (
		<Link to={getZundfolgeUrl(props.slug.current)} sx={{ textDecoration: 'none' }}>
			<Card
				sx={{
					textDecoration: 'none',
					background: `linear-gradient(to top, transparent 50%, black 100%)`,
					width: '100%',
					height: '100%',
					mx: 'auto',
					borderRadius: '8px',
					borderStyle: "solid",
					borderColor: "black",
					borderWidth: "1px",
					position: 'relative'
				}}
			>
				{props.mainImage &&
				props.mainImage.asset && (
					<SanityImage
						{...props.mainImage}
						width={1440}
						sx={{
							position: 'absolute',
							width: '100%',
							height: '100%',
							objectFit: 'cover',
							borderRadius: '8px',
							zIndex: '-1'
						}}
					/>
				)}
				<Box p={3}>
					<Text sx={{ variant: 'text.label', color: "white"}}>{cat}</Text>
					<Heading sx={{ textDecoration: 'none', variant: 'styles.h3', color: "white" }}>{props.title}</Heading>
					{/* <Text sx={{color: `${fg}`}}>{format(parseISO(props.publishedAt), 'MMMM do, yyyy')}</Text> */}
					<Flex sx={{py:"0.5rem"}}>
						<Avatar src={avatarImg} sx={{minWidth: "48px", maxHeight: "48px"}}/>
						<Text sx={{variant: "stypes.p", py: "1rem", px: "0.5rem", color: "white"}}>{authorString}</Text>
					</Flex>
				</Box>
			</Card>
		</Link>
	);
}

ZundfolgeArticlePreview.defaultProps = {
	authors: [
		{
			author: {
				name: ''
			}
		}
	],
	title: '',
	nodes: [],
	publishedAt: '2022-01-01',
	category: {
		title: ''
	},
	browseMoreHref: '',
	slug: {
		current: ''
	}
};

export default ZundfolgeArticlePreview;
