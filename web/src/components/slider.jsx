/** @jsxImportSource theme-ui */
import React, { useEffect, useRef } from "react";
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

const AUTOPLAY_DELAY_MS = 5000;

function HeroSlider(props) {
    const swiperRef = useRef(null);
    const progressFillRef = useRef(null);
    const rafRef = useRef(null);
    const cycleStartRef = useRef(0);
    const autoplayDelayRef = useRef(AUTOPLAY_DELAY_MS);

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

    const setProgress = (value) => {
        const fill = progressFillRef.current;
        if (!fill) return;
        const clamped = Math.max(0, Math.min(value, 1));
        fill.style.transform = `scaleX(${clamped})`;
    };

    const stopProgressLoop = () => {
        if (rafRef.current) {
            window.cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    };

    const progressTick = () => {
        const swiper = swiperRef.current;
        if (!swiper || !swiper.autoplay?.running) {
            setProgress(0);
            stopProgressLoop();
            return;
        }
        const elapsed = performance.now() - cycleStartRef.current;
        const delay = Math.max(1, autoplayDelayRef.current || AUTOPLAY_DELAY_MS);
        setProgress(elapsed / delay);
        rafRef.current = window.requestAnimationFrame(progressTick);
    };

    const startProgressCycle = () => {
        stopProgressLoop();
        cycleStartRef.current = performance.now();
        setProgress(0);
        rafRef.current = window.requestAnimationFrame(progressTick);
    };

    const resolveAutoplayDelay = (swiper) => {
        const configuredDelay = swiper?.params?.autoplay?.delay;
        if (typeof configuredDelay === "number" && configuredDelay > 0) {
            autoplayDelayRef.current = configuredDelay;
            return;
        }
        autoplayDelayRef.current = AUTOPLAY_DELAY_MS;
    };

    useEffect(() => {
        return () => {
            stopProgressLoop();
        };
    }, []);

    return (
        <div
            sx={{
                position: "relative",
            }}
        >
            <Swiper 
                spaceBetween={30} 
                centeredSlides={true} 
                autoplay={{
                    delay: AUTOPLAY_DELAY_MS,
                    disableOnInteraction: true
                }} 
                pagination={{
                    clickable: true
                }} 
                navigation={false}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                    resolveAutoplayDelay(swiper);
                    if (swiper.autoplay?.running) {
                        startProgressCycle();
                    } else {
                        setProgress(0);
                    }
                }}
                onSlideChange={() => {
                    startProgressCycle();
                }}
                onAutoplayStart={() => {
                    startProgressCycle();
                }}
                onAutoplayStop={() => {
                    setProgress(0);
                    stopProgressLoop();
                }}
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
            {props.isHomepage && uniqueSlides.length > 1 ? (
                <div
                    sx={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: "4px",
                        bg: "rgba(255, 255, 255, 0.32)",
                        zIndex: 10,
                        pointerEvents: "none",
                    }}
                >
                    <div
                        ref={progressFillRef}
                        sx={{
                            width: "100%",
                            height: "100%",
                            bg: "background",
                            transform: "scaleX(0)",
                            transformOrigin: "left center",
                            willChange: "transform",
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
}

export default HeroSlider
