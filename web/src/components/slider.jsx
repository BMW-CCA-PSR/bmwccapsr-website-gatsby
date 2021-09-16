/** @jsxImportSource theme-ui */
import React from "react";
import Slider from "react-slick";
import clientConfig from "../../client-config";
import { getGatsbyImageData } from 'gatsby-source-sanity'
import { Heading, Container, Flex, Divider, Button, Box } from "theme-ui"
import { Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import Hero from "./hero";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const maybeImage = image => {
    let img = null;
    if (image && image.asset) {
      const fluidProps = getGatsbyImageData(
        image.asset._id,
        { maxWidth: 960 },
        clientConfig.sanity
      );
  
      img = (
        <GatsbyImage image={fluidProps} sx={{width: "100%"}} alt={image.alt} />
      );
    }
    return img;
  };

function HeroSlider(props) {
    const slides = props.slides
    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
      };
      return (
        <Slider {...settings}>
            {slides.map((i) => {
                if (i._type == "illustration"){
                    const img = maybeImage(i.image);
                    return (
                        <Box sx={{
                            width: "100%",
                            bg: "red",
                          }}>
                              {img}
                          </Box>
                    )
                } else if (i._type == "hero"){
                    return (
                        <Hero {...i} />
                    )
                }
            })
            }
        </Slider>
      );
    }

export default HeroSlider