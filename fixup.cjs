const fs = require('fs');
const path = require('path');

const updateRequires = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  //replace local imports eg. require("./yyy/ecpair.js") to require("yyy/ecpair.cjs")
  //replace local imports eg. require("../xx/ecpair.js") to require("../xx/ecpair.cjs")
  const updatedCode = content.replace(/require\(\s*["']([^"']+\.js)["']\s*\)/g, (match, p1) => {
    // replace .js to .cjs
    return `require('${p1.replace(/\.js$/, '.cjs')}')`;
  });
  fs.writeFileSync(filePath, updatedCode, 'utf8');
};

const processFiles = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      processFiles(filePath);
    } else if (filePath.endsWith('.js')) {
      updateRequires(filePath);
      const fileName = path.basename(filePath);
      const dir = path.dirname(filePath);
      fs.renameSync(filePath, path.join(dir, fileName.replace('.js', '.cjs')));
    }
  });
};

const dir = path.join(__dirname, 'src', 'cjs');
processFiles(dir);