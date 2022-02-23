
# Linting, Typescript definitions and tests

## Full local build
After setup, `./build.sh`, should pass.

The intention of this is
a script (we use the same name across multiple repos) that builds and runs all tests so you have confidence
you haven't broken anything before pushing.  Obviously `circleCI` does that for you as
well versus any branch but this is for earlier/pre-push feedback.

So this checks all dependencies installed, builds everything, runs the unit tests,
and integration tests including pact tests:

`./build.sh`

## Typescript definitions generated from manage-recalls-api Swagger endpoint
```
npm run swagger-to-ts
```

Types are output to `./server/@types/manage-recalls-api`.
The online swagger, for comparison, is [here]
(https://manage-recalls-api-dev.hmpps.service.justice.gov.uk/swagger-ui/index.html)

## Run linter

`npm run lint`

to fix any lint issues automatically:

`npm run lint:fix`

## Run unit tests

`npm run test`

with coverage:

`npm run test:coverage`

Coverage stats will be output to stdout and /coverage

## Run integration tests

The integration tests require redis, wiremock (fake-manage-recalls-api) and the service to be running.  To start them run:

`./scripts/start-for-integration-tests.sh`

The integration tests use [Cypress](https://docs.cypress.io/).

Then either, run tests in headless mode with:

`npm run int-test`

Or run tests with the cypress UI:

`npm run int-test-ui`

In case you change the application code while running Cypress, you will need to restart the app:

```
npm run kill
npm run start:feature
```

To get debug output when running cypress:

`DEBUG=cypress:* npm run int-test-ui`

For easy creation of IntelliJ run config for these Cypress tests
(the `integration/*.spec.js` tests) try installing the Cypress support plugin: https://plugins.jetbrains.com/plugin/13819-cypress-support
That should yield a `Cy` cypress run option for all such tests).
Notes: (i) the free version does not support debugging; (ii) if this test runner fails with similar
to the following error a restart of IDEA should fix this:
```
Could not load reporter by name: /var/folders/lq ... intellij-cypress-reporter ,,,
```

## Debugging the node app with running Cypress
[Running Chrome debugger](./running-app.md)

## Debugging the Cypress test code
1. open dev tools
2. do not click on the node symbol (green kube), instead go to Sources tab
3. `cmd + O` in order to open file search
4. put a break point on the needed line or type the word `debugger` in the cypress code and save if break points are unreliable 
5. rerun the test 

## Pre-commit hooks
After `npm install`, files will be created under both .git/hooks and .husky, that will automatically lint (and fix) any staged files in your commits, plus run a type check.

