# Pact Contract Testing

We are using Pact for contract testing our services.  
[Pact Documentation](https://pact.io/)

[HMPPS Pact Broker](https://pact-broker-prod.apps.live-1.cloud-platform.service.justice.gov.uk/)

The `manage-recalls-ui` defines contracts it expects it's Providers to satisfy, the contract is then published to the pact Broker and the Provider then uses it to verify it behaves as the consumer expects.

The pact tests are of the format `*.pact.test`.

The generated pact files can be found in `pact/pacts`, these are published to the broker in CI as part of the `unit-test` job.  When the Pact Broker receives the published file it triggers a verification build in the relevant Provider, which will update the `manage-recalls-ui` build with the status of that pact verification.

For local development you can run all the pact tests and generate the pact file using.

```npm run pact-test```

If the provider code is available, you can then use this file to locally verify the provider still works as expected.  Or you can push your changes to a branch and  circleCI will trigger a build in the provider to verify the pact file.  