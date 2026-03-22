#!/usr/bin/env node

const path = require('path');
const { startServer } = require('../ui/localReviewServer');
const {
	readFlag,
	hasFlag,
	extractToken,
	runAwsGetSecret,
	loadDotEnvFile,
	upsertDotEnvValue,
} = require('../utils/awsSecrets');

function ensureSanityToken(argv = process.argv.slice(2)) {
	const envPath = path.resolve(__dirname, '..', '.env');
	loadDotEnvFile(envPath);

	if (process.env.SANITY_API_TOKEN || process.env.GATSBY_SANITY_TOKEN) {
		return;
	}

	if (hasFlag(argv, '--skip-aws-secret')) {
		return;
	}

	const profile = readFlag(argv, '--profile', process.env.AWS_PROFILE || 'bmw-club');
	const secretId = readFlag(argv, '--secret-id', process.env.SANITY_SECRET_ID || 'SANITY_API_TOKEN');
	const region = readFlag(argv, '--region', process.env.AWS_REGION || '');

	console.log(`No local Sanity token found. Retrieving secret ${secretId} from AWS profile ${profile}...`);
	const secretResult = runAwsGetSecret({ profile, secretId, region });
	if (secretResult.status !== 0) {
		process.stderr.write(secretResult.stderr || 'Failed to retrieve secret from AWS Secrets Manager.\n');
		throw new Error('Unable to retrieve SANITY_API_TOKEN from AWS Secrets Manager.');
	}

	const token = extractToken(secretResult.stdout);
	if (!token) {
		throw new Error('Secret did not contain a usable SANITY_API_TOKEN value.');
	}

	upsertDotEnvValue(envPath, 'SANITY_API_TOKEN', token);
	process.env.SANITY_API_TOKEN = token;
	console.log(`Wrote SANITY_API_TOKEN to ${envPath} with restricted file permissions.`);
}

function main(argv = process.argv.slice(2)) {
	ensureSanityToken(argv);
	startServer(argv);
}

main();
