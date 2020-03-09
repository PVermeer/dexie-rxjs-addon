// @ts-check

/** @type import('type-fest').PackageJson */
// @ts-ignore
const packageJson = require('./package.json');
var os = require("os").type();

const packageName = (packageName) => {
    const onlyName = packageJson.name.includes('@') ?
        packageName.split('/')[1] :
        packageName;

    return onlyName;
}
const umdName = (packageName) => {
    const onlyName = packageJson.name.includes('@') ?
        packageName.split('/')[1] :
        packageName;

    const pascalCaseName = onlyName.split('-')
        .map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('');
    return pascalCaseName;
}
function mapPeerDependencies() {
    return Object.keys(packageJson.peerDependencies).reduce((array, key) => {
        let obj = array[0];
        switch (key) {
            // Map to support the exports on window / global
            // https://webpack.js.org/configuration/externals/#externals
            case 'dexie': obj[key] = 'Dexie'; break;
            case 'rxjs': obj[key] = 'rxjs';  obj[key + '/operators'] = ['rxjs', 'operators']; break;
            default: array.push(new RegExp(`^(${key}|${key}\/.+)$`));
        }
        return array;
    }, [{}]);
}

const configLib = {

    packageName: packageName(packageJson.name),

    packageScopeAndName: packageJson.name,

    umdName: umdName(packageJson.name),

    version: packageJson.version,

    dependencies: Object.keys(packageJson.dependencies),

    peerDependencies: Object.keys(packageJson.peerDependencies),

    // Externals for webpack min build
    peerDependenciesMapped: mapPeerDependencies(),

    runningOnOs: os

};

console.log('\nUsing config: \n\n', configLib, '\n');

module.exports = configLib;
