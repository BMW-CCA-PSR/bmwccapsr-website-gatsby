const path = require('path');

const DEFAULT_WP_API_BASE =
  process.env.WP_API_BASE ||
  'http://ec2-16-148-107-247.us-west-2.compute.amazonaws.com/wp-json/wp/v2';

const DEFAULT_PAGE = Number(process.env.WP_PAGE || 1);
const DEFAULT_PER_PAGE = Number(process.env.WP_PER_PAGE || 5);
const DEFAULT_PREVIEW_LIMIT = Number(process.env.WP_PREVIEW_LIMIT || 5);
const DEFAULT_INSECURE = process.env.WP_INSECURE === '1';
const DEFAULT_OUTPUT_FILE = process.env.WP_OUTPUT_FILE || '';
const DEFAULT_TIMEOUT_MS = Number(process.env.WP_TIMEOUT_MS || 45000);
const DEFAULT_EMBED = false;
const SCRIPTS_DIR = path.resolve(__dirname, '..', '..');
const DEFAULT_REVIEW_FILE = path.resolve(SCRIPTS_DIR, 'wp-posts-review.json');
const DEFAULT_LEDGER_FILE = path.resolve(SCRIPTS_DIR, 'wp-sanity-migration-ledger.json');
const DEFAULT_LEDGER_RESULT_FILE = path.resolve(
  SCRIPTS_DIR,
  'wp-sanity-migration-ledger.result.json'
);

const WP_TYPE_TO_SANITY_SCHEMA_TYPE = {
  categories: 'category',
  posts: 'post',
  pages: 'page',
  tags: 'tag',
  users: 'author',
};

function getSanityConfig() {
  return {
    projectId:
      process.env.SANITY_PROJECT_ID || process.env.GATSBY_SANITY_PROJECT_ID || 'clgsgxc0',
    dataset:
      process.env.SANITY_DATASET || process.env.GATSBY_SANITY_DATASET || 'production',
    token: process.env.SANITY_API_TOKEN || process.env.GATSBY_SANITY_TOKEN || '',
    apiVersion: process.env.SANITY_API_VERSION || '2025-01-01',
    useCdn: false,
  };
}

module.exports = {
  DEFAULT_WP_API_BASE,
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  DEFAULT_PREVIEW_LIMIT,
  DEFAULT_INSECURE,
  DEFAULT_OUTPUT_FILE,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_EMBED,
  DEFAULT_REVIEW_FILE,
  DEFAULT_LEDGER_FILE,
  DEFAULT_LEDGER_RESULT_FILE,
  WP_TYPE_TO_SANITY_SCHEMA_TYPE,
  getSanityConfig,
};