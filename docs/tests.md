
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
This done by the NPM task `swagger-to-ts` which is run as part of `npm run build`.
Types are output to `./server/@types/manage-recalls-api`.

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

To get debug output when running cypress:

`DEBUG=cypress:* npm run int-test-ui`

For easy creation of IntelliJ run config for these Cypress tests
(the `integration/*.spec.js` tests) try installing the Cypress support plugin: https://plugins.jetbrains.com/plugin/13819-cypress-support
That should yield a `Cy` cypress run option for all such tests).

## Pre-commit hooks
After `npm install`, files will be created under both .git/hooks and .husky, that will automatically lint (and fix) any staged files in your commits, plus run a type check.

