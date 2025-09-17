// scripts/generateZundfolgeManifest.js

const AWS = require("aws-sdk");
const fs = require("fs");
const path = require("path");

// Configure AWS SDK
const s3 = new AWS.S3({
  region: "us-west-2",
  credentials: new AWS.SharedIniFileCredentials({ profile: "bmw-club" }),
});

const BUCKET = "bmw-club-psr";
const PREFIX = "zundfolge/";
const OUTPUT_PATH = path.join(__dirname, "../web/static/zundfolge/manifest.json");

async function generateManifest() {
  const manifest = {};
  let ContinuationToken;

  do {
    const response = await s3.listObjectsV2({
      Bucket: BUCKET,
      Prefix: PREFIX,
      ContinuationToken,
    }).promise();

    for (const { Key } of response.Contents) {
      if (!Key.endsWith(".pdf")) continue;

      const parts = Key.split("/");
      if (parts.length !== 3) continue;

      const year = parts[1];
      const filename = path.basename(parts[2], ".pdf");

      if (!manifest[year]) manifest[year] = [];
      manifest[year].push(filename);
    }

    ContinuationToken = response.IsTruncated ? response.NextContinuationToken : null;
  } while (ContinuationToken);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));
  console.log(`✅ Manifest written to ${OUTPUT_PATH}`);
}

generateManifest().catch((err) => {
  console.error("❌ Failed to generate manifest:", err);
});