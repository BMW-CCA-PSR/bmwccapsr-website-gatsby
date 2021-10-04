/** @jsxImportSource theme-ui */
import NavLink from "./navLink";
import React from "react";
import CTALink from "./CTALink";

const Dropdown = props => {
    const link = props.navigationItemUrl
    return (
        <ul
            sx={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                color: "darkgray",
            }}
        >
            <li
                sx={{
                    textTransform: "uppercase",
                    display: "block",
                    height: "100%",
                    py: "22px",
                    px: "8px",
                    position: "relative",
                    ":hover": {
                        backgroundColor: "primary",
                        cursor: "pointer",
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
                        cursor: "pointer",
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
                            m: "-25px",
                            p: 0,
                            backgroundColor: "secondary",
                            visibility: "hidden",
                            opacity: "0",
                            display: "none",
                            position: "absolute",
                            width: "250px",
                            marginTop: "23px",
                            borderBottomRightRadius: "6px",
                            borderBottomLeftRadius: "6px",
                            cursor: "pointer",
                            left: "0",
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
                                    padding: "1rem",
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