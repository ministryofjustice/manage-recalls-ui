# Manage Recalls UI

[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=for-the-badge&logo=github&label=MoJ%20Compliant&query=%24.data%5B%3F%28%40.name%20%3D%3D%20%22manage-recalls-ui%22%29%5D.status&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fgithub_repositories)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/github_repositories#manage-recalls-ui 'Link to report')
[![CircleCI](https://circleci.com/gh/ministryofjustice/manage-recalls-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/manage-recalls-ui)

The user interface for "Manage a recall".

- [Accessing the app in dev / preprod / prod environments](https://dsdmoj.atlassian.net/wiki/spaces/PUD/pages/3842179263/Accessing+the+Manage+a+Recall+application)

## Development
- [Setup](./docs/setup.md)
- [Tests, linting and typescript checks](./docs/tests.md)
- [Running the app locally](./docs/running-app.md)
- [How user input validation works](./docs/user-input-validation.md)
- [Developing a new feature](./docs/developing-new-features.md)
- [PACT contract tests (against manage-recalls-api)](./docs/pact.md)

## Deployment / configuration
- [Helm deployments](./docs/helm-deploy.md)
- [Environment variables](./docs/env-vars.md)
- [Restarting the app in dev / preprod / prod](./docs/restarting-app.md)

## Application Support

- [Runbook](RUNBOOK.md)
