import React from "react";
import Image from 'gatsby-plugin-sanity-image';
import { Box, Text } from '@theme-ui/components';

function MainImage(props){
  return (
    (props ? 
    <Box sx={{
      backgroundColor: "lightgray",
      padding: '1.5rem',
    }}>
      <Image
        {...props.mainImage}
        width={300}
        alt={props.mainImage.alt}
        sx={{
          width: "50px",
          height: "50px", 
          objectFit: "cover",
        }}
      />
    <Text sx={{
      variant: "stypes.p", 
      py: "1rem", 
      px: "0.5rem", 
      color: `black`
    }}>{props.mainImage.caption}</Text>
    </Box> : <></>)
  );
};

export default MainImage;