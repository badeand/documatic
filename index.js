const path = require('path');
const fs = require('fs');
var crypto = require('crypto');
const {execSync} = require("child_process");

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

function logGeneration(filename, targetExtension, status) {
  console.log(`[GENERATE] ${status} ${filename} -> ${targetExtension}`);
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

function targetDirectory(filename) {
  let gendir = path.join(path.dirname(filename), "g_");
  return gendir;
}

function generatePlantUML(filename, format, targetExtension) {
  logGeneration(filename, targetExtension, "in progress");
  const targetFile = getTargetFile(filename, targetExtension);
  deleteIfExist(targetFile);
  let targetDir = targetDirectory(filename);
  execSync(`plantuml ${filename} -t${targetExtension} -o ${targetDir}`);
  logGeneration(filename, targetExtension, "done");
}

function generatePandoc(mdTargetFile, filename, targetExtension) {
  logGeneration(filename, targetExtension, "in progress");
  src = mdTargetFile;
  const targetfile = getTargetFile(filename, targetExtension);
  execSync(`pandoc -s ${mdTargetFile} -f markdown -t ${targetExtension} -o "${targetfile}"`)
  logGeneration(filename, targetExtension, "done")

}

function inlineMarkdownIncludes(contents, regexp, filename) {
  let results = contents.matchAll(regexp);
  for (let result of results) {
    linkTrgt = result[1];
    let trgt = path.join(path.dirname(path.resolve(filename)), linkTrgt);
    if (trgt.split(".").pop() === "md") {
      tag = result[0];
      let childContents = fs.readFileSync(trgt, 'utf8').toString();
      contents = contents.replaceAll(tag, childContents)
    }
  }
  return contents
}

function convertImagesLinksToAbsolute(contents, regexp, filename) {
  let results = contents.matchAll(regexp);
  for (let result of results) {
    linkTrgt = result[1];
    let trgt = path.join(path.dirname(path.resolve(filename)), linkTrgt);
    contents = contents.replaceAll(linkTrgt, trgt)
  }
  return contents;
}

function generate(filename) {

  let ext = extension(filename);

  if (ext === "puml") {
    generatePlantUML(filename, 'svg', 'svg');
    // generatePlantUML(filename, 'png', 'png');
  }

  if (ext === "md") {
    let regexp = /!\[\]\((.*\.[a-zA-Z]*)\)/g;
    var contents = fs.readFileSync(filename, 'utf8').toString();
    contents = inlineMarkdownIncludes(contents, regexp, filename);
    contents = convertImagesLinksToAbsolute(contents, regexp, filename);

    const mdTargetFile = getTargetFile(filename, "md");
    fs.writeFileSync(mdTargetFile, contents);
    logGeneration(filename, "md", "done")
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

}


let base = path.join(__dirname, 'doc');
update(base)
setInterval(a => {
  update(base)
}, 1500,)

