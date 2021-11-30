/** @jsxImportSource theme-ui */
import React from 'react';
import { getZundfolgeUrl } from "../lib/helpers";
import PortableText from './portableText';
import SanityImage from 'gatsby-plugin-sanity-image';
import { Card, Container, Heading, Text, Flex } from '@theme-ui/components';
import { Link } from "gatsby";
import {BoxIcon, BoxIconFlipped} from './box-icons';

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
    borderRadius: "2px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "&:hover":{
      color: "black",
      bg: "highlight",
    }
  }

const StoryImg = (props) => {
	return (
		<SanityImage
			{...props}
			width={600}
			sx={{
				width: '100%',
				height: '100%',
				maxHeight: '300px',
				objectFit: 'cover',
                borderRadius: "6px"
			}}
		/>
	);
};

const StoryRow = (props) => {
	const authors = props.node.authors;
	const authorString = String(authors.map((author) => ` ${author.author.name}`));
	const img = props.node._rawMainImage;
	const text = props.node._rawExcerpt ? props.node._rawExcerpt : null;
	return (
		<Flex
			sx={{
				flexDirection: [ 'column', 'column', 'row', 'row' ]
			}}
		>
			<div sx={{ px: '1rem'}}>
				{props.node.categories.map((cat) => cat.title)}
				<Heading
					sx={{
						variant: 'styles.h3',
						marginbottom: '2rem',
						color: 'darkgray'
					}}
				>
					{props.node.title}
				</Heading>
				<Text sx={{ variant: 'stypes.p', py: '1rem' }}>
					By <b>{authorString}</b>
				</Text>
				<Text
					sx={{
						variant: 'styles.p',
						color: 'gray',
						marginbottom: '2rem'
					}}
				>
					{text ? <PortableText blocks={text} /> : <br/>}
				</Text>
                <div sx={{my: "1.5rem"}}>
                    <Link to={getZundfolgeUrl(props.node.slug.current)} sx={style}>
                        Read More
                    </Link>
                </div>
			</div>
			<StoryImg {...img} />
		</Flex>
	);
};

const StoryRowFlipped = (props) => {
	const authors = props.node.authors;
	const authorString = String(authors.map((author) => ` ${author.author.name}`));
	const img = props.node._rawMainImage;
	const text = props.node._rawExcerpt ? props.node._rawExcerpt : null;
	return (
		<Flex
			sx={{
				flexDirection: [ 'column-reverse', 'column-reverse', 'row', 'row' ]
			}}
		>
			<StoryImg {...img} />
			<div sx={{ px: '1rem' }}>
				{props.node.categories.map((cat) => cat.title)}
				<Heading
					sx={{
						variant: 'styles.h3',
						marginbottom: '2rem',
						color: 'darkgray'
					}}
				>
					{props.node.title}
				</Heading>
				<Text sx={{ variant: 'stypes.p', py: '1rem' }}>
					By <b>{authorString}</b>
				</Text>
				<Text
					sx={{
						variant: 'styles.p',
						color: 'gray',
						marginbottom: '2rem'
					}}
				>
					{text ? <PortableText blocks={text} /> : <br/>}
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

const TopStories = (props) => {
	return (
		<Container
			sx={{
				my: '0.5rem',
				py: '1.5rem',
				mb: '3rem',
			}}
		>
			<Flex sx={{
				flexDirection: "row", 
				mx: "auto",
				my: "20px",
				justifyContent: "center"
				}}>
				<BoxIcon />
					<Heading
					sx={{
						mx: "15px",
						variant: 'styles.h2',
						lineHeight: "0.7"
					}}>
					Top Stories
					</Heading>
				<BoxIconFlipped />
			</Flex>

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
		</Container>
	);
};
export default TopStories;
