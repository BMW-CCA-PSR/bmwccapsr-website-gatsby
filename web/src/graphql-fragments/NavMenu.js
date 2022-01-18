import { graphql } from "gatsby";

export const NavMenu = graphql`
fragment NavMenu on SanityNavigationMenu {
  items {
    ... on SanityCta {
      title
      kind
      link
      route
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
    ... on SanityNavigationItem {
      title
      navigationItemUrl {
        title
        _type
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
          ... on SanityLink {
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
            route
            title
            href
          }
        }
      }
    }
    ... on SanityLink {
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
      route
      title
      href
    }
  }
}
`;