
const path = require('node:path');
const fs = require('fs');

function getTargetFile(filename, targetExtension) {
    let dir = path.dirname(filename)
    let gendir = path.join(dir, "g_");
    if (!fs.existsSync(gendir)) {
        fs.mkdirSync(gendir)
    }

    let shortname = path.basename(filename).split(".")[0];
    return `${path.join(gendir, shortname)}.${targetExtension}`
}

function targetDirectory(filename) {
    let gendir = path.join(path.dirname(filename), "g_");
    return gendir;
}

function logGeneration(filename, targetExtension, status) {
    console.log(`[GENERATE] ${status} ${filename} -> ${targetExtension}`);
}

function deleteIfExist(path1) {
    try {
        fs.unlinkSync(path1)
    } catch (err) {
    }
}


module.exports = { logGeneration, getTargetFile, deleteIfExist, targetDirectory }