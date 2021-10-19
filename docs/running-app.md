

# Running the app

The easiest way to run ui and api is to use

`./start-local-services.sh`

script in manage-recall-e2e-tests project (https://github.com/ministryofjustice/manage-recalls-e2e-tests)

Either way check that this has succeeded e.g. via login locally (`http://localhost:3000/`)
with `PPUD_USER` / `password123456`.  
This user has the `MANAGE_RECALLS` role that allows access to the service.

### Rerunning the ui
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