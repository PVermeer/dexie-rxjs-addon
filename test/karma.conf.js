// @ts-check
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const path = require('path');
const configLib = require('../config');

// @ts-ignore
process.on('infrastructure_error', (error) => {
    console.error('infrastructure_error', error);
});

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
        preprocessors: {
            "**/*.ts": ['webpack']
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
                        test: /\.ts$/, // Setting tsx breaks it ???
                        exclude: [path.resolve(__dirname, '../test')],
                        enforce: 'post',
                        use: {
                            loader: 'istanbul-instrumenter-loader',
                            options: {
                                configFile: path.join(__dirname + '../../test/tsconfig.json')
                            }
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
                ],
            },
            resolve: {
                extensions: ['.tsx', '.ts', '.js', '.json'],
                alias: {
                    lodash: 'lodash-es'
                }
            },
            devtool: 'inline-source-map',
            plugins: [
                new ExitOnErrorWebpackPlugin()
            ]
        },
        coverageIstanbulReporter: {
            reports: ['text-summary', 'html'],
            fixWebpackSourcePaths: true,
            dir: path.join(__dirname, '../reports/coverage'),
            combineBrowserReports: true,
            thresholds: {
                global: {
                    statements: 100,
                    lines: 100,
                    branches: 100,
                    functions: 100
                }
            },
        },
        webpackMiddleware: {
            stats: 'errors-only'
        },
        browsers: require('is-ci') ?
            ['ChromeHeadless', 'FirefoxHeadless'] :
            configLib.runningOnOs.trim().toLowerCase().includes('windows') ?
                ['ChromeHeadless', 'FirefoxHeadless', 'EdgeHeadless'] :
                ['ChromeHeadless', 'FirefoxHeadless'],
        reporters: ['dots', 'mocha', 'coverage-istanbul'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        browserConsoleLogOptions: {
            level: 'error',
            terminal: true
        },
        autoWatch: false,
        singleRun: true,
        restartOnFileChange: false
    };

    config.set(configOptions);

}

/**
 * Custom plugin to exit > 0 karma when TS compiler errors
 */
class ExitOnErrorWebpackPlugin {
    // @ts-ignore
    apply(compiler) {
        // @ts-ignore
        compiler.hooks.done.tap("ExitOnErrorWebpackPlugin", stats => {
            if (stats && stats.hasErrors()) {
                // @ts-ignore
                stats.toJson().errors.forEach(err => {
                    console.error(err);
                });
                process.exit(1);
            }
        });
    }
}
