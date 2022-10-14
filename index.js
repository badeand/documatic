const path = require('path');
const fs = require('fs');
var crypto = require('crypto');
var plantuml = require('node-plantuml');

console.log("Running")

const directoryPath = path.join(__dirname, 'doc');


const state = {
  watchedFiles: []
};


// const statefile = "documatic_state.json";

// let state = JSON.parse(fs.readFileSync(statefile).toString());

console.log("")

function deleteIfExist(path1) {
  try {
    fs.unlinkSync(path1)
  } catch (err) {
  }
}

function logGeneration(filename, targetExtension) {
  console.log(`[GENERATE]    ${filename} -> ${targetExtension}`);
}

function generatePlantUML(filename, sourceExtension, format, targetExtension) {
  let basename = filename.substr(0, filename.length - sourceExtension.length - 1);
  deleteIfExist(path);
  var gen = plantuml.generate(filename, {format: format})
  gen.out.pipe(fs.createWriteStream(`${basename}.${targetExtension}`))
  logGeneration(filename, targetExtension);
}

function generate(filename, sourceExtension) {
  generatePlantUML(filename, sourceExtension, 'svg', 'svg');
  generatePlantUML(filename, sourceExtension, 'png', 'png');
}

function update() {
  const files = fs.readdirSync(directoryPath)

  files.forEach(function (file) {
    let filename = path.join(directoryPath, file);
    let lstatSync = fs.lstatSync(filename);

    if (lstatSync.isFile()) {

      let sourceExtension = filename.split(".").pop().toLowerCase()
      if (sourceExtension === "puml") {

        let fileContentAsString = fs.readFileSync(filename).toString();
        let hash = crypto.createHash('md5').update(fileContentAsString).digest("hex");

        var samefiles = state.watchedFiles.filter(a => {
          return filename === a.filename
        });
        samefile = samefiles[0]

        if (!samefile) {
          state.watchedFiles.push({
            "filename": filename,
            "hash": hash
          })
          generate(filename, sourceExtension);

        } else {
          if (!(samefile.hash === hash)) {
            samefile.hash = hash
            generate(filename, sourceExtension);
          }
        }
      }

    }

  });
}

update()
setInterval(a => {
  update()
}, 1500,);

// fs.writeFileSync(statefile, JSON.stringify(state, null, 2));

