/** @jsxImportSource theme-ui */
import React, { useState, useEffect, useCallback } from "react";
import clientConfig from "../../client-config";
import SanityImage from "gatsby-plugin-sanity-image"
import Hero from "./hero";
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination"
import "swiper/css/navigation"


// import Swiper core and required modules
import SwiperCore, {
    Autoplay,Pagination,Navigation
  } from 'swiper';
  
// install Swiper modules
SwiperCore.use([Autoplay,Pagination,Navigation]);

function HeroSlider(props) {

    const slides = props.slides

    return (
        <div>
            <Swiper 
                spaceBetween={30} 
                centeredSlides={true} 
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: true
                }} 
                pagination={{
                    clickable: true
                }} 
                navigation={true} 
            >
            {slides.map((i) => {
                if (i._type == "hero") {
                    return (
                        <SwiperSlide >
                            <Hero {...i} />
                        </SwiperSlide>
                    )
                }
            })
        }

            </Swiper>
        </div>
    );
}

export default HeroSlider