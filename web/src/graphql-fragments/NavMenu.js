import { graphql } from "gatsby";

export const NavMenu = graphql`
fragment NavMenu on SanityNavigationMenu {
  items {
    ... on SanityNavigationItem {
      title
      navigationItemUrl {
        title
        _type
        items {
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