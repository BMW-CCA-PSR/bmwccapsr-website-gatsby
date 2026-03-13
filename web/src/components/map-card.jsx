/** @jsxImportSource theme-ui */
import React from "react";
import { Box, Card, Flex } from "@theme-ui/components";
import ReactMapGL, { Marker } from "react-map-gl";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FiMaximize2, FiX } from "react-icons/fi";

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
  interactive = false,
  controlsTop = "8px",
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
      prev === MAP_STYLE_FALLBACK ? prev : MAP_STYLE_FALLBACK,
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
    <Box
      sx={{
        width: "100%",
        height,
        position: "relative",
        "& .mapboxgl-canvas": {
          cursor: interactive ? "grab" : "default !important",
        },
      }}
    >
      <ReactMapGL
        {...viewport}
        style={{ width: "100%", height: "100%" }}
        mapboxAccessToken={token || DEFAULT_MAPBOX_PUBLIC_TOKEN}
        mapStyle={activeMapStyle}
        onError={handleMapError}
        onMove={(event) => setViewport(event.viewState)}
        dragPan={interactive}
        scrollZoom={interactive}
        boxZoom={interactive}
        keyboard={interactive}
        dragRotate={false}
        doubleClickZoom={interactive}
        touchZoomRotate={interactive}
        cursor={interactive ? "grab" : "default"}
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
            sx={{
              display: "inline-flex",
              lineHeight: 0,
              pointerEvents: "none",
            }}
          >
            <FaMapMarkerAlt size={30} color="#1e94ff" aria-hidden="true" />
          </Box>
        </Marker>
      </ReactMapGL>
      {showZoomControls && (
        <Flex
          sx={{
            position: "absolute",
            top: controlsTop,
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
  showExpandControl = true,
  height = ["220px", "240px", "260px"],
}) => {
  const parsedLatitude = Number.parseFloat(String(latitude ?? ""));
  const parsedLongitude = Number.parseFloat(String(longitude ?? ""));
  const hasCoordinates =
    Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const closeExpandedMap = React.useCallback(() => {
    setIsExpanded(false);
  }, []);

  React.useEffect(() => {
    if (
      !isExpanded ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    ) {
      return undefined;
    }
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
    };
    const previousHtmlOverflowY = document.documentElement.style.overflowY;

    document.documentElement.style.overflowY = "scroll";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.documentElement.style.overflowY = previousHtmlOverflowY;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.left = previousBodyStyles.left;
      document.body.style.right = previousBodyStyles.right;
      document.body.style.width = previousBodyStyles.width;
      window.scrollTo(scrollX, scrollY);
    };
  }, [isExpanded]);

  if (!hasCoordinates) return null;

  return (
    <>
      <Card
        sx={{
          borderRadius: "18px",
          border: "1px solid",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box sx={{ position: "relative" }}>
          <MapCanvas
            latitude={parsedLatitude}
            longitude={parsedLongitude}
            title={title}
            token={token}
            showZoomControls={showZoomControls}
            height={height}
            interactive={false}
            controlsTop="8px"
          />
          {showExpandControl && (
            <Box
              as="button"
              type="button"
              aria-label="Expand map"
              title="Expand map"
              onClick={() => setIsExpanded(true)}
              sx={{
                position: "absolute",
                top: "8px",
                right: showZoomControls ? "54px" : "8px",
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: "black",
                bg: "rgba(255,255,255,0.95)",
                color: "text",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 5,
                "&:hover": {
                  bg: "lightgray",
                  color: "primary",
                },
              }}
            >
              <FiMaximize2 size={16} aria-hidden="true" />
            </Box>
          )}
        </Box>

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

      {showExpandControl && isExpanded && (
        <Box
          role="dialog"
          aria-modal="true"
          aria-label={title ? `${title} map` : "Expanded map"}
          onClick={closeExpandedMap}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 12000,
            bg: "rgba(38, 42, 48, 0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: ["0.75rem", "1rem", "1.5rem"],
          }}
        >
          <Box
            onClick={(event) => event.stopPropagation()}
            sx={{
              width: ["100%", "100%", "92vw"],
              maxWidth: "1280px",
              height: ["78vh", "80vh", "84vh"],
              borderRadius: "18px",
              overflow: "hidden",
              border: "1px solid",
              borderColor: "black",
              bg: "white",
              position: "relative",
            }}
          >
            <MapCanvas
              latitude={parsedLatitude}
              longitude={parsedLongitude}
              title={title}
              token={token}
              showZoomControls={true}
              height="100%"
              interactive={true}
              controlsTop="56px"
            />
            <Box
              as="button"
              type="button"
              aria-label="Close expanded map"
              title="Close"
              onClick={closeExpandedMap}
              sx={{
                position: "absolute",
                top: "8px",
                right: "8px",
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: "black",
                bg: "rgba(255,255,255,0.95)",
                color: "text",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 8,
                "&:hover": {
                  bg: "lightgray",
                  color: "primary",
                },
              }}
            >
              <FiX size={20} aria-hidden="true" />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MapCard;
