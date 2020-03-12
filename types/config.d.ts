
declare const configLib: {
    packageName: string;
    packageScopeAndName: string;
    umdName: string;
    version: string;
    dependencies: string[];
    inlinedLibraries: string[];
    peerDependencies: string[];
    peerDependenciesMapped: (string | Function | {} | RegExp)[];
    runningOnOs: string;
};

export default configLib;
