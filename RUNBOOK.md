# manage-recalls-ui Run Book

## Service or system overview

### Business overview

This provides users with a service for creating and managing recalls within HMPPS. (This is the UI for the companion application [manage-recalls-ui](https://github.com/ministryofjustice/manage-recalls-ui)).

### Technical overview

Internal application based on Express.js, using Typescript (compiled to javascript running on node.js) as the main language. Deployed in kubernetes (the HMPPS Cloud Platform) using the configuration found in [helm_deploy](helm_deploy).

### Service Level Agreements (SLAs)

Office hours (Mon-Fri, 09:00-17:00), best efforts.

### Service owner

The `ppud-replacement` team develops and runs this service.

Contact the [#ppud-replacement](https://mojdt.slack.com/archives/C020S8C0K9U) and [#ppud-replacement-devs](https://mojdt.slack.com/archives/C0223AGGQU8) channels on slack.

### Contributing applications, daemons, services, middleware

- Express.js application based on [hmpps-template-typescript](https://github.com/ministryofjustice/hmpps-template-typescript).
- AWS Elasticache (redis) for caching - configured via [cloud-platform-environments](https://github.com/ministryofjustice/cloud-platform-environments).

## System characteristics

### Hours of operation

Available 24/7.

### Infrastructure design

The application runs on the [HMPPS Cloud Platform](https://user-guide.cloud-platform.service.justice.gov.uk/) within the `manage-recalls-<tier>` namespaces (where `tier` is `dev`, `preprod` or `prod`).

**NOTE:** The service runs on the `live` cluster, not the deprecated `live-1` instance.

The main application runs as a deployment named `manage-recalls-ui`. The application is made avialable externally from the cluster via an Ingress.

See the `values-<tier>.yaml` files in the [helm_deploy](helm_deploy) directory for the current configuration of each tier.

### Security and access control

In order to gain access to the `manage-recalls-<tier>` namespaces in kubernetes you will need to be a member of the [ministryofjustice](https://github.com/orgs/ministryofjustice) github organisation and a member of the [ppud-replacement-devs](https://github.com/orgs/ministryofjustice/teams/ppud-replacement-devs) (github) team. Once joined, you should have access to the cluster within 24 hours.

You will need to follow the [Cloud Platform User Guide](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/getting-started/kubectl-config.html#how-to-use-kubectl-to-connect-to-the-cluster) to setup your access from there - use instructions for connecting to the `live` cluster.

### Throttling and partial shutdown

If there is an issue with the service where it is causing load on downstream services and it needs to be shutdown quickly the following command will reduce the number of pod replicas to zero:

```
kubectl -n manage-recalls-<tier> scale deployment manage-recalls-ui --replicas=0
```

We do not currently have a strategy in place to throttle requests.

### Environmental differences

Infrastructure wise, all three tiers are identical, but `prod` has the following differences:

- It will have more pod replicas of the main application deployment.
- As this is live data, you **must** be SC cleared if you need log into the cluster and interact with the application pods or data held within. You **do not** however need to be SC cleared to make changes to the application and deploy via the CI pipelines.

### Tools

See the [scripts](scripts) directory and the documentation held in [docs](docs) for more details.

## System configuration

### Configuration management

- Infrastructure is configured via [cloud-platform-environments](https://github.com/ministryofjustice/cloud-platform-environments).
- Application configuration is via [helm_deploy](helm_deploy).

### Secrets management

Secrets are stored within the `manage-recalls-<tier>` namespaces in kubernetes.

Secrets with information from [cloud-platform-environments](https://github.com/ministryofjustice/cloud-platform-environments) will be managed via the terraform code in there.

The contents of the `manage-recalls-ui` secret are detailed in [docs/env-vars.md](docs/env-vars.md).

## System backup and restore

This is handled by the HMPPS Cloud Platform Team, but details of how each component is considered is below.

### Kubernetes Resources

Nightly backups of cluster objects/resources are taken using a tool called [velero](https://velero.io/) - this will allow efficient recovery from backup should this need to be done.

### Database/Object Persistence

Redis (Elasticache) is used as a performance cache, there is no need for backups to be taken as the data held within is temporary and can be rebuilt automatically.

## Monitoring and alerting

### Log aggregation solution

Please see [Confluence](https://dsdmoj.atlassian.net/wiki/spaces/PUD/pages/3622830168/Monitoring+Operability#Logging) for more details.

### Log message format

Logs are output in structured JSON. This isn't very pretty in Elasticsearch/Kibana, but is processed correctly in Application Insights.

### Events and error messages

Please see [Confluence](https://dsdmoj.atlassian.net/wiki/spaces/PUD/pages/3622830168/Monitoring+Operability#Runtime-Error-Reporting) for more details.

### Metrics

Please see [Confluence](https://dsdmoj.atlassian.net/wiki/spaces/PUD/pages/3622830168/Monitoring+Operability#Metrics) for more details.

### Health checks

#### Health of dependencies

`/health` (i.e. <https://manage-recalls.hmpps.service.justice.gov.uk/health>) checks and reports the health of all services and components that the application depends upon. A HTTP 200 response code indicates that everything is healthy.

You can see the services that this application depends on within the [healthcheck file](server/healthChecks/healthCheck.ts#L58-L70).

#### Health of service

`/ping` (i.e. <https://manage-recalls.hmpps.service.justice.gov.uk/ping>) indicates that the application is started up and is ready to process work. A HTTP 200 response code indicates that the application is healthy.

## Operational tasks

### Deployment

We use CircleCI to manage deployments (see [.circleci/config.yml](.circleci/config.yml) for the full configuration):

- Built docker images are pushed to [quay.io](https://quay.io/repository/hmpps/manage-recalls-ui).
- Deployment to kubernetes uses helm.

### Troubleshooting

Please see [Confluence](<https://dsdmoj.atlassian.net/wiki/spaces/PUD/pages/3622830168/Monitoring+Operability#Direct-Log-Access-etc.-with-kubectl-(e.g.-Debugging-an-Application-That-Fails-to-Start)>) for some generic troubleshooting notes.

## Maintenance tasks

### Identified vulnerabilities

We scan the currently deployed docker containers daily with [trivy](https://github.com/aquasecurity/trivy). If any `HIGH` or `CRITICAL` vulnerabilities are identified the team is notified in the [#ppud-replacement-devs](https://mojdt.slack.com/archives/C0223AGGQU8) slack channel. **These issues should be fixed soon as possible.**
