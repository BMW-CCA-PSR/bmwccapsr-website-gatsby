/** @jsxImportSource theme-ui */
import React from "react";
import { Box, Card, Flex } from "@theme-ui/components";
import ReactMapGL, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FaMapMarkerAlt } from "react-icons/fa";

const DEFAULT_MAPBOX_PUBLIC_TOKEN =
  "pk.eyJ1IjoiZWJveDg2IiwiYSI6ImNpajViaWg4ODAwNWp0aG0zOHlxNjh3ZzcifQ.OxQI3tKViy-IIIOrLABCPQ";
const MAP_STYLE = "mapbox://styles/ebox86/cmlx98cji000q01qqbnvk3al6";
const MAP_STYLE_FALLBACK = "mapbox://styles/mapbox/light-v11";

const MapCanvas = ({
  latitude,
  longitude,
  title,
  token,
  showZoomControls = true,
  height = ["220px", "240px", "260px"],
}) => {
  const [viewport, setViewport] = React.useState({
    latitude,
    longitude,
    zoom: 13.8,
  });
  const [activeMapStyle, setActiveMapStyle] = React.useState(MAP_STYLE);

  React.useEffect(() => {
    setViewport((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  }, [latitude, longitude]);

  React.useEffect(() => {
    setActiveMapStyle(MAP_STYLE);
  }, []);

  const fallbackToLegacyStyle = React.useCallback(() => {
    setActiveMapStyle((prev) =>
      prev === MAP_STYLE_FALLBACK ? prev : MAP_STYLE_FALLBACK
    );
  }, []);

  const handleMapError = React.useCallback(() => {
    fallbackToLegacyStyle();
  }, [fallbackToLegacyStyle]);

  const handleZoomIn = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.min((prev.zoom || 13.8) + 0.75, 18),
    }));
  };

  const handleZoomOut = () => {
    setViewport((prev) => ({
      ...prev,
      zoom: Math.max((prev.zoom || 13.8) - 0.75, 8),
    }));
  };

  if (typeof window === "undefined") return null;

  return (
    <Box sx={{ width: "100%", height, position: "relative" }}>
      <ReactMapGL
        {...viewport}
        style={{ width: "100%", height: "100%" }}
        mapboxAccessToken={token || DEFAULT_MAPBOX_PUBLIC_TOKEN}
        mapStyle={activeMapStyle}
        onError={handleMapError}
        onMove={(event) => setViewport(event.viewState)}
        dragPan={false}
        scrollZoom={false}
        boxZoom={false}
        keyboard={false}
        dragRotate={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
      >
        <Marker
          latitude={latitude}
          longitude={longitude}
          captureClick={false}
          draggable={false}
          anchor="bottom"
        >
          <Box
            as="span"
            aria-label={title ? `Location for ${title}` : "Event location"}
            sx={{ display: "inline-flex", lineHeight: 0 }}
          >
            <FaMapMarkerAlt size={30} color="#1e94ff" aria-hidden="true" />
          </Box>
        </Marker>
      </ReactMapGL>
      {showZoomControls && (
        <Flex
          sx={{
            position: "absolute",
            top: "8px",
            right: "8px",
            flexDirection: "column",
            gap: 0,
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "black",
            boxShadow: "0 8px 16px rgba(0,0,0,0.14)",
            zIndex: "9999",
            pointerEvents: "auto",
            backgroundColor: "rgba(255,255,255,0.95)",
          }}
        >
          <Box
            as="button"
            type="button"
            aria-label="Zoom in"
            onClick={handleZoomIn}
            sx={{
              width: "38px",
              height: "38px",
              backgroundColor: "white",
              color: "black",
              border: 0,
              borderBottom: "1px solid",
              borderBottomColor: "black",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "24px",
              fontWeight: "bold",
              lineHeight: 1,
              "&:hover": {
                backgroundColor: "lightgray",
                color: "primary",
              },
            }}
          >
            +
          </Box>
          <Box
            as="button"
            type="button"
            aria-label="Zoom out"
            onClick={handleZoomOut}
            sx={{
              width: "38px",
              height: "38px",
              backgroundColor: "white",
              color: "black",
              border: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "24px",
              fontWeight: "bold",
              lineHeight: 1,
              "&:hover": {
                backgroundColor: "lightgray",
                color: "primary",
              },
            }}
          >
            -
          </Box>
        </Flex>
      )}
    </Box>
  );
};

const MapCard = ({
  latitude,
  longitude,
  title,
  token,
  venueLine,
  showZoomControls = true,
  height = ["220px", "240px", "260px"],
}) => {
  const parsedLatitude = Number.parseFloat(String(latitude ?? ""));
  const parsedLongitude = Number.parseFloat(String(longitude ?? ""));
  const hasCoordinates =
    Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);

  if (!hasCoordinates) return null;

  return (
    <Card
      sx={{
        borderRadius: "18px",
        border: "1px solid",
        overflow: "hidden",
      }}
    >
      <MapCanvas
        latitude={parsedLatitude}
        longitude={parsedLongitude}
        title={title}
        token={token}
        showZoomControls={showZoomControls}
        height={height}
      />
      {venueLine && (
        <Box
          sx={{
            px: "1rem",
            py: "0.65rem",
            borderTop: "1px solid",
            borderColor: "lightgray",
            fontSize: "xs",
            color: "gray",
            backgroundColor: "background",
          }}
        >
          {venueLine}
        </Box>
      )}
    </Card>
  );
};

export default MapCard;
