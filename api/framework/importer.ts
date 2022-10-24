import fs from 'fs';
import path from 'path';

const findExtensionsPaths = (initialPath: string, extension: string): Array<string> => {
    let filePaths: Array<string> = new Array<string>();
    fs.readdirSync(initialPath).forEach((fileName: string) => {
        const filePath = path.join(initialPath, fileName);
        const fileStat = fs.statSync(filePath);
        if (fileStat.isDirectory() && fileName !== "node_modules") {
            filePaths = filePaths.concat(findExtensionsPaths(filePath, extension));
        } else if (fileStat.isFile() && fileName.endsWith(extension)) {
            filePaths.push(filePath);
        }
    })
    return filePaths;
}

const importClassFromFile = (Class: any) => (filePath: string) => {
    const Module = require(filePath);
    const classes: Array<any> = [];
    Object.values(Module).forEach((definition: any) => {
        if (definition.prototype instanceof Class) {
            classes.push(definition)
        }
    })

    return classes;
}


export const importAll = (Class: any, extension: string) => (startPath: string = projectPath()): Array<any> => {
    const importClassDefinedFromFile = importClassFromFile(Class)
    return findExtensionsPaths(startPath, extension)
        .reduce((classes: Array<any>, filePath: string) =>
            classes.concat(importClassDefinedFromFile(filePath))
            , new Array<any>());
}


export const projectPath = (m = module): string => {
    return process.cwd();
} 