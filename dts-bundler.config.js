// @ts-check
const configLib = require('./config');

/** @type import('dts-bundle-generator/config-schema').BundlerConfig */
const config = {
    compilationOptions: {
        preferredConfigPath: './tsconfig.json',
    },

    entries: [
        {
            filePath: './src/index.ts',
            outFile: './dist/index.d.ts',
            output: {
                umdModuleName: configLib.umdName
            }
        }
    ]
};

module.exports = config;
