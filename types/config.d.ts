
declare const configLib: {
    packageName: string,
    umdName: string,
    version: string,
    peerDependencies: string[],
    peerDependenciesMapped: (string | Function | {} | RegExp)[]
};

export default configLib;
