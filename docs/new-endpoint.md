
# Creating a new endpoint in manage-recalls-api
For every endpoint added to manage-recalls-api that is used by this app, a corresponding mock should be created in ./fake-manage-recalls-api. See the existing examples for the patterns to follow.
Note - rebuilding the fake-manage-recalls-api docker container afterwards won't be enough as it will be cached; you need to delete it then rebuild it.
