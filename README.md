# Manage Recalls UI

[![CircleCI](https://circleci.com/gh/ministryofjustice/manage-recalls-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/manage-recalls-ui)

UI for managing recalls

### Dependencies
The app requires:
* hmpps-auth - for authentication
* redis - session store and token caching
* manage-recalls-api - api service for managing the recall process

## Running the app
The easiest way to run the app is to use docker compose to create the service and all dependencies. This starts the latest published docker container for hmpps-auth and redis, a fake manage-recalls-api (wiremock) and a local build of the manage-recalls-ui. 

`docker compose up`

You can login locally with `PPUD_USER` / `password123456`, this user has the `MANAGE_RECALLS` role that allows access to the service.

### Full local build
Checks Cypress installed, builds everything, runs the unit tests, and integration tests

`./build.sh`

### Running the app for development

To start the main services excluding the manage recalls app: 

`docker compose up redis hmpps-auth fake-manage-recalls-api`

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x`

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Run tests

`npm run test`

### Running integration tests

The integration tests require redis, wiremock and the service to be running.  To start them in docker run:

`./scripts/start-local.sh`

This is equivalent to:

```
docker compose up -f docker-compose-test.yml
npm run start-feature
```

The integration tests use [Cypress](https://docs.cypress.io/) you will need to manually install the Cypress 
`npm install cypress --save-dev`

Then either, run tests in headless mode with:

`npm run int-test`
 
Or run tests with the cypress UI:

`npm run int-test-ui`

To get debug output when running cypress:

`DEBUG=cypress:* npm run int-test-ui`

### Dependency Checks

The project has implemented some scheduled checks to ensure that key dependencies are kept up to date.
These can be removed by removing references to `check_outdated` job from `.circleci/config.yml`

## Application Insights

All HMPPS services should send data to Application insights.  Currently, this is the following instances:
- nomisapi-t3 for Dev
- nomisapi-t2 for Staging
- nomisapi-preprod for Preprod
- nomisapi-prod for Prod

The APPINSIGHTS_INSTRUMENTATIONKEY for each environment can be retrieved from the specific Application Insights instance in azure.portal.com.
Ask #ask-digital-studio-ops if you need access to Azure and get them to clone permissions from someone in the ppud-replacement-devs team
