const path = require('path');
const fs = require('fs');
var crypto = require('crypto');
var plantuml = require('node-plantuml');

console.log("Running")


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

  let shortname = path.basename(filename).split(".")[0];

  let dir = path.dirname(filename)
  let gendir = path.join(dir, "g_");
  if (!fs.existsSync(gendir)) {
    fs.mkdirSync(gendir)
  }

  targetFile = `${path.join(gendir, shortname)}.${targetExtension}`
  deleteIfExist(path);
  var gen = plantuml.generate(filename, {format: format})
  gen.out.pipe(fs.createWriteStream(targetFile))
  logGeneration(filename, targetExtension);
}

function generate(filename, sourceExtension) {


  generatePlantUML(filename, sourceExtension, 'svg', 'svg');
  generatePlantUML(filename, sourceExtension, 'png', 'png');
}

function traverse(dir, a) {
  const files = fs.readdirSync(dir)
  files.forEach(function (file) {
    let filename = path.join(dir, file);
    let lstatSync = fs.lstatSync(filename);
    if (lstatSync.isDirectory()) {
      traverse(filename, a)
    }
    if (lstatSync.isFile()) {
      a.push(filename)
    }
  });
}

function update(dir) {

  allfiles = []
  traverse(dir, allfiles);

  allfiles.forEach(filename => {
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
  })

}


let base = path.join(__dirname, 'doc');
update(base)
setInterval(a => {
  update(base)
}, 1500,)

// fs.writeFileSync(statefile, JSON.stringify(state, null, 2));

