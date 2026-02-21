/** @jsxImportSource theme-ui */
import NavLink from "./navLink";
import React from "react";
import { useLocation } from "@reach/router";

const fixedSlantClip = "polygon(var(--nav-slant-size) 0, 100% 0, calc(100% - var(--nav-slant-size)) 100%, 0 100%)";

const Dropdown = props => {
    const link = props.navigationItemUrl
    const location = useLocation();
    const getPath = (item) => {
        if (item?.landingPageRoute?.slug?.current) {
            return `/${item.landingPageRoute.slug.current}`;
        }
        if (item?.route) {
            return item.route;
        }
        return null;
    };
    const isChildActive = link?.items?.some((subLink) => {
        const path = getPath(subLink);
        if (!path) return false;
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    });
    const activeLinkStyles = isChildActive
        ? {
            color: "background",
            "--nav-bg-opacity": 1,
            WebkitTextStroke: "0.35px currentColor",
            textShadow: "0 0 0.01px currentColor"
        }
        : {};
    return (
        <ul
            sx={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                width: "100%",
                color: "darkgray",
                height: "100%",
                textAlign: "center"
            }}
        >
            <li
                sx={{
                textTransform: "uppercase",
                position: "relative",
                height: "100%",
                textAlign: "center",
                ":hover > button": {
                    color: "background",
                    "--nav-bg-opacity": 1
                },
                    ":hover > ul": {
                        visibility: "visible",
                        opacity: "1",
                        display: "block",
                    },
                }}
            >
                <button
                    type="button"
                    sx={{
                        textDecoration: "none",
                        px: "2rem",
                        cursor: "pointer",
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    width: "100%",
                    color: isChildActive ? "background" : "darkgray",
                    background: "none",
                    border: "none",
                    font: "inherit",
                    position: "relative",
                    isolation: "isolate",
                    "--nav-slant-size": "14px",
                    "--nav-bg-opacity": 0,
                    transition: "color 160ms ease",
                    "&::before": {
                        content: "\"\"",
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "primary",
                        clipPath: fixedSlantClip,
                        WebkitClipPath: fixedSlantClip,
                        opacity: "var(--nav-bg-opacity)",
                        transition: "opacity 160ms ease",
                        zIndex: 0
                    },
                    ...activeLinkStyles
                }}
                aria-haspopup={link.items && link.items.length > 0 ? true : false}
            >
                    <span sx={{ position: "relative", zIndex: 1 }}>{props.title}</span>
                </button>
                {link.items && link.items.length > 0 ? (
                    <ul
                        sx={{
                            textTransform: "uppercase",
                            listStyle: "none",
                            p: 0,
                            display: "flex",
                            width: "100%",
                            backgroundColor: "secondary",
                            visibility: "hidden",
                            opacity: "0",
                            position: "absolute",
                            marginTop: "0px",
                            top: "100%",
                            left: 0,
                            //borderRadius: "6px",
                            textAlign: "center",
                            right: "0",
                            //borderBottomRightRadius: "6px",
                            //borderBottomLeftRadius: "6px",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 4px 5px 0 rgba(0, 0, 0, 0.14)",
                            ":hover": {
                                visibility: "visible",
                                opacity: "1",
                                display: "block",
                            }
                        }}
                        aria-label="submenu"
                    >
                        {link.items.map((subLink) => (
                            <li
                                sx={{
                                    clear: "both",
                                    //p: "1rem",
                                    ":hover": {
                                        backgroundColor: "primary",
                                    },
                                    width: "100%"
                                }}
                                key={subLink.title}
                            >
                                <NavLink {...subLink} subMenu={true} />
                            </li>
                        ))}
                    </ul>
                ) : null}
            </li>
        </ul>
    )
}

export default Dropdown;
