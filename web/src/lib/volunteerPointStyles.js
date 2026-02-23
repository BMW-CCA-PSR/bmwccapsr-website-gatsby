export const VOLUNTEER_POINT_CAP_COLORS = Object.freeze({
  1: "#1e94ff",
  2: "#197fdd",
  3: "#146bba",
  4: "#0f5898",
  5: "#0b4779",
  10: "#000000",
});

export const getVolunteerPointCapColor = (pointValue) => {
  const value = Number(pointValue);
  if (!Number.isFinite(value)) return "#444444";
  return VOLUNTEER_POINT_CAP_COLORS[value] || "#444444";
};
