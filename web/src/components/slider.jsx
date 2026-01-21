/** @jsxImportSource theme-ui */
import React from "react";
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

    const baseSlides = Array.isArray(props.slides) ? props.slides : [];
    const featuredSlides = Array.isArray(props.featuredSlides)
      ? props.featuredSlides
      : [];
    const adSlides = Array.isArray(props.edges)
      ? props.edges
          .map((slideAd) => slideAd?.node?._rawSlideAd)
          .filter(Boolean)
      : [];
    const slides = [...baseSlides, ...featuredSlides, ...adSlides];
    const seenKeys = new Set();
    const uniqueSlides = slides.filter((slide, index) => {
        const key = slide?._key || slide?._id || slide?.heading || slide?.title || `slide-${index}`;
        if (seenKeys.has(key)) {
            return false;
        }
        seenKeys.add(key);
        return true;
    });

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
                navigation={false} 
            >
            {uniqueSlides.map((i, index) => {
                if (i._type === "hero") {
                    return (
                        <SwiperSlide key={i._key || i._id || `slide-${index}`}>
                            <Hero {...i} isHomepage={props.isHomepage} />
                        </SwiperSlide>
                    );
                }
                return null;
            })}
            </Swiper>
        </div>
    );
}

export default HeroSlider
