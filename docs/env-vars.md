# Environment variables used by the app

Environment variables for each env are specified in the files in https://github.com/ministryofjustice/manage-recalls-ui/tree/main/helm_deploy

Env vars in use include:

- API_CLIENT_ID - Created add added by the HMPPS tech team when they create the ClientId for your app
- API_CLIENT_SECRET - Created add added by the HMPPS tech team when they create the ClientId for your app
- APPINSIGHTS_INSTRUMENTATIONKEY - Can be found from the relevant Application Insights instance for your environment in azure.portal.com
- NSY_PNC_EMAIL - email address for the New Scotland Yard email account to send notification of return to custody
- OS_PLACES_API_KEY - API key for Ordnance Survey Places API
- SESSION_SECRET
- SYSTEM_CLIENT_ID - If required, created add added by the HMPPS tech team
- SYSTEM_CLIENT_SECRET - If required, created add added by the HMPPS tech team

## Adding a secret in Kubernetes

You will need to create a secret for your app in kubernetes. It should contain the following:

If you already have a context set, go to step 5.

1. [download a kubeconfig file](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/getting-started/kubectl-config.html#get-a-kubeconfig-file) with the 'live' env (not 'live-1')
2. move the file: ` mv ~/Downloads/kubecfg.yaml ~/.kube/config`
3. set context: `kubectl config set-context live.cloud-platform.service.justice.gov.uk --cluster live.cloud-platform.service.justice.gov.uk --user="< your github email >"`
4. `kubectl config get-contexts` - there should now be an \* next to the context
5. get the secret for the env you're interested in: `kubectl edit secret make-recall-decision-ui -n make-recall-decision-dev`
6. in the editor, add the new value as a stringData section:

```
stringData:
  OS_PLACES_API_KEY: <VALUE>
```

7. Re-run `kubectl edit secret make-recall-decision-ui -n make-recall-decision-dev` and confirm the new value is encoded and moved under the data section in the secret file
8. push changes and the secret will picked up on the next deployment

You can see the values in the secret using the Cloud Platform CLI ([setup guide](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/getting-started/cloud-platform-cli.html#the-cloud-platform-cli)):

```
cloud-platform decode-secret -n make-recall-decision-dev -s make-recall-decision-ui
```
