/** @jsxImportSource theme-ui */
import { Link, useStaticQuery, graphql } from "gatsby"
import PropTypes from "prop-types"

interface HeaderProps {
    siteTitle?: string
  }

const Header = ({ siteTitle }: HeaderProps) => {

  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <div
      sx={{
        marginBottom: 4,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        sx={{
          margin: `0 auto`,
          maxWidth: 960,
          py: 4,
          px: 3,
        }}
      >
        <h1 sx={{ margin: 0 }}>
          <Link
            to="/"
            sx={{
              color: `text`,
              textDecoration: `none`,
            }}
          >
            {siteTitle === '' ? data.site.siteMetadata.title : siteTitle}
          </Link>
        </h1>
      </div>
    </div>
  )
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header