/** @jsxImportSource theme-ui */
import React from "react";
import Header from "./header";
import Footer from "./footer";

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scrolled: false,
    };
  }

  componentDidMount() {
    window.addEventListener("scroll", this.toggleBodyClass);
    this.toggleBodyClass();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.toggleBodyClass);
  }

  toggleBodyClass = () => {
    if (this.state.scrolled && window.scrollY <= 10) {
      this.setState({ scrolled: false });
    } else if (!this.state.scrolled && window.scrollY > 10) {
      this.setState({ scrolled: true });
    }
  };

  render() {
    const {
      children,
      onHideNav,
      onShowNav,
      showNav,
      siteTitle,
      navMenuItems,
    } = this.props;
    const { scrolled } = this.state;
    return (
      <>
        <Header
          navMenuItems={navMenuItems}
          siteTitle={siteTitle}
          onHideNav={onHideNav}
          onShowNav={onShowNav}
          showNav={showNav}
          scrolled={scrolled}
          sx={{
            position: "absolute"
          }}
        />
        <>{children}</>
        <Footer siteTitle={siteTitle} />
      </>
    );
  }
}

export default Layout;