# Zundfolge Manifest Generator

This directory contains the script that builds the Zundfolge PDF manifest used by the website.

## What It Does

The generator connects to the `bmw-club-psr` S3 bucket, scans objects under the `zundfolge/` prefix, finds PDF files, groups them by year, and writes the result to:

`web/static/zundfolge/manifest.json`

The generated manifest has this shape:

```json
{
  "2024": ["issue-1", "issue-2"],
  "2023": ["issue-1", "issue-2"]
}
```

Each value is the PDF filename without the `.pdf` extension.

## Expected S3 Layout

The script expects keys shaped like:

```text
zundfolge/<year>/<filename>.pdf
```

Examples:

```text
zundfolge/2024/january.pdf
zundfolge/2024/february.pdf
```

Keys that do not match that three-part structure are ignored.

## AWS Requirements

The script uses the AWS SDK with the shared credentials profile:

`bmw-club`

It also assumes region:

`us-west-2`

Before running it, make sure that profile exists locally and has permission to list objects in the target bucket.

## Run

From `scripts/generateZundfolgeManifest/`:

```bash
npm install
npm run generate
```

You can also run the file directly:

```bash
node generateZundfolgeManifest.js
```

## Output

On success, the script writes or overwrites:

`web/static/zundfolge/manifest.json`

and logs the output path.

## Notes

- Only `.pdf` files are included.
- The script handles paginated S3 listings via `ContinuationToken`.
- The output directory is created automatically if it does not already exist.