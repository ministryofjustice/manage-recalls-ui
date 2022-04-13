# Running the app

The easiest way to run ui and api, against mock services, is to use

`./start-local-services.sh`

script in _manage-recall-e2e-tests_ project (https://github.com/ministryofjustice/manage-recalls-e2e-tests)

Either way check that this has succeeded e.g. via login locally (`http://localhost:3000/`)
with `PPUD_USER` / `password123456`.
This user has the `MANAGE_RECALLS` role that allows access to the service.

You can also check that the prometheus metrics are being served correctly on `http://localhost:3001/metrics`

## Re-starting the ui

In order to restart the ui after code changes, kill the ui by running

`npm run kill`

And rerun ui with

` npm run start:e2e`

## Debugging the Node.js app in Chrome Developer Tools

If you ran the app as above using `./start-local-services.sh`, then the Node.js app will automatically by running in debug mode.

1. open the app in Chrome browser
2. open devtools (CMD + Option + I)
3. click the green cube at top left of devtools, to open the Node.js debugger
4. click the "Sources" tab
5. CMD + O to open a source file eg 'server.js'
6. click in the left-hand gutter to place a breakpoint
7. in the browser, navigate to the correct page or perform an action to trigger the breakpoint (eg submit a form)
8. use the debugger tools to play, step over or step into

## Debugging in IntelliJ IDEA

IDEA supports debugging of the typescript source via attaching to a running node process
as long as e.g. the `--inspect` flag has been passed to node.
This is the case for both `npm run start:dev` or `npm run start:e2e` - as the latter
calls the former which includes it.

With the app started locally as above you can attach the debugger by starting an
`Attach to Node.js/Chrome` run configuration in debug mode. Breakpoints added in
e.g. `*.ts` files should then become active and operate once code to execute them
has been re-executed from the UI e.g. in Chrome.

When the debugger has attached the node process will log:

```
[Node] Debugger attached.
```
