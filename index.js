
const fs = require('fs');
const path = require('node:path');
const generatePlantUML = require('./genpuml.js').generatePlantUML;
const readExcel = require('./genexcel').readExcel;

const rootDir = process.argv[2];
console.log(`rootDir=${rootDir}`)

/*
let rawdata = fs.readFileSync(path.join(rootDir, 'documatic.json'));
let documatic_config = JSON.parse(rawdata);
console.log(documatic_config);
documatic_config.files.forEach(element => {
    console.log(element.name)
    generatePlantUML(path.join(rootDir, element.name), "svg", "svg")
});
*/






readExcel()


