/** @jsxImportSource theme-ui */
import React from "react";

const Dropdown = props => {
    const link = props.navigationItemUrl
    return (
        <ul
            sx={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                color: "text",
            }}
        >
            <li
                sx={{
                    display: "block",
                    padding: "1rem",
                    height: "100%",
                    mx: 2,
                    position: "relative",
                    transitionDuration: "0.5s",
                    ":hover": {
                        backgroundColor: "primary",
                        borderRadius: "10px",
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
                    {link.title}
                </a>
                {link.items && link.items.length > 0 ? (
                    <ul
                        sx={{
                            listStyle: "none",
                            m: 0,
                            p: 0,
                            backgroundColor: "primary",
                            visibility: "hidden",
                            opacity: "0",
                            display: "none",
                            position: "absolute",
                            transition: "all 0.5s ease",
                            marginTop: "1rem",
                            borderRadius: "10px",
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
                                    borderRadius: "10px",
                                    padding: "1rem",
                                    ":hover": {
                                        backgroundColor: "highlight",
                                    },
                                    width: "100%"
                                }}
                                key={subLink.title}
                            >
                                <a
                                    sx={{
                                        color: "white",
                                        textDecoration: "none",
                                        display: "block"
                                    }}
                                    href={subLink.landingPageRoute ? subLink.landingPageRoute.slug.current : subLink.href}
                                >
                                    {subLink.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </li>
        </ul>
    )
}

export default Dropdown;