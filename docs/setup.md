

# Setup

## Dependencies/Set-up
The app requires:
* hmpps-auth - for authentication
* redis - session store and token caching
* manage-recalls-api - api service for managing the recall process

For integration test these are run as docker containers so you need docker installed (try `docker --version`)
e.g. via a local Docker Desktop installation as per https://docs.docker.com/docker-for-mac/install/.

### node and npm
This project depends on `node` and `npm`.
It is highly recommended that you use `nvm` to manage their versions.
`nvm` can be installed by commands such as:

```curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash;```

Ideally check online for a latest version of the above command.

The required versions of `node` and `npm` are specified in `package.json` `engines` field.
Install/upgrade to the required versions with these commands in your checked out project directory:
```
nvm install <node-version>
npm i -g npm@6
```

You can check active versions with e.g. `nvm --version`, `node --version` and `npm --version`.

### node dependencies: run npm install

With nvm, node and npm installed as above *all* the remaining build dependencies should be installed by:
```
npm install
```

Unfortunately it is not that uncommon for node/npm to be confused about which dependencies are actually/correctly
installed.  
If you see the build failing and not finding any one/some of the myriad node dependencies then the first course of
action is to remove the local copies and start again.  This can be achieved by:
```
rm -rf node_modules
npm install
```

### optional, if doing postcode lookups (for 'not in custody' recalls)

Create a .env file in the root folder:
```
OS_PLACES_API_KEY=<API KEY>
```

You can get the API key value using the Cloud Platform CLI ([setup guide](https://user-guide.cloud-platform.service.justice.gov.uk/documentation/getting-started/cloud-platform-cli.html#the-cloud-platform-cli)):
```
cloud-platform decode-secret -n manage-recalls-dev -s manage-recalls-ui
```

Copy the encoded value for that key. 