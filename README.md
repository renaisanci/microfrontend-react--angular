# navify Cosmos - Frontend

## Description

This is the frontend web application for Cosmos, a **navify** application aimed to support Roche personas with its installation, maintenance and real time monitoring tasks for navify integrators.

## Getting Started

### Prerequisites

To be able to use the application, you must ensure to meet the following prerequisites on your machine:

- [**Nodejs**](https://nodejs.org/en/) version 16 is the minimum required to run the application.
- [**Git**](https://git-scm.com/) to retrieve commit and versioning source code.
- Follow Roche's [**guidelines**](https://roche-ui-standardization.pages.roche.com/react-guidelines/) for React applications.
- Follow Roche's [**One Design guidelines and rules**](https://onedesign.roche.com/) for a unified UI across Roche applications.
- Follow Roche's [**Jest/testing guidelines and rules**](https://navify.atlassian.net/wiki/spaces/LIX/pages/2737635912/Jest) to test components.
- Any usable IDE, [**VSCode**](https://code.visualstudio.com/) is recommended.

If you use VSCode, the following extensions are highly recommended to sync settings and watch for code quality:

- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) to sync basic editor settings across developers.
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) to lint code to enforce quality rules.
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) for harmozied and unopinionated formatting of the code.

### NPM registry setup and permissions

This project depends on some Roche internal packages grouped in `@one/*`, belonging to Roche [OneDesign group](https://code.roche.com/onedesign), and the registry to store them is temporarily located [here](https://code.roche.com/groups/one/-/packages).

Please note that in order to be able to install these packages it is required to request permisions from any of the owners from `@one/*`. All members are located [here](https://code.roche.com/groups/onedesign/-/group_members).

Make sure you have at least reporter role for the following `@one/*` packages:

- @one/design-tokens
- @one/icons
- @one/react
- @one/web-components

We have also to setup NPM to find `@one` packages for proper dependency resolution. Follow these steps:

- Create or use an existing [personal access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) with at least `api` permissions.
- Setup NPM configuration. You can do this at `global`, `user` or `project` level, it's up to you. Just use the following flag in the commands listed below, or skip this flag for `global` level:

  ```shell
  <command> -L <user|project>
  ```

  > If you are actively developing more Roche frontend applications is recommended to set NPM globally.

  - Set registry URL for `@one` packages:

    ```shell
    npm config set @one:registry=https://code.roche.com/api/v4/packages/npm/
    ```

  - Authenticate the registry access/requests with the generated token like this:

    ```shell
    npm config set -- //code.roche.com/api/v4/packages/npm/:_authToken=<insert_token_here>
    ```

Please, check your `.npmrc` configuration file to confirm is properly set:

```ini
@one:registry=https://code.roche.com/api/v4/packages/npm/
//code.roche.com/api/v4/packages/npm/:_authToken=••••••••••••••
```

> **Notes**:
>
> - If you set it up at `global` level, this `.npmrc` file is located at user folder by default.
> - If you set it up at `project` level, `.npmrc` file is not meant to be committed. Each developer will have their own `.npmrc` file.

## Monorepo

This project follows a monorepo architecture so that it contains:

- `app` or `frontend` project wich is the **main project** and is located at top level.
- The following auxiliary subprojects:
  - `mock-server` project, located at `mock-server` folder, which runs a light server that mimicks backend for local development.
  - `cypress` project, located at `cypress` folder, which contains a component/e2e test suite.

Most of what you need is centralized in main's project `package.json` scripts.

## Environment

We have a collection of environment variables that are important to be set for the project to work properly. Luckily, they are already set with default values so you can start straightaway and everything should be fine. However, it is important that you read this chapter to better know how they work. Before we list the available variables, let's clarify some important concepts.

#### Single source of truth

`dotenv` (via `webpack`) is used to load and manage environment variables from a _separated-from-code_ file and inject them into the code where needed. We have then a single source of truth for our environment. Please, **DO NOT hardcode/spread environment variables all over the code**, let's keep them organized in a single storage file. In fact, we have 2 files for that purpose:

- `.env.defaults` file to store the default values of our environment variables. It contains all the available environment variables already set to cover the default scenario, which will allow you to develop locally or deploy to production. You shouldn't modify these values unless there is a good reason.
- `.env` file, on the other hand, is ignored by `git` and won't be committed by default. As a developer, this local file is intended for you to overwrite default values, test with different values or even add sensitive info like credentials (if needed). Just copy/paste the variables to be modified from `.env.defaults` and set them as you desire. Please, check Apendix at the end of this readme file for a suggested `.env` file to start developing with.

You shouldn't need anything else. You shouldn't commit `.env` to version control. And also, we **strongly** recommend against having multiple `.env` files like `.env.test`, `.env.prod` as it is considered a [bad practice](https://github.com/motdotla/dotenv#should-i-have-multiple-env-files).

#### Build-time injection

The implemented strategy is to inject env values at build-time, with the help of `webpack` and `dontenv`. Thus, everytime you run the application or perform a build, the env variables in code will be replaced/hardcoded with its real value. This process is also in place to feed the different test frameworks (`jest`, `cypress`) with the right env values.

For CI/CD, this means that once the production build is completed, environment values for the frontend are already injected in the code. In case we detect the need of injecting env values after the build is completed for any CI/CD job, there is a relatively easy implementation that can be done based on `code splitting` and `envsubst` command.

#### Agnostic frontend

Another important decicison taken around the environment variables is tyring to keep the frontend as agnostic as possible about the environment where is going to be deployed. To do this, we should **avoid** setting thinks like the **application domain** or the **API service domain** through environment variables. Instead, let the frontend assume the domain from the current origin. So, if its deployed in `http://domainA.com` all the requests will be run against that domain by default. There is no need to explicitely set it up.

For local development, we have a proxy in place (via `webpack dev server`) to redirect all the requests to the mock server.

### Variables for production

#### API Configuration

| Variable        | Default value       | Description                                                                       |
| --------------- | ------------------- | --------------------------------------------------------------------------------- |
| API_BASE_URL    | _see .env.defaults_ | API Base URL, either partial or fully qualified, to run requests against to \*\*¹ |
| API_RETRY_COUNT | _see .env.defaults_ | Number of retries for failed queries retry policy\*\*²                            |

> \*\*¹ **Note**: Although we said to keep frontend agnostic, we have this API base URL variable in the event that we eventually need to setup a completely different domain for the backend. This is unlikely to happen, though. However, another use case is to setup a partial URL to prefix every backend request. For example, we can have `API_BASE_URL=/mock-api` in our local `.env` file to emphasize that we are using a local mock server.

> \*\*² **Note**: Retry policy for failed queries follows `axios` "retryability" logic, which tags as retryable those
> queries with failed request or failed response in the range of 500 status codes.

#### AUTH Configuration

| Variable                              | Description            | Default value       |
| ------------------------------------- | ---------------------- | ------------------- |
| AUTH_PROVIDER_USER_POOL_ID            | AWS user pool id       | _see .env.defaults_ |
| AUTH_PROVIDER_USER_POOL_WEB_CLIENT_ID | AWS web client id      | _see .env.defaults_ |
| AUTH_PROVIDER_DOMAIN                  | AWS cognito domain URL | _see .env.defaults_ |

#### APP Configuration and Flags

| Variable          | Description                                                                                                                | Default value       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| APP_NEXT_FEATURES | Unlock release candidate features under implementation or not-yet-stable                                                   | _see .env.defaults_ |
| APP_DEV_FEATURES  | Unlock features intended for development only                                                                              | _see .env.defaults_ |
| APP_ENV_NAME      | Show a label in our UI top bar indicating an environment name of your choice, leave it empty to disable this functionality | _see .env.defaults_ |

#### navify Anywhere Console Configuration

| Variable            | Description                                | Default value       |
| ------------------- | ------------------------------------------ | ------------------- |
| NA_CONSOLE_BASE_URL | URL to access Console clusters from Cosmos | _see .env.defaults_ |

### Variables for local development only

| Variable                        | Default value                        | Description                                                                                           |
| ------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| DEV_SERVER_PORT                 | 8090                                 | Port where the application will run in for local development                                          |
| MOCK_SERVER_PORT                | 8091                                 | Port where the mock server will run in for local development                                          |
| MOCK_SERVER_SIMULATED_DELAY_MIN | _not set_                            | Simulate network load in mock server. Please, refer to mock server `README.md` file for further info. |
| MOCK_SERVER_SIMULATED_DELAY_MAX | _not set_                            | Simulate network load in mock server. Please, refer to mock server `README.md` file for further info. |
| NA_CONSOLE_SERVER_PORT          | 8092                                 | Port where the mocked navify Anywhere Console application will run in for testing interactions        |
| NA_CONSOLE_COSMOS_REDIRECT_PATH | _see .env.defaults_                  | Path to be used in Cosmos redirections from the mocked navify Anywhere Console application            |
| ISSUE_BASE_URL                  | https://navify.atlassian.net/browse/ | URL prefix for ISSUES in Allure reports                                                               |
| TMS_BASE_URL                    | _not set_                            | URL prefix for TMS in Allure reports                                                                  |

The following **development only** variables are intended to help us accelerate the login process during local development:

| Variable                    | Default value | Description                                                                                                                                |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| AUTH_BYPASS_FOR_DEVELOPMENT | _not set_     | Set it to `true` to bypass the login with a predefined mock user for development only. **Overwrite it only in your `.env` file if needed** |

## Development Lifecycle

### Install

- `npm run install:all` to install dependencies for the main projects and the rest of subprojects. Run this script the first time you checkout the repository for a clean install.
- `npm i` or `npm install` to install dependencies only for the main project.

  > **Note**: Opt-in for a `npm ci` if you want a fresh install strictly following dependency versions listed in `package-lock.json` file.

### Run

- `npm start` which is a shortcut for `npm run start:dev`

The app will run by default at http://localhost:8090.

The authentication is automatically bypassed for a better development experience. If you want to test or simulate the authentication flow, you can set a test user credentials in your environment for that purpose (see [environment section](#variables-for-local-development-only)).

> **Note**: starting the frontend application will also trigger the mock server for a better development experience.

### Test

Use the test scripts to pass the test suite, either locally when needed or in the CI/CD environment:

- Unit tests: `npm run test:unit` Output reports can be found at `reports/test-unit`.
- Contract tests: `npm run test:contract`. Output contracts can be found at `reports/test-contract`.
- Component tests: `npm run test:component:open` to open Cypress component test suite or `npm run test:component` to execute it without UI. Reports should be found at `reports/test-component`.
- Integration tests:
  - `npm run test:integration:open` to open Cypress integration test suite. By default, this suite will run against local dev server.
  - `npm run test:integration:local-dev`. Run e2e tests against the application run locally through the `dev server`.
  - `npm run test:integration:local-prod`. Run e2e tests against a production build of the application (located at `build/prod`). You need to manually run the build script before executing the tests.
    In all cases, reports should be found at `reports/test-integration`.

> For more info about the testing strategy in frontend, please refer to the [LNI documentation](https://code.roche.com/lni/modules/docs).

### Build

These scripts are mainly intended for CI/CD:

- `npm run build` or `npm run build:prod` generation of the **production-ready** artifact. Output can be found in `/build/prod` folder.
- `npm run build:dev` generation of a **development** artifact aimed for runtime debugging (probably this is never needed). Output can be found in `/build/dev` folder.

Do you want to generate a bundling report? Use the special version of the previous scripts with `:report` suffix like this:

- `npm run build:prod:report`.
- `npm run build:dev:report`.

Bundle reports will automatically open in your browser. You can locate them in `reports/build/prod` or `report/build/dev` folders.

### Commit and Pushes: git hooks

Git hooks are setup to trigger specific tasks whenever you `commit` and/or `push` code to the repository to make sure quality criterias are met for the new code:

- On `commit` phase, staged files or unstagged-but-changed files are properly formatted and linted. This step might fail if your code does not fulfill linter rules.

  > **Note**: If you want to modify or fine tune this hook, please remember to not add any heavy task here and optimize execution as much as possible (only checking staged files for example). Commits happen frequently and we do not want to slow down development experience. Leave those tasks for the push phase.

- On `push` phase, the whole project (including auxiliary subprojects) is statically analysed for types consistency (`typecheck`) and also unit tests are run.

### Optional useful scripts

You can run the following scripts at any time you need.

- Type checking:

  - `npm run typecheck`. Runs a static type check on the application files (excluding auxiliary subprojects like `mock-server` and `test`).
  - `npm run typecheck:watch`. Same as previous script but in watching mode: it restarts on any change detected in those files. This is automatically invoked when you start the project.
  - `npm run typecheck:all`. Runs a static type check on the main project and subprojects.

- Code linting:

  - `npm run lint`.
  - `npm run lint:summary` for a summarized version.
  - `npm run lint:fix` to fix errors (in-place) that can be fixed by the linter.

- Utilities:

  - Use `check:circulardeps` to check the existence of circular dependencies, if any. Althought not harmfull in javascript, circular deps might cause minor issues so they should be minimized as much as possible. Also, the existence of many cyclic dependencies might indicate that your code is not following a consistent tree-like dependency scheme, which is not a good practice in general terms.

    **Note**: Keep code strictly organized following the project folder hierarchy. Consider these folders like top-down layers, code in top layers shouldn't be importing code in down layers. For more info about frontend architecture, please refer to the [LNI documentation](https://code.roche.com/lni/modules/docs).

## Deployed DEV and QA environments

Application runs on DEV and QA environments and can be accessed (VPN or authentication via SSO is required) using next URLs and credentials:

| URL                                               | Environment | Username         | Password    |
| ------------------------------------------------- | ----------- | ---------------- | ----------- |
| https://cosmos.ca.dev.kfl.ni-non-prod.navify.com/ | DEV         | cosmos-test-user | 41+#to>I\*J |
| https://cosmos.ca.qa.ni-non-prod.navify.com/      | QA          | cosmos-test-user | v1N!b>lUe^  |

## CI/CD Stages

The following Gitlab Pipeline stages and jobs are currently configured:

| Stage Name        | Jobs                                | When    | Description                          |
| ----------------- | ----------------------------------- | ------- | ------------------------------------ |
| Install           | Install                             | Always  | Install npm packages                 |
| Validate          | Lint, Typecheck                     | Always  | Run linter and typecheck             |
| Build             | Build                               | Always  | Build PROD files                     |
| Quality           | SonarQube                           | Always  | Run SonarQube and publish report     |
| Deploy            | Publish to DEV, Publish to QA       | Main MR | Deploy static files to AWS S3 bucket |
| Publish evidences | Publish Allure Report, Publish Xray | Always  | Publish reports for Allure and Xray  |

## Authentication

AWS Cognito is currently used for authentication.

The Cognito instance can be found on the DEV environment (`ni-dev-kung-fu-lambdas`) and for now the `Hosted UI` authentication flow is used for login. For this the project is using `aws-amplify` as implementation tool.

### Test User

Username: `test-user`

Password: `A/d4ed6ca0ed91cd268efb0f493e0ca5cb`

This user is managed by the core-app team in the `cosmos-CognitoUserPool` user pool.

Other Cognito configuration details can be found in the `.env.defaults` file.

## Appendix

### Suggested `.env` file for development

```ini
# CUSTOM Environment Defaults

# PRODUCTION VARIABLES
# ********************************************

# API Configuration
API_BASE_URL = /mock-api
API_RETRY_COUNT = 1

# APP settings and flags
APP_NEXT_FEATURES = true
APP_DEV_FEATURES = true
APP_ENV_NAME = Local DEV

# NA CONSOLE Configuration
# Add final / to the route
NA_CONSOLE_BASE_URL = /mock/na-console/clusters/create/

# LOCAL DEVELOPMENT VARIABLES
# ********************************************
DEV_SERVER_PORT = 8090
MOCK_SERVER_PORT = 8091
MOCK_SERVER_SIMULATED_DELAY_MIN = 100
MOCK_SERVER_SIMULATED_DELAY_MAX = 400

AUTH_BYPASS_FOR_DEVELOPMENT = true
```
