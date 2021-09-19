/** @jsxImportSource theme-ui */
import React, { useState, useEffect, useCallback } from "react";
import clientConfig from "../../client-config";
import { getGatsbyImageData } from 'gatsby-source-sanity'
import { Heading, Container, Flex, Divider, Button, Box } from "theme-ui"
import { Link } from 'gatsby'
import SanityImage from "gatsby-plugin-sanity-image"
import Hero from "./hero";
import { useEmblaCarousel } from 'embla-carousel/react'
import { useRecursiveTimeout } from "./useRecursiveTimeout";
import { PrevButton, NextButton } from "./SliderButtons";

function HeroSlider(props) {
    console.log(props)
    const [emblaRef] = useEmblaCarousel()
    const [viewportRef, embla] = useEmblaCarousel({ skipSnaps: false });
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const slides = props.slides

    const AUTOPLAY_INTERVAL = 4000;

    const autoplay = useCallback(() => {
        if (!embla) return;
        if (embla.canScrollNext()) {
          embla.scrollNext();
        } else {
          embla.scrollTo(0);
        }
      }, [embla]);
    
    const { play, stop } = useRecursiveTimeout(autoplay, AUTOPLAY_INTERVAL);
    
    const scrollNext = useCallback(() => {
        if (!embla) return;
        embla.scrollNext();
        stop();
      }, [embla, stop]);
    
      const scrollPrev = useCallback(() => {
        if (!embla) return;
        embla.scrollPrev();
        stop();
      }, [embla, stop]);

      const onSelect = useCallback(() => {
        if (!embla) return;
        setPrevBtnEnabled(embla.canScrollPrev());
        setNextBtnEnabled(embla.canScrollNext());
      }, [embla]);

      useEffect(() => {
        if (!embla) return;
        onSelect();
        embla.on("select", onSelect);
        embla.on("pointerDown", stop);
      }, [embla, onSelect, stop]);
    
      useEffect(() => {
        play();
      }, [play]);

    return (
        <div sx={{
            position: "relative",
        }}>
        <div sx={{
            overflow: "hidden",
            width: "100%",
            height: "500px"

        }} ref={viewportRef}>
            <div sx={{
                display: "flex",
                userSelect: "none",
                webkitTouchCallout: "none",
                khtmlUserSelect: "none",
                webkitTapHighlightColor: "transparent",
            }}>
                {slides.map((i) => {
                    if (i._type == "illustration") {
                        return (
                            <div sx={{ position: "relative", flex: "0 0 100%" }}>
                                <SanityImage 
                                    {...i.image} 
                                    width={500}
                                    style={{
                                        width: "100%",
                                        height: "500px",
                                        objectFit: "cover",
                                      }}
                                />
                            </div>
                        )
                    } else if (i._type == "hero") {
                        return (
                            <div sx={{ position: "relative", flex: "0 0 100%" }}>
                                <Hero {...i} />
                            </div>
                        )
                    }
                })
                }
            </div>
        </div>
        <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
        <NextButton onClick={scrollNext} enabled={nextBtnEnabled} />
    </div>
    );
}

export default HeroSlider