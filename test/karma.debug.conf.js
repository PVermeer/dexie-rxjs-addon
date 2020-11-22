// @ts-check
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

/*
 * Using webpack for much better debug experience with tests.
 */

module.exports = /** @param {import('karma').Config} config */ function (config) {
    /** @type {
        { [prop: string]: any } &
        import('karma').ConfigOptions &
        { webpack: import('webpack/declarations/WebpackOptions').WebpackOptions }
    } config */

    const configOptions = {
        basePath: '../',
        files: [
            './test/unit-tests/karma/index.ts',
            // Serve dist folder so files can be loaded when needed in tests
            { pattern: './dist/**/*.+(js|map)', included: false, watched: true }
        ],
        frameworks: ['jasmine'],
        plugins: [
            'karma-jasmine',
            'karma-webpack',
            'karma-chrome-launcher',
            'karma-mocha-reporter',
            'karma-jasmine-html-reporter'
        ],
        preprocessors: {
            "**/*.ts": ['webpack'],
        },
        webpack: {
            mode: 'development',
            performance: { hints: false },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                        options: {
                            configFile: path.join(__dirname + '../../test/tsconfig.test.json'),
                            transpileOnly: true
                        }
                    },
                    {
                        test: /\.m?js$/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                sourceType: 'unambiguous',
                                presets: [['@babel/preset-env', { modules: false }]],
                                plugins: ['@babel/plugin-transform-runtime']
                            }
                        }
                    }
                ]
            },
            resolve: {
                extensions: ['.tsx', '.ts', '.js', '.json']
            },
            devtool: 'inline-source-map',
            plugins: [
                new ForkTsCheckerWebpackPlugin()
            ]
        },
        webpackMiddleware: {
            stats: 'errors-only'
        },
        client: {
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        customLaunchers: {
            ChromeDebuggingHeadless: {
                base: 'ChromeHeadless',
                flags: [
                    '--no-sandbox',
                    '--remote-debugging-address=0.0.0.0',
                    '--remote-debugging-port=9229'
                ]
            }
        },
        browsers: ['ChromeDebuggingHeadless'],
        reporters: ['mocha', 'kjhtml'],
        mochaReporter: {
            ignoreSkipped: true
        },
        jasmineHtmlReporter: {
            suppressFailed: true
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        browserConsoleLogOptions: {
            // @ts-ignore
            level: 'off',
            terminal: false
        },
        autoWatch: true,
        singleRun: false,
        restartOnFileChange: true
    }

    config.set(configOptions);
}
