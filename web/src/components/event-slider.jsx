/** @jsxImportSource theme-ui */
import { Container, Text, Flex, Box } from '@theme-ui/components';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import EventSliderButton from './event-slider-button'

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination"

// import Swiper core and required modules
import SwiperCore, {
    Autoplay,Pagination
  } from 'swiper';
  
// install Swiper modules
SwiperCore.use([Autoplay,Pagination]);


const EventSlider = (props) => {
    return (
        <Container sx={{
            backgroundColor: "secondary", 
            width: "100%",
            height: "100%",
            py: "20px"
        }}>
            <Box sx={{
                flexDirection: "row",
                justifyContent: "center",
                height: "100%",
                }}>
                <Text sx={{
                    color: "white",
                    variant: "styles.h3",
                    fontWeight: "300"
                }}>Next Event: </Text>
                <Swiper 
                    //spaceBetween={30} 
                    //centeredSlides={true} 
                    // autoplay={{
                    //     delay: 5000,
                    // }} 
                    sx={{
                        height: "100%",
                        width: "100%"
                    }}
                >
                {props.edges.map((i) => {
                    <SwiperSlide>
                        <p>{i.node.title}</p>
                        {/* <EventSliderButton {...i} /> */}
                    </SwiperSlide>
                    })
                }

                </Swiper>
            </Box>
        </Container>
    )
}
export default EventSlider