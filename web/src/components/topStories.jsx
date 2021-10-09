/** @jsxImportSource theme-ui */
import React from 'react';
import PortableText from "./portableText";
import SanityImage from "gatsby-plugin-sanity-image"
import { Card, Container, Heading, Text, Flex } from '@theme-ui/components';

const StoryRow = props => {
    const img = props.node._rawMainImage
    const text = props.node._rawExcerpt ? props.node._rawExcerpt : props.node._rawBody
    return (
      <Flex sx={{
          padding: "1.5rem",
          flexDirection: ["column-reverse","column-reverse","row","row"]
        }}>
        <div>
            <Heading sx={{
                variant: "styles.h3",
                marginbottom: "2rem",
                color: "darkgray"
            }}>
                {props.node.title}
            </Heading>          
            <Text sx={{
                variant: "styles.p",
                color: "gray",
                marginbottom: "2rem"
            }}>
                <PortableText blocks={text} />
            </Text>
        </div>
        <SanityImage {...img} width={600}
            sx={{
                width: "100%", 
                height: "100%", 
                maxHeight: "300px",
                objectFit: "cover",
            }} 
        />
      </Flex>
    );
  };
  
  const StoryRowFlipped = props => {
    const img = props.node._rawMainImage
    const text = props.node._rawExcerpt ? props.node._rawExcerpt : props.node._rawBody
    return (
      <Flex sx={{
        padding: "1.5rem",
        flexDirection: ["column-reverse","column-reverse","row","row"]
    }}>
        <SanityImage {...img} width={600}
            sx={{
                width: "100%", 
                height: "100%", 
                maxHeight: "300px",
                objectFit: "cover",
            }} 
        />
        <div>
          <Heading sx={{
              variant: "styles.h3",
              marginbottom: "2rem",
              color: "darkgray"
          }}>
              {props.node.title}
          </Heading>
          <Text sx={{
              variant: "styles.p",
              color: "gray",
              marginbottom: "2rem"
          }}>
            <PortableText blocks={text} />
          </Text>
        </div>
      </Flex>
    );
  };

const TopStories = (props) => {
	console.log(props);
	const limit = props.limit;
	return (
		<Container
			sx={{
				mx: 'auto',
                my: "0.5rem",
				py: '1.5rem',
				mb: '3rem',
			}}
		>
			<Heading
				sx={{
					width: '100%',
					my: '0.5rem',
					variant: 'styles.h2',
					textAlign: 'center'
				}}
			>
				Top Stories
			</Heading>
            {props.edges.slice(0, limit).map((c, i) => (
                <Card sx={{
                    height: "500px",
                    width: "700px",
                }}>
                    {i % 2 === 0 ? <StoryRow {...c} /> : <StoryRowFlipped {...c} />}
                </Card>
            ))}
		</Container>
	);
};
export default TopStories;
