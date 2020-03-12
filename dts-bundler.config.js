// @ts-check
const configLib = require('./config');

/** @type import('dts-bundle-generator/config-schema').BundlerConfig */
const config = {
    compilationOptions: {
        preferredConfigPath: './tsconfig.bundle.json'
    },

    entries: [
        {
            filePath: './src/index.ts',
            outFile: './dist/index.d.ts',
            output: {
                umdModuleName: configLib.umdName,
                inlineDeclareExternals: true
            },
            libraries: {
                inlinedLibraries: configLib.inlinedLibraries
            }
        }
    ]
};

module.exports = config;
