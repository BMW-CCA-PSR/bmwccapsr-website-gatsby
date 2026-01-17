/** @jsxImportSource theme-ui */
import React from 'react';
import { getZundfolgeUrl } from "../lib/helpers";
import PortableText from './portableText';
import SanityImage from 'gatsby-plugin-sanity-image';
import { Box, Card, Container, Heading, Text, Flex, Avatar} from '@theme-ui/components';
import { Link } from "gatsby";
import { imageUrlFor } from "../lib/image-url";
import { BoxIcon } from "./box-icons";
import { outline } from "./event-slider";

var style = {
    textDecoration: "none",
    textTransform: "uppercase",
    fontSize: 15,
    backgroundColor: "primary",
    border: "none",
    color: "white",
    py: "8px",
    px: "20px",
    position: "relative",
    borderRadius: "4px",
	transition: "background-color 0.5s ease-out",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "&:hover":{
      color: "white",
      bg: "highlight",
    }
  }

const StoryImg = (props) => {
	return (
		<SanityImage
			{...props}
			width={600}
			sx={{
				// borderStyle: "solid",
				// borderWidth: "1px",
				width: '100%',
				height: '100%',
				minHeight: '300px',
				maxHeight: '300px',
				objectFit: 'cover',
                borderRadius: "6px"
			}}
		/>
	);
};

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
	return (
		<Flex
			sx={{
				flexDirection: [ 'column', 'column', 'row', 'row' ]
			}}
		>
			<div sx={{ px: '1rem'}}>
				{props.node.category && <Text sx={{ variant: 'text.label', color: 'black'}}>{props.node.category.title}</Text>}
				<Heading
					sx={{
						variant: 'styles.h3',
						marginbottom: '2rem',
						color: 'darkgray'
					}}
				>
					{props.node.title}
				</Heading>
				<Flex sx={{py:"0.5rem", pb: "0px"}}>
					{avatarImg && <Avatar src={avatarImg} sx={{minWidth: "48px", maxHeight: "48px"}}/>}
					<Text sx={{variant: "stypes.p", py: "1rem", px: "0.5rem", color: `black`}}>{authorString}</Text>
				</Flex>
				<Text
					sx={{
						variant: 'styles.p',
						color: 'gray',
					}}
				>
					{text ? <PortableText body={text} /> : null}
				</Text>
                <div sx={{my: "1.5rem"}}>
                    <Link to={getZundfolgeUrl(props.node.slug.current)} sx={style}>
                        Read More
                    </Link>
                </div>
			</div>
			{img && <StoryImg {...img} />}
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
	return (
		<Flex
			sx={{
				flexDirection: [ 'column-reverse', 'column-reverse', 'row', 'row' ]
			}}
		>
			{img && <StoryImg {...img} />}
			<div sx={{ px: '1rem' }}>
				{props.node.category && <Text sx={{ variant: 'text.label', color: 'black'}}>{props.node.category.title}</Text>}
				<Heading
					sx={{
						variant: 'styles.h3',
						marginbottom: '2rem',
						color: 'darkgray'
					}}
				>
					{props.node.title}
				</Heading>
				<Flex sx={{py:"0.5rem", pb: "0px"}}>
					{avatarImg && <Avatar src={avatarImg} sx={{minWidth: "48px", maxHeight: "48px"}}/>}
					<Text sx={{variant: "stypes.p", py: "1rem", px: "0.5rem", color: `black`}}>{authorString}</Text>
				</Flex>
				<Text
					sx={{
						variant: 'styles.p',
						color: 'gray',
					}}
				>
					{text ? <PortableText body={text} /> : null}
				</Text>
                <div sx={{my: "1.5rem"}}>
                    <Link to={getZundfolgeUrl(props.node.slug.current)} sx={style}>
                        Read More
                    </Link>
                </div>
			</div>
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

			{props.edges.slice(0, 3).map((c, i) => (
				<Card
					sx={{
						maxWidth: '1000px',
						mx: 'auto',
						padding: '1.5rem'
					}}
				>
					{i % 2 === 0 ? <StoryRow {...c} /> : <StoryRowFlipped {...c} />}
				</Card>
			))}
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
