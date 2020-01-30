// @ts-check
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

// @ts-ignore
process.on('infrastructure_error', (error) => {
    console.error('infrastructure_error', error);
});

function karmaConfig(config) {
    return {
        basePath: '../',
        files: [
            './test/unit-tests/karma/**/*.ts',
            './test/mocks/**/*.ts',
            './src/**/*.ts',
            // Serve dist folder so files can be loaded when needed in tests
            { pattern: './dist/**/*.+(js|map)', included: false, watch: false }
        ],
        exclude: ['./test/unit-tests/karma/index.ts'],
        frameworks: ['jasmine', 'karma-typescript', 'detectBrowsers'],
        preprocessors: {
            "**/*.ts": 'karma-typescript',
        },
        karmaTypescriptConfig: {
            tsconfig: './test/tsconfig.json',
            bundlerOptions: {
                transforms: [
                    require("karma-typescript-es6-transform")()
                ]
            },
            coverageOptions: {
                threshold: {
                    global: {
                        statements: 100,
                        branches: 100,
                        functions: 100,
                        lines: 100,
                    }
                }
            },
            reports: {
                "html": "./coverage",
                "text-summary": null
            }
        },
        detectBrowsers: {
            preferHeadless: true,
            postDetection: function (availableBrowsers) {
                console.log('Available browser: ' + availableBrowsers);
                const browsersToUse = availableBrowsers
                    .filter(x => !(
                        x.startsWith('PhantomJS') ||
                        x.startsWith('IE')
                    ));
                return browsersToUse;
            }
        },
        client: {
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        reporters: ['dots', 'karma-typescript'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        singleRun: true,
        restartOnFileChange: true
    };
}

module.exports = function (config) {
    config.set(karmaConfig(config));
};
module.exports.mainKarmaConfig = karmaConfig;
