# manage-recalls-ui
UI for managing recalls

## Running the app
The easiest way to run the app is to use docker compose to create the service and all dependencies. 

`docker-compose pull`

`docker-compose up`

### Dependencies
The app requires: 
* hmpps-auth - for authentication
* redis - session store and token caching

### Running the app for development

To start the main services excluding the manage recalls app: 

`docker-compose up`

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x`

And then, to build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Run tests

`npm run test`

### Running integration tests

For local running, start a test db, redis, and wiremock instance by:

`docker-compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with nodemon)

And then either, run tests in headless mode with:

`npm run int-test`
 
Or run tests with the cypress UI:

`npm run int-test-ui`


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
