export const preventImageDrag = (event) => {
  event.preventDefault();
};

export const nonDraggableImageProps = {
  draggable: false,
  onDragStart: preventImageDrag,
};

export const nonDraggableImageSx = {
  userSelect: "none",
  WebkitUserDrag: "none",
  "& img": {
    userSelect: "none",
    WebkitUserDrag: "none",
    pointerEvents: "none",
  },
  "& picture": {
    userSelect: "none",
    WebkitUserDrag: "none",
  },
};
