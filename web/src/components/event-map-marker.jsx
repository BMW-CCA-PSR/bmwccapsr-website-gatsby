/** @jsxImportSource theme-ui */
import React from "react";
import ReactMapGL, { Marker } from 'react-map-gl';
import { StaticImage } from "gatsby-plugin-image"

function Icon() {
    return (
        <StaticImage
            alt="BMW CCA PSR"
            src="../images/map-pin.png"
            placeholder="blurred"
            layout="constrained"
            loading="eager"
        />
    )
}

function Pin(props) {

    return (
        <Marker
            latitude={props.location.lat}
            longitude={props.location.lng}
            captureClick={false}
            draggable={false}
            offsetTop={-30}
            offsetLeft={-15}>
            <div sx={{}}
                onClick={() => {
                    props.openPopup(props.data);
                }}>
                {Icon()}
            </div>
        </Marker>
    );
}

export default Pin;