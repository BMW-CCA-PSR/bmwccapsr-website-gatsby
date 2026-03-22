# bmwccapsr-website-gatsby

[![Netlify Status](https://api.netlify.com/api/v1/badges/6a750a7b-05e3-4448-be3d-c0a1add19325/deploy-status)](https://app.netlify.com/sites/bmw-club-psr/deploys)

## About

This repo is the source for the website of the BMW Car Club of America Puget Sound Region Chapter (BMWCCAPSR). The club has been around since 1969 and has helped connect BMW enthusiests from all over the Puget Sound area enjoy their vehicles to the fullest. We offer social events, tech sessions, track days, driving tours and many more benefits of membership. 

This repo tracks the project source for the club website including AWS CDK infrastrucuture code as well as gatsby and sanity config files. The web root of the gatsby project is `bmwccapsrwebsite`. 

## Tech stack used
* gatsbyJS
* ThemeUI
* Sanity CMS

## Setup
### Gatsby local dev
Run these from `web/`.

* `nvm install 20.19.1`
* `nvm use 20.19.1`
* `cd web && npm install`
* `cd web && npm run develop` # dev build

### production build
Run these from `web/`.

* `cd web && npm run build`
* `cd web && npm run start`

### Sanity Studio commands
* `npx sanity dev` # runs local dev server (ran in /studio)
* `npx sanity graphql deploy --dataset production --tag default` # deploys latest graphQl schemas to remote studio
* `npx sanity schema deploy`  # deploys latest schema documents to remote studio
* `npx sanity deploy` # deploys latest changes from studio to remote, hosted studio 

### Utility scripts
* WordPress migration tooling lives in `scripts/wpMigration/`; install and run commands from that directory.
* Zundfolge manifest tooling lives in `scripts/generateZundfolgeManifest/`; install and run commands from that directory.
