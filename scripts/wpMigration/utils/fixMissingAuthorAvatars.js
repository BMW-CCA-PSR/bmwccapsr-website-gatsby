#!/usr/bin/env node

/**
 * Fix all authors without images by applying the default avatar
 * Run with: node scripts/wpMigration/utils/fixMissingAuthorAvatars.js
 * 
 * This script:
 * 1. Fetches all authors
 * 2. Identifies any without images
 * 3. Applies the default avatar to them
 * 4. Reports what was fixed
 */

const {
  createSanityWriteClient,
  createSanityReadClient,
  ensureAuthorHasImage,
} = require('../services/sanity');

async function fixMissingAuthorAvatars() {
  console.log('Fetching all authors...');
  
  const readClient = createSanityReadClient();
  const writeClient = createSanityWriteClient();
  
  try {
    const authors = await readClient.fetch('*[_type == "author"] { _id, name, image }');
    
    if (!Array.isArray(authors) || authors.length === 0) {
      console.log('No authors found.');
      return;
    }
    
    console.log(`Found ${authors.length} author(s).\n`);
    
    const authorsWithoutImage = authors.filter((author) => {
      const hasImage = author.image && author.image.asset && author.image.asset._ref;
      return !hasImage;
    });
    
    if (authorsWithoutImage.length === 0) {
      console.log('✓ All authors already have images.');
      return;
    }
    
    console.log(`Found ${authorsWithoutImage.length} author(s) without images:`, authorsWithoutImage.map((a) => a.name).join(', '));
    console.log('\nApplying default avatars...\n');
    
    let fixed = 0;
    let failed = 0;
    
    for (const author of authorsWithoutImage) {
      try {
        await ensureAuthorHasImage(writeClient, author._id);
        console.log(`✓ Fixed: ${author.name} (${author._id})`);
        fixed += 1;
      } catch (error) {
        console.error(`✗ Failed: ${author.name} (${author._id}): ${error.message}`);
        failed += 1;
      }
    }
    
    console.log(`\nDone! Fixed ${fixed} author(s)${failed > 0 ? `, ${failed} failed` : ''}.`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixMissingAuthorAvatars();
