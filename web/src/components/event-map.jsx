/** @jsxImportSource theme-ui */
import React from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.GATSBY_SANITY_MAPBOX_TOKEN;

class EventMap extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        lng: props.location.lng,
        lat: props.location.lat,
        zoom: 14
     };
   }

   componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.state.lng, this.state.lat],
      zoom: this.state.zoom,
      interactive: false,
    });
  }
  
  render() {
    return (
      <div>
        <div ref={el => this.mapContainer = el} />
      </div>
    )
  }
 }
 export default EventMap;
 