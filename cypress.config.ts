import { defineConfig } from 'cypress';
import codeCoverage from '@cypress/code-coverage/task';
import instrumentComponentTestCode from '@cypress/code-coverage/use-babelrc';
import cypressSonarReporterMerge from 'cypress-sonarqube-reporter/mergeReports';
import { configureAllureAdapterPlugins } from '@mmisty/cypress-allure-adapter/plugins';
import { loadEnvDefaults } from './config/env';
import {
  testIntegrationPath,
  testComponentPath,
  reportsTestIntegrationPath,
  reportsTestComponentPath,
  cypressPath,
} from './config/path';
import createWebpackConfig from './config/webpack/webpack.test';

/**
 * ENV Variables
 *
 * 1. ⚠ Load .env.defaults but skip loading .env local file.
 *    This is INTENTIONAL to replicate a CI/CD environment with no .env file.
 * 2. Overwrite loaded variables if needed. Overwrite can be set before
 *    loadEnvDefaults method cause, remember, systemvars have higher precedence
 *    than .env or .env.defaults for dotenv.
 * 3. Resolved vars must be injected in:
 *   - Cypress.env object => via setupNodeEvents
 *   - Webpack configuration used by component testing => passed as argument
 */

// Overwrite area. Pre-set or force specific values.
process.env.API_RETRY_COUNT = '0'; // Let's not retry failed requests in a test environment.
process.env.APP_NEXT_FEATURES = 'true'; // Let's enable next features in tests.

// Load env. DO NOT LOAD local .env, only defaults.
const dotenvResolvedVars = loadEnvDefaults(false)?.resolved;

/**
 * Setup configuration
 */
type CypressFlavour = 'Integration' | 'Component';

export default defineConfig({
  // *** Common configuration ***
  watchForFileChanges: false,
  chromeWebSecurity: false,
  screenshotOnRunFailure: false, // Disable screenshots generation
  video: false, // Disable video generation
  fixturesFolder: `${cypressPath}/fixtures`,
  downloadsFolder: `${cypressPath}/downloads`,

  // *** Integration tests configuration ***
  e2e: {
    supportFile: `${cypressPath}/support/integration.ts`,
    specPattern: `${testIntegrationPath}/**/*.cy.{js,jsx,ts,tsx}`,
    excludeSpecPattern: `${testIntegrationPath}/examples/**/*.cy.{js,jsx,ts,tsx}`,
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      // File to be consumed by cypress-multi-reporter with configuration to run parallel reporters.
      configFile: `${cypressPath}/support/integration.reporters.js`,
      // The following settings are the options for cypress-sonarqube-reporter merge plugin that will
      // run on after:run event to merge all reports into one for sonar coverage.
      // https://github.com/BBE78/cypress-sonarqube-reporter?tab=readme-ov-file#merge-plugin-options
      outputDir: `${reportsTestIntegrationPath}/sonar/temp`,
      mergeOutputDir: `${reportsTestIntegrationPath}/sonar`,
      mergeFileName: 'test-results.xml',
    },
    screenshotsFolder: `${reportsTestIntegrationPath}/screenshots`,
    videosFolder: `${reportsTestIntegrationPath}/videos`,
    setupNodeEvents(on, config) {
      const flavour: CypressFlavour = 'Integration';

      setupCommonNodeEvents(on, config, flavour);

      // Dinamically resolve baseUrl based on the dev server port (env var).
      // Base URL refers to the domain of the frontend the tests will run against.
      // Unless overwritten by CLI configuration, lets take the dev server location
      // as the default value: localhost + dev server port.
      const devServerPort = config.env.DEV_SERVER_PORT || 8090;
      const candidateBaseUrl = 'http://localhost' + (devServerPort ? `:${devServerPort}` : '');
      config.baseUrl = config.baseUrl || candidateBaseUrl;

      // Log it for debug purposes
      console.log(`[${flavour} Config] [baseUrl]`, config.baseUrl);

      return config;
    },
  },

  // *** Component tests configuration ***
  component: {
    supportFile: `${cypressPath}/support/component.tsx`,
    indexHtmlFile: `${cypressPath}/support/component.index.html`,
    specPattern: [`${testComponentPath}/**/*.cy.{js,ts,jsx,tsx}`],
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: createWebpackConfig(process.env),
    },
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      // File to be consumed by cypress-multi-reporter with configuration to run parallel reporters.
      configFile: `${cypressPath}/support/component.reporters.js`,
      // The following settings are the options for cypress-sonarqube-reporter merge plugin that will
      // run on after:run event to merge all reports into one for sonar coverage.
      // https://github.com/BBE78/cypress-sonarqube-reporter?tab=readme-ov-file#merge-plugin-options
      outputDir: `${reportsTestComponentPath}/sonar/temp`,
      mergeOutputDir: `${reportsTestComponentPath}/sonar`,
      mergeFileName: 'test-results.xml',
    },
    screenshotsFolder: `${reportsTestComponentPath}/screenshots`,
    videosFolder: `${reportsTestComponentPath}/videos`,
    setupNodeEvents(on, config) {
      const flavour: CypressFlavour = 'Component';

      return setupCommonNodeEvents(on, config, flavour);
    },
  },
});

/**
 * Helpers
 */

// Helper to setup common node events for both flavours: integration & component testing.
const setupCommonNodeEvents = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  flavour: CypressFlavour
): Cypress.PluginConfigOptions => {
  // Spread loaded dotenv vars into Cypress-scoped env vars.
  const { ISSUE_BASE_URL, TMS_BASE_URL, ...restVars } = dotenvResolvedVars || {};
  config.env = {
    ...restVars,
    ...config.env,
    // Allure plugin settings that depends on env variables.
    issuePrefix: ISSUE_BASE_URL,
    tmsPrefix: TMS_BASE_URL,
    allureReuseAfterSpec: true,
    allureResults: `${
      flavour === 'Integration' ? reportsTestIntegrationPath : reportsTestComponentPath
    }/allure`,
  };

  // Log them for debug purposes
  logEnvironment(config.env, flavour);

  // Setup special tasks to be able:
  // - to log to stdout from specs/commands.
  on('task', {
    logTerminal: (...args) => (console.log(...args), null),
  });

  // Setup code coverage for component testing
  if (flavour === 'Component') {
    codeCoverage(on, config);
    // Used to instrument files included as component tests
    on('file:preprocessor', instrumentComponentTestCode);
  }

  // Setup the sonar report merging operation to create a single xml report.
  on('after:run', results => {
    // /!\ don't forget to return the Promise /!\
    return cypressSonarReporterMerge(results);
  });

  // Setup allure writer.
  configureAllureAdapterPlugins(on, config);

  return config;
};

// Helper to log environment variables to console.
const logEnvironment = (env: object, logTopic: string): void => {
  if (env && typeof env === 'object')
    Object.entries(env)?.forEach(([key, value]) => {
      // Obfuscate sensitive information when loggin
      if (key.match(/username|password/i)) value = value?.replace(/./g, '*');
      console.log(`[${logTopic} Config] [ENV]`, key, '=', value);
    });
};
