/** @jsxImportSource theme-ui */
import React from 'react';
import { getZundfolgeUrl } from "../lib/helpers";
import PortableText from './portableText';
import SanityImage from 'gatsby-plugin-sanity-image';
import { Box, Card, Container, Heading, Text, Flex, Avatar, Badge} from '@theme-ui/components';
import { Link } from "gatsby";
import { imageUrlFor } from "../lib/image-url";
import { BoxIcon } from "./box-icons";
import { outline } from "./event-slider";
import { differenceInDays, format, parseISO } from "date-fns";

const slantLeftClip = "polygon(12% 0, 100% 0, 100% 100%, 0 100%)";
const slantRightClip = "polygon(0 0, 100% 0, 88% 100%, 0 100%)";

const StoryImg = (props) => {
	return (
		<SanityImage
			{...props}
			width={600}
			sx={{
				position: 'absolute',
				inset: 0,
				width: '100%',
				height: '100%',
				objectFit: 'cover',
                borderRadius: 0
			}}
		/>
	);
};

const SlantedStoryImg = ({ image, slant = "left", flex }) => (
	<Box
		sx={{
			position: "relative",
			width: "100%",
			minHeight: ["240px", "280px", "auto"],
			alignSelf: "stretch",
			flex: flex || ["0 0 auto", "0 0 auto", "1 1 42%"],
			borderRadius: [
				"18px",
				"18px",
				slant === "left" ? "0 18px 18px 0" : "18px 0 0 18px"
			],
			overflow: "hidden",
			clipPath: [
				"none",
				"none",
				slant === "left" ? slantLeftClip : slantRightClip
			]
		}}
	>
		<StoryImg {...image} />
	</Box>
);

function StoryRow(props) {
	const authors = props.node.authors;
	const authorString = authors[0] ? String(authors.map((author) => ` ${author.author.name}`)) : null
	const avatarImg = authors[0] ? authors[0].author.image && imageUrlFor(authors[0].author.image)
		.width(48)
		.height(48)
		.fit("fill")
		.auto("format")
		.url() : null
	const img = props.node._rawMainImage;
	const text = props.node._rawExcerpt ? props.node._rawExcerpt : null;
	const isNew = (() => {
		try {
			if (!props.node.publishedAt) return false;
			const days = differenceInDays(new Date(), parseISO(props.node.publishedAt));
			return days <= 14;
		} catch (_) {
			return false;
		}
	})();
	return (
		<Flex
			sx={{
				flexDirection: [ 'column', 'column', 'row', 'row' ],
				alignItems: [ 'stretch', 'stretch', 'stretch', 'stretch' ]
			}}
		>
			<Box
				sx={{
					px: '1.5rem',
					py: '1.5rem',
					flex: ['1 1 100%', '1 1 100%', '1 1 60%']
				}}
			>
				{props.node.category && (
					<Box sx={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
						<Text sx={{ variant: 'text.label', color: 'black'}}>{props.node.category.title}</Text>
						{isNew && (
							<Badge
								sx={{
									bg: 'transparent',
									color: 'white',
									px: 2,
									py: 1,
									borderRadius: 9999,
									fontWeight: 700,
									fontSize: 'xxs',
									letterSpacing: 'wide',
									textTransform: 'uppercase',
									backgroundImage: 'linear-gradient(135deg, #27d07e 0%, #06b7a6 100%)',
									boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
								}}
							>
								NEW
							</Badge>
						)}
					</Box>
				)}
				<Heading
					sx={{
						variant: 'styles.h3',
						marginbottom: '2rem',
						color: 'darkgray'
					}}
				>
					{props.node.title}
				</Heading>
				<Flex sx={{py:"0.5rem", pb: "0px", alignItems: "center", flexWrap: "wrap"}}>
					{avatarImg && <Avatar src={avatarImg} sx={{minWidth: "48px", maxHeight: "48px"}}/>}
					<Text sx={{variant: "stypes.p", py: "1rem", px: "0.5rem", color: `black`}}>
						{authorString}
						{props.node.publishedAt ? " | " : ""}
					</Text>
					{props.node.publishedAt && (
						<Text sx={{variant: "stypes.p", py: "1rem", color: "black"}}>
							{format(parseISO(props.node.publishedAt), "MMM d, yyyy")}
						</Text>
					)}
				</Flex>
				<Text
					sx={{
						variant: 'styles.p',
						color: 'gray',
					}}
				>
					{text ? <PortableText body={text} /> : null}
				</Text>
			</Box>
			{img && (
				<SlantedStoryImg
					image={img}
					slant="left"
					flex={['1 1 100%', '1 1 100%', '1 1 40%']}
				/>
			)}
		</Flex>
	);
};

function StoryRowFlipped(props) {
	const authors = props.node.authors;
	const authorString = authors[0] ? String(authors.map((author) => ` ${author.author.name}`)) : null
	const avatarImg = authors[0] ? authors[0].author.image && imageUrlFor(authors[0].author.image)
		.width(48)
		.height(48)
		.fit("fill")
		.auto("format")
		.url() : null
	const img = props.node._rawMainImage;
	const text = props.node._rawExcerpt ? props.node._rawExcerpt : null;
	const isNew = (() => {
		try {
			if (!props.node.publishedAt) return false;
			const days = differenceInDays(new Date(), parseISO(props.node.publishedAt));
			return days <= 14;
		} catch (_) {
			return false;
		}
	})();
	return (
		<Flex
			sx={{
				flexDirection: [ 'column-reverse', 'column-reverse', 'row', 'row' ],
				alignItems: [ 'stretch', 'stretch', 'stretch', 'stretch' ]
			}}
		>
			{img && (
				<SlantedStoryImg
					image={img}
					slant="right"
					flex={['1 1 100%', '1 1 100%', '1 1 40%']}
				/>
			)}
			<Box
				sx={{
					px: '1.5rem',
					py: '1.5rem',
					flex: ['1 1 100%', '1 1 100%', '1 1 60%']
				}}
			>
				{props.node.category && (
					<Box sx={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
						<Text sx={{ variant: 'text.label', color: 'black'}}>{props.node.category.title}</Text>
						{isNew && (
							<Badge
								sx={{
									bg: 'transparent',
									color: 'white',
									px: 2,
									py: 1,
									borderRadius: 9999,
									fontWeight: 700,
									fontSize: 'xxs',
									letterSpacing: 'wide',
									textTransform: 'uppercase',
									backgroundImage: 'linear-gradient(135deg, #27d07e 0%, #06b7a6 100%)',
									boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
								}}
							>
								NEW
							</Badge>
						)}
					</Box>
				)}
				<Heading
					sx={{
						variant: 'styles.h3',
						marginbottom: '2rem',
						color: 'darkgray'
					}}
				>
					{props.node.title}
				</Heading>
				<Flex sx={{py:"0.5rem", pb: "0px", alignItems: "center", flexWrap: "wrap"}}>
					{avatarImg && <Avatar src={avatarImg} sx={{minWidth: "48px", maxHeight: "48px"}}/>}
					<Text sx={{variant: "stypes.p", py: "1rem", px: "0.5rem", color: `black`}}>
						{authorString}
						{props.node.publishedAt ? " | " : ""}
					</Text>
					{props.node.publishedAt && (
						<Text sx={{variant: "stypes.p", py: "1rem", color: "black"}}>
							{format(parseISO(props.node.publishedAt), "MMM d, yyyy")}
						</Text>
					)}
				</Flex>
				<Text
					sx={{
						variant: 'styles.p',
						color: 'gray',
					}}
				>
					{text ? <PortableText body={text} /> : null}
				</Text>
			</Box>
		</Flex>
	);
};

function ZundfolgeLatest(props) {
	return (
		<Container
			sx={{
				py: '1.5rem',
			}}
		>
			<Box sx={{ maxWidth: "1000px", mx: "auto", mb: "1.5rem" }}>
				<Heading
					as="h2"
					sx={{
						variant: "styles.h2",
						mb: 0
					}}
				>
					Zundfolge
					<BoxIcon
						as="span"
						sx={{
							display: "inline-grid",
							ml: "0.5rem",
							verticalAlign: "middle"
						}}
					/>
				</Heading>
				<Box
					as="hr"
					sx={{
						border: "none",
						borderTop: "3px solid",
						borderColor: "text",
						mt: "0.75rem",
						mb: 0
					}}
				/>
			</Box>

			{props.edges.slice(0, 3).map((c, i) => {
				const href = getZundfolgeUrl(c.node.slug.current);
				return (
					<Link
						key={c.node.id || href}
						to={href}
						sx={{
							textDecoration: "none",
							color: "inherit",
							display: "block",
							maxWidth: '1000px',
							mx: 'auto',
							mb: '1.5rem'
						}}
					>
						<Card
							sx={{
								width: '100%',
								borderRadius: '18px',
								border: '1px solid',
								borderColor: 'black',
								overflow: 'hidden'
							}}
						>
							{i % 2 === 0 ? <StoryRow {...c} /> : <StoryRowFlipped {...c} />}
						</Card>
					</Link>
				);
			})}
			<Box sx={{ maxWidth: "1000px", mx: "auto", mt: "1.5rem", textAlign: "center" }}>
				<Link to="/zundfolge/" sx={outline}>
					More Articles
				</Link>
			</Box>
		</Container>
	);
};

ZundfolgeLatest.defaultProps = {
	edges: [
		{
			title: '',
			slug: {
				current: ''
			},
			category: {
				title: ''
			},
			authors: [
				{
					author: {
						name: ''
					}
				}
			]
		},
		{
			title: '',
			slug: {
				current: ''
			},
			category: {
				title: ''
			},
			authors: [
				{
					author: {
						name: ''
					}
				}
			]
		}
	]
}
export default ZundfolgeLatest;
