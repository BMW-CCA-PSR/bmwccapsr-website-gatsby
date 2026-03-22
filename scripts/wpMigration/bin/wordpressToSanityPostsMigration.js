#!/usr/bin/env node

const {runReview} = require('../core/reviewRunner');

runReview().catch((error) => {
	console.error('\nMigration scaffold failed:', error.message || error);
	process.exitCode = 1;
});
