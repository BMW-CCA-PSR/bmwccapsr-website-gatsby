#!/usr/bin/env node

const {runWriteApprovedLedger} = require('../core/writeApprovedLedger');

runWriteApprovedLedger().catch((error) => {
  console.error('\nApproved ledger write failed:', error.message || error);
  process.exitCode = 1;
});