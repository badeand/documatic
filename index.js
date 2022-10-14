const path = require('path');
const fs = require('fs');
var crypto = require('crypto');
var plantuml = require('node-plantuml');
var pandoc = require('node-pandoc');
var sleep = require('system-sleep');

const state = {
  watchedFiles: []
};

function extension(filename) {
  return filename.split(".").pop().toLowerCase();
}


function deleteIfExist(path1) {
  try {
    fs.unlinkSync(path1)
  } catch (err) {
  }
}

function logGeneration(filename, targetExtension) {
  console.log(`[GENERATE]    ${filename} -> ${targetExtension}`);
}


function getTargetFile(filename, targetExtension) {
  let dir = path.dirname(filename)
  let gendir = path.join(dir, "g_");
  if (!fs.existsSync(gendir)) {
    fs.mkdirSync(gendir)
  }

  let shortname = path.basename(filename).split(".")[0];
  return `${path.join(gendir, shortname)}.${targetExtension}`
}

function generatePlantUML(filename, format, targetExtension) {
  const targetFile = getTargetFile(filename, targetExtension);
  // deleteIfExist(targetFile);
  var gen = plantuml.generate(filename, {format: format})
  let writeStream = fs.createWriteStream(targetFile);
  gen.out.pipe(writeStream)
  finished = false;

  gen.out.on('end', function () {
    finished = true;
  });

  while (!finished) {
    sleep(100);
  }

  logGeneration(filename, targetExtension);
}

function generatePandoc(mdTargetFile, filename, targetExtension) {
  src = mdTargetFile;
  const docxTargetFile = getTargetFile(filename, targetExtension);
  args = ['-f', 'markdown', '-t', targetExtension, '-o', docxTargetFile];
  callback = function (err, result) {
    if (err) {
      console.error(err);
    }
    logGeneration(filename, targetExtension)
    return result;
  };
  pandoc(src, args, callback);


}

function generate(filename) {

  let ext = extension(filename);

  if (ext === "puml") {
    generatePlantUML(filename, 'svg', 'svg');
    generatePlantUML(filename, 'png', 'png');
  }


  if (ext === "md") {

    let contents = fs.readFileSync(filename, 'utf8').toString();
    let regexp = /!\[\]\((.*\.[a-zA-Z]*)\)/g;
    let results = contents.matchAll(regexp);
    for (let result of results) {
      linkTrgt = result[1];
      let trgt = path.join(path.dirname(path.resolve(filename)), linkTrgt);
      console.log(trgt)
      let relative = path.relative(filename, trgt);
      contents = contents.replaceAll(linkTrgt, trgt)
    }

    const mdTargetFile = getTargetFile(filename, "md");
    fs.writeFileSync(mdTargetFile, contents);
    logGeneration(filename, "md")
    generatePandoc(mdTargetFile, filename, "docx");
    generatePandoc(mdTargetFile, filename, "pdf");

  }

}

function traverse(dir, a) {
  const files = fs.readdirSync(dir)
  files.forEach(function (file) {
    let filename = path.join(dir, file);
    let lstatSync = fs.lstatSync(filename);
    if (lstatSync.isDirectory() && !filename.endsWith("g_")) {
      traverse(filename, a)
    }
    if (lstatSync.isFile() && fileOfInterest(filename)) {
      a.push(filename)
    }
  });
}


function fileOfInterest(filename) {
  return extension(filename) === "puml" ||
    extension(filename) === "md";
}

function update(dir) {

  filesOfInterest = []
  traverse(dir, filesOfInterest);


  filesOfInterest.sort(function (a, b) {
    let eA = extension(a);
    let eB = extension(b);

    nA = eA === "puml" ? 1 : 10;
    nB = eB === "puml" ? 1 : 10;

    return nA - nB;
  })

  filesOfInterest.forEach(filename => {
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
      generate(filename);

    } else {
      if (!(samefile.hash === hash)) {
        samefile.hash = hash
        generate(filename);
      }
    }
  })

  // console.log(filesOfInterest)
}


let base = path.join(__dirname, 'doc');
update(base)
setInterval(a => {
  update(base)
}, 1500,)

