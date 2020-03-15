// @ts-check
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const path = require('path');

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
            { pattern: './dist/**/*.+(js|map)', included: false, watched: false }
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
                            configFile: path.join(__dirname + '../../test/tsconfig.json')
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
                extensions: ['.tsx', '.ts', '.js', '.json'],
                alias: {
                    lodash: 'lodash-es'
                }
            },
            devtool: 'inline-source-map'
        },
        webpackMiddleware: {
            stats: 'errors-only'
        },
        client: {
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        customLaunchers: {
            ChromeDebugging: {
                base: 'Chrome',
                flags: ['--remote-debugging-port=9333']
            }
        },
        browsers: ['ChromeDebugging'],
        reporters: ['mocha', 'kjhtml'],
        mochaReporter: {
            ignoreSkipped: true,
            maxLogLines: -1
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
