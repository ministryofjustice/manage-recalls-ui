# Restarting the app in dev / preprod / prod

Run:

```
kubectl rollout restart deployment manage-recalls-ui -n manage-recalls-{dev|preprod|prod}
```