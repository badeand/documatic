
const fs = require('fs');
const { generate } = require('node-plantuml');
const path = require('node:path');
const generatePlantUML = require('./genpuml.js').generatePlantUML;
const generateMDFromExcel = require('./genexcel').readExcel;

const rootDir = process.argv[2];
console.log(`rootDir=${rootDir}`)

function generateAll() {
    let rawdata = fs.readFileSync(path.join(rootDir, 'documatic.json'));
    let documatic_config = JSON.parse(rawdata);
    console.log(documatic_config);
    documatic_config.files.forEach(async file => {
        if (file.type === "excel") {
            ts("start excel");
            await generateMDFromExcel(file.name)
            ts("end excel");
        } else if (file.type === "plantuml") {
            ts("start puml");
            await generatePlantUML(path.join(rootDir, file.name), "png", "png")
            ts("end puml");
        }
    });

}

generateAll();




function ts(title) {
    console.log(`--- ts ${title} - ${Date.now}`);
}

