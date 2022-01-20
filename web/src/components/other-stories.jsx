/** @jsxImportSource theme-ui */
import React from 'react';
import { getZundfolgeUrl } from "../lib/helpers";
import PortableText from './portableText';
import SanityImage from 'gatsby-plugin-sanity-image';
import { Card, Container, Heading, Text, Flex, Box } from '@theme-ui/components';
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
				maxHeight: '200px',
				objectFit: 'cover',
                borderTopLeftRadius: "6px",
                borderTopRightRadius: "6px"
			}}
		/>
	);
};

  function StoryPreview(props) {
    const text = props.node._rawExcerpt ? props.node._rawExcerpt : null;
	const authors = props.node.authors;
    const categories = props.node.categories;
	const authorString = String(authors.map((author) => ` ${author.author.name}`));
    const catString = String(categories.map((cat) => ` ${cat.title}`));
    return (
      <Link
        to={getZundfolgeUrl(props.node.slug.current)}
        sx={{textDecoration: "none"}}
      >
        <div sx={{            maxWidth: "600px",}}>
        <Text sx={{ variant: 'text.label', color: 'black'}}>{catString}</Text>
        <Card
          sx={{
            textDecoration: "none",
            color: "text",
            width: "100%",
            maxWidth: "600px",
            mx: "auto",
            borderRadius: "6px",
            backgroundColor: "white",
            boxShadow: "0 5px 5px -3px rgba(110, 131, 183, 0.2), 0 3px 14px 2px rgba(110, 131, 183, 0.12), 0 8px 10px 0 rgba(110, 131, 183, 0.14)"
          }}
        >
		  <StoryImg {...props.node.mainImage} />
          <Box p={3}>
            <Heading sx={{ textDecoration: "none", variant: "styles.h3"}} >{props.node.title}</Heading>
            <Text sx={{ variant: 'styles.p', py: '1rem' }}>
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
          </Box>
        </Card>
        </div>
      </Link>
    );
  }

const OtherStories = (props) => {
	const limit = props.limit;
	return (
		<Container
			sx={{
				mt: '0.5rem',
				pt: '1.5rem',
        pb: '2.5rem',
        bg: "lightgray"
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
					Other Stories
					</Heading>
				<BoxIconFlipped />
			</Flex>
            <div>
                <ul sx={{
                    listStyle: 'none',
                    display: 'grid',
                    gridGap: 3,
                    gridTemplateColumns: 'repeat(auto-fit, minmax(256px, 1fr))',
                    gridAutoRows: "minmax(50px, auto)",
                    m: 0,
                    p: 0,
                    maxWidth: '1000px',
                    mx: "auto",
                    padding: '1.5rem'
                }}>
                    {props.edges &&
                    props.edges.slice(3, limit + 3).map((c, i) => (
                        <li>
                            <StoryPreview {...c} />
                        </li>
                    ))}
                </ul>
        </div>
		</Container>
	);
};
export default OtherStories;
