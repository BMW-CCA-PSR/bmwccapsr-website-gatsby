# WordPress Migration Tool

This directory contains the WordPress to Sanity migration tooling used to:

- fetch WordPress posts from the WP REST API
- review mapped Sanity drafts in a local approval UI
- import approved rows into Sanity
- apply helper fixes such as default author avatars

## Approval UI

The approval UI is the main workflow for the migration tool. It fetches a page of WordPress posts, maps them into draft Sanity documents, lets you review and edit the results, and imports approved rows directly.

![WordPress migration approval tool](../../public/migration-tool-ss.png)

## Commands

Run these from `scripts/wpMigration/`.

### Start the approval UI

```bash
npm run migrate:wp:approval-ui
```

This starts the local review server and opens the approval tool in your browser.

### Generate a review payload from the CLI

```bash
npm run migrate:wp:posts
```

### Generate a larger review sample file

```bash
npm run migrate:wp:posts:review
```

### Import approved rows from the ledger

```bash
npm run migrate:wp:write:approved
```

### Import approved rows using AWS Secrets Manager for the Sanity token

```bash
npm run migrate:wp:write:approved:secure
```

## Directory Layout

- `bin/`: executable entrypoints used by `package.json` scripts
- `core/`: mapping, review generation, and approved-ledger write logic
- `services/`: WordPress and Sanity integration code
- `ui/`: local review server and browser approval UI
- `utils/`: CLI parsing, file helpers, AWS secret helpers, avatar utilities

## Current Behavior

### Images

- Featured article images are required. If a featured image cannot be hydrated into a valid Sanity asset, the import fails.
- Inline body images are best-effort. If an inline image cannot be downloaded and uploaded, that Portable Text image block is removed so the frontend does not receive a broken image object.

### Authors

- Missing referenced authors can be created automatically during import.
- Default author avatars are supported through the author helper utilities and import pipeline.

## Notes

- The active command entrypoints are the files under `bin/`.
- The local review UI uses the code in `ui/localReviewServer.js` and `ui/wpMigrationApprovalTool.html`.
- The CLI review flow uses `core/reviewRunner.js` and `core/reviewMapper.js`.

## Related Docs

- [Default author avatar guide](./DEFAULT_AVATAR_GUIDE.md)
- Root repo overview: [../../README.md](../../README.md)