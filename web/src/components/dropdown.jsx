/** @jsxImportSource theme-ui */
import NavLink from "./navLink";
import React from "react";
import { useLocation } from "@reach/router";

const Dropdown = props => {
    const link = props.navigationItemUrl
    const location = useLocation();
    const getPath = (item) =>
        item.landingPageRoute
            ? `/${item.landingPageRoute.slug.current}`
            : item.route
                ? item.route
                : "/";
    const isChildActive = link?.items?.some((subLink) => {
        const path = getPath(subLink);
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    });
    const activeLinkStyles = isChildActive
        ? { backgroundColor: "primary", color: "background" }
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
                ":hover > a, :focus-within > a": {
                    backgroundColor: "primary",
                    color: "background"
                },
                    ":hover > ul, :focus-within > ul ": {
                        visibility: "visible",
                        opacity: "1",
                        display: "block",
                    },
                }}
            >
                <a
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
                    ...activeLinkStyles
                }}
                aria-haspopup={link.items && link.items.length > 0 ? true : false}
            >
                    {props.title}
                </a>
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
                            },
                            ":focus-within": {
                                outline: "none"
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
