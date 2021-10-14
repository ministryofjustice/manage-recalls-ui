# Manage Recalls UI

[![CircleCI](https://circleci.com/gh/ministryofjustice/manage-recalls-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/manage-recalls-ui)

UI for managing recalls

## See Also
* pact/README.md
* helm_deploy/README.md

## Dependencies/Set-up
The app requires:
* hmpps-auth - for authentication
* redis - session store and token caching
* manage-recalls-api - api service for managing the recall process

For integration test these are run as docker containers so you need docker installed (try `docker --version`)
e.g. via a local Docker Desktop installation as per https://docs.docker.com/docker-for-mac/install/.

### node and npm
This project depends on `node` and `npm`.
It is highly recommended that you use `nvm` to manage their versions. 
`nvm` can be installed by commands such as:

```curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash;```  

Ideally check online for a latest version of the above command.

The required versions of `node` and `npm` are specified in `package.json` `engines` field.
Install/upgrade to the required versions with these commands in your checked out project directory:
```
nvm install <node-version>
npm i -g npm@6
```

You can check active versions with e.g. `nvm --version`, `node --version` and `npm --version`.

### node dependencies: run npm install

With nvm, node and npm installed as above *all* the remaining build dependencies should be installed by:
```
npm install
```

Unfortunately it is not that uncommon for node/npm to be confused about which dependencies are actually/correctly
installed.  
If you see the build failing and not finding any one/some of the myriad node dependencies then the first course of
action is to remove the local copies and start again.  This can be achieved by:
```
rm -rf node_modules
npm install
```

### Full local build
At this point the full build, `./build.sh`, should pass.  

The intention of this is 
a script (we use the same name across multiple repos) that builds and runs all tests so you have confidence 
you haven't broken anything before pushing.  Obviously `circleCI` does that for you as 
well versus any branch but this is for earlier/pre-push feedback.

So this checks all dependencies installed, builds everything, runs the unit tests, 
and integration tests including pact tests:

`./build.sh`

### Pre-commit hooks
After `npm install`, files will be created under both .git/hooks and .husky, that will automatically lint (and fix) any staged files in your commits, plus run a type check.

## Running the app
In easiest way to run ui and api is to use 

`./start-local-services.sh`

script in manage-recall-e2e project. 

Either way check that this has succeeded e.g. via login locally (`http://localhost:3000/`)
with `PPUD_USER` / `password123456`.  
This user has the `MANAGE_RECALLS` role that allows access to the service.

### Running the app for the development
For development run of the ui run 

` npm run start:e2e`

In order to restart the ui during development changes, kill the ui by running

`npm run kill`

And rerun ui with

` npm run start:e2e`

### Old way to run the app
The old way was to run the app using docker compose to create the service and all dependencies. 
This method is no longer the best due to limited functionality of fake api. Will keep it here till future changes.
It starts the latest published docker container for hmpps-auth and redis, a fake manage-recalls-api (wiremock) and a local build of the manage-recalls-ui. 

`docker compose up`

OR use the following script to run in the background and ensure the fake-mange-recalls-api is up to date and all services start correctly:

`scripts/start-local.sh`

#### Running the app for development

To start the main services and the manage recalls ui app in dev mode (you can attach to the Node.js debugger): 

```
scripts/start-dev-local.sh
npm run start:dev
```

If you need to update the wiremock (fake-manage-recalls-api) mappings you can use the `scripts/restart-fake-manage-recalls-api.sh` 
to stop and start the wiremock server.  Or you can use the `manual-stub.test.ts` test to prime the running wiremock server
with any additional expectation.

### Creating a new endpoint in manage-recalls-api
For every endpoint added to manage-recalls-api that is used by this app, a corresponding mock should be created in ./fake-manage-recalls-api. See the existing examples for the patterns to follow.
Note - rebuilding the fake-manage-recalls-api docker container afterwards won't be enough as it will be cached; you need to delete it then rebuild it.

### Typescript definitions generated from manage-recalls-api Swagger endpoint
This done by the NPM task `swagger-to-ts` which is run as part of `npm run build`.
Types are output to `./server/@types/manage-recalls-api`.

### Run linter

`npm run lint`

to fix any lint issues automatically:

`npm run lint:fix`

### Run unit tests

`npm run test`

with coverage:

`npm run test:coverage`

Coverage stats will be output to stdout and /coverage

### Run integration tests

The integration tests require redis, wiremock (fake-manage-recalls-api) and the service to be running.  To start them run:

`./scripts/start-for-integration-tests.sh`

The integration tests use [Cypress](https://docs.cypress.io/).

Then either, run tests in headless mode with:

`npm run int-test`
 
Or run tests with the cypress UI:

`npm run int-test-ui`

To get debug output when running cypress:

`DEBUG=cypress:* npm run int-test-ui`

For easy creation of IntelliJ run config for these Cypress tests 
(the `integration/*.spec.js` tests) try installing the Cypress support plugin: https://plugins.jetbrains.com/plugin/13819-cypress-support
That should yield a `Cy` cypress run option for all such tests).

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
Ask #ask-digital-studio-ops if you need access to Azure and get them to clone permissions from someone in the ppud-replacement-devs team.