# Developing a new feature

## If the new feature will use a new endpoint on manage-recalls-api

1. Check (Swagger)[https://manage-recalls-api-dev.hmpps.service.justice.gov.uk/swagger-ui/index.html] - if the new endpoint is there, you can run `npm run swagger-to-ts` to output new typescript definitions to `./server/@types`.
2. Add new Wiremock fixtures for the request (if writing data) or response (if reading) to `./fake-manage-recalls-api/stubs/__files`. Note - rebuilding the fake-manage-recalls-api docker container afterwards won't be enough as it will be cached; you need to delete it then rebuild it.
3. Add a PACT for the new endpoint / action to `./pact` folder. See [./pact.md](./pact.md)
- add a new method to manageRecallsApiClient to address the new endpoint. The new method will be called from the PACT test.
4. Add a Cypress task to mock the new endpoint, for the integration tests
- In `./integration_tests/mockApis/manageRecallsApi.js`, add an interaction 
- expose the new task in `./integration_tests/plugins/index.js`

## Add a Cypress integration test
Note - use cy.* commands (which can be reused later for E2E tests).
Either extend an existing .spec or create a new one if it's a significant new feature.
Note - adding more tests leads to slower test runs. If you can easily combine your assertions into an existing test, do that.
1. Add / edit test in `./integration_tests/integration`
- Temporarily change the test description to `it.only` to run the new test on its own while developing it (only works when running a single spec, not all)
- if you added a Cypress task to mock a new endpoint, call the task at the start of the new test (if you added a new Wiremock fixture, above, you could return that)
- Find elements using labels rather than attributes, if possible. It speeds up test development, has the added benefit of testing accessibility in some cases (eg for input labels), and makes the tests more readable.
- While developing tests, `npm run int-test-ui` is better as you can see what's going on in the browser.
- If you make an application code change you'll need to restart it - `npm run kill` then `npm run start:feature`
- If you make a change to the Cypress tests or supporting test code, it will refresh automatically
- You can stop execution in the app using the [Node debugger](./running-app.md#debugging-in-chrome-developer-tools). To stop execution in the test code itself, open devtools in the cypress browser window, and add a `debugger` command to the test code, where you want it to break.
2. Don't forget to remove any `.only` before committing

## Feature implementation
Turn the integration test green by adding a route, and re-use existing handlers if possible (the two main ones are in `./server/controllers` - `recallPageGet` and `recallFormPost`).

### Form validation
- [Flow diagram](./user-input-validation.md)
- To render invalid / saved / unsaved values to form inputs, add to `getFormValues.ts`

### Change history (aka 'audit')
Add new fields to `./recallFieldList.ts`