# Pact Contract Testing

We are using Pact for contract testing our services.  
[Pact Documentation](https://pact.io/)

[HMPPS Pact Broker](https://pact-broker-prod.apps.live-1.cloud-platform.service.justice.gov.uk/)

As a Consumer, the `manage-recalls-ui` defines contracts it expects its Providers 
(e.g. `manage-recalls-api`) to satisfy.
Those contracts are then published to the pact Broker and the Provider/s then use them  
to verify their behaviour is as the  `manage-recalls-ui` expects.

The pact tests are of the format `*.pact.test`.

For local development you can run all the pact tests and generate the pact file using:

```npm run pact-test```

The resulting generated pact contract representation files will be found 
in `pact/pacts`.  

## Verification in CI
The contract files are published to the broker in CI as part of the `unit-test` job. 

When the Pact Broker 
receives the published file/s it triggers a verification build in the relevant Provider, 
which will update the `manage-recalls-ui` build with the status of that pact verification.

## Verification/maintenance locally
Locally, if the Provider code is available, you can then use the contract files
to verify the Provider still works as expected.  See e.g. the README in `manage-recalls-api`
re. how to use these for a local Provider test.

More simply, you can push your changes to a branch 
and circleCI will trigger a build in the Provider to verify the same.  

## Running PACTs in IntelliJ

The pact tests in this project are run by `jest`.  They can be executed locally by Jest,
e.g. from an IDE run-config, given
only that the required specific config file is specified: `pact/jest.pact.config.js`.

## Deleting pacts

We have come across a situation where a pact in a consumer branch was awaiting the provider to verify it's pact file,   
but when the provider changes were pushed to main the pact on the consumer was not marked as verified.  We had to delete the 
pacts for that branch and re-trigger the circleCI build.  Not sure if this was a one off or is the correct way to handle this.
But details of how to delete a pact by tag can be found here:

https://docs.pact.io/pact_broker/administration/deleting_resources/