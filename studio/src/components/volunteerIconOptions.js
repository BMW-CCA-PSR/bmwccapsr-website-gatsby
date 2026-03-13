import {
  FaAward,
  FaBullhorn,
  FaCalendarAlt,
  FaCamera,
  FaCarSide,
  FaClipboardCheck,
  FaCogs,
  FaFlagCheckered,
  FaHandsHelping,
  FaHardHat,
  FaHeart,
  FaIdBadge,
  FaRoute,
  FaShieldAlt,
  FaToolbox,
  FaUserAlt,
  FaUserCheck,
  FaUsers,
  FaWrench,
} from "react-icons/fa";

export const VOLUNTEER_ICON_OPTIONS = [
  { title: "User", value: "user", icon: FaUserAlt },
  { title: "User check", value: "user-check", icon: FaUserCheck },
  { title: "Users", value: "users", icon: FaUsers },
  { title: "Clipboard", value: "clipboard-check", icon: FaClipboardCheck },
  { title: "Shield", value: "shield", icon: FaShieldAlt },
  { title: "Camera", value: "camera", icon: FaCamera },
  { title: "Route", value: "route", icon: FaRoute },
  { title: "Bullhorn", value: "bullhorn", icon: FaBullhorn },
  { title: "Wrench", value: "wrench", icon: FaWrench },
  { title: "Toolbox", value: "toolbox", icon: FaToolbox },
  { title: "Hands helping", value: "hands-helping", icon: FaHandsHelping },
  { title: "Car", value: "car", icon: FaCarSide },
  { title: "Badge", value: "id-badge", icon: FaIdBadge },
  { title: "Hard hat", value: "hard-hat", icon: FaHardHat },
  { title: "Heart", value: "heart", icon: FaHeart },
  { title: "Flag", value: "flag-checkered", icon: FaFlagCheckered },
  { title: "Cog", value: "cogs", icon: FaCogs },
  { title: "Calendar", value: "calendar", icon: FaCalendarAlt },
  { title: "Award", value: "award", icon: FaAward },
];

export const VOLUNTEER_ICON_COMPONENTS = VOLUNTEER_ICON_OPTIONS.reduce(
  (acc, item) => {
    acc[item.value] = item.icon;
    return acc;
  },
  {},
);

