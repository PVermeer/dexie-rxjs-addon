
declare const configLib: {
    packageName: string;
    packageScopeAndName: string;
    umdName: string;
    version: string;
    dependencies: string[];
    peerDependencies: string[];
    peerDependenciesMapped: (string | Function | {} | RegExp)[];
};

export default configLib;
