import { graphql } from "gatsby";

export const NavMenu = graphql`
fragment NavMenu on SanityNavigationMenu {
  items {
    ... on SanityCta {
      title
      kind
      link
      route
      landingPageRoute {
        ... on SanityRoute {
          id
          _type
          slug {
            current
          }
        }
      }
    }
    ... on SanityNavigationItem {
      navigationItemUrl {
        items {
          ... on SanityCta {
            _key
            _type
            landingPageRoute {
              ... on SanityRoute {
                id
                _type
                slug {
                  current
                }
              }
            }
          }
        }
        internal {
          content
        }
        title
      }
      text
    }
  }
}
`;