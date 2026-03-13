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
  FaUserAlt,
  FaUserCheck,
  FaUsers,
  FaWrench,
  FaToolbox,
} from "react-icons/fa";

const ICON_BY_KEY = {
  user: FaUserAlt,
  "user-check": FaUserCheck,
  users: FaUsers,
  "clipboard-check": FaClipboardCheck,
  shield: FaShieldAlt,
  camera: FaCamera,
  route: FaRoute,
  bullhorn: FaBullhorn,
  wrench: FaWrench,
  toolbox: FaToolbox,
  "hands-helping": FaHandsHelping,
  car: FaCarSide,
  "id-badge": FaIdBadge,
  "hard-hat": FaHardHat,
  heart: FaHeart,
  "flag-checkered": FaFlagCheckered,
  cogs: FaCogs,
  calendar: FaCalendarAlt,
  award: FaAward,
};

export const getVolunteerRoleIconComponent = (iconKey) => {
  const key = String(iconKey || "").trim().toLowerCase();
  return ICON_BY_KEY[key] || null;
};

export const getVolunteerRolePresentationColor = (colorValue) => {
  const value = String(colorValue || "").trim();
  if (!value) return null;
  return value;
};

