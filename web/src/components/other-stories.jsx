/** @jsxImportSource theme-ui */
import React from 'react';
import { getZundfolgeUrl } from "../lib/helpers";
import PortableText from './portableText';
import SanityImage from 'gatsby-plugin-sanity-image';
import { Card, Container, Heading, Text, Flex, Box, Avatar } from '@theme-ui/components';
import { Link } from "gatsby";
import BoxHeader from './BoxHeader';
import { imageUrlFor } from "../lib/image-url";

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
    const category = props.node.category.title;
	  const authorString = String(authors.map((author) => ` ${author.author.name}`));
    const avatarImg = authors[0].author.image && imageUrlFor(authors[0].author.image)
      .width(48)
      .height(48)
      .fit("fill")
      .auto("format")
      .url()
    return (
      <Link
        to={getZundfolgeUrl(props.node.slug.current)}
        sx={{textDecoration: "none"}}
      >
        <div sx={{ maxWidth: "600px",}}>
        <Text sx={{ variant: 'text.label', color: 'black'}}>{category}</Text>
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
            <Flex sx={{py:"0.5rem"}}>
						  <Avatar src={avatarImg} sx={{minWidth: "48px", maxHeight: "48px"}}/>
						  <Text sx={{variant: "stypes.p", py: "1rem", px: "0.5rem"}}>{authorString}</Text>
					  </Flex>
				<Text
					sx={{
						variant: 'styles.p',
						color: 'gray',
						marginbottom: '2rem'
					}}
				>
					{text ? <PortableText blocks={text} /> : null}
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
			<BoxHeader title='Other Stories'/>
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
