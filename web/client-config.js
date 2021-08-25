import {
  GATSBY_SANITY_PROJECT_ID,
  GATSBY_SANITY_DATASET
} from "../config"

module.exports = {
  sanity: {
    projectId: process.env.GATSBY_SANITY_PROJECT_ID || GATSBY_SANITY_PROJECT_ID,
    dataset: process.env.GATSBY_SANITY_DATASET || GATSBY_SANITY_DATASET
  }
};