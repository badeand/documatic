
const logGeneration = require('./common.js').logGeneration;
const getTargetFile = require('./common.js').getTargetFile;
const deleteIfExist = require('./common.js').deleteIfExist;
const targetDirectory = require('./common.js').targetDirectory;

const {execSync} = require("child_process");

function generatePlantUML(filename, format, targetExtension) {
    logGeneration(filename, targetExtension, "in progress");
    const targetFile = getTargetFile(filename, targetExtension);
    deleteIfExist(targetFile);
    let targetDir = targetDirectory(filename);
    execSync(`plantuml ${filename} -t${targetExtension} -o ${targetDir}`);
    logGeneration(filename, targetExtension, "done");
  }


module.exports = {generatePlantUML}