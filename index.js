/**
 * Parvez M Robin
 * this@parvezmrobin.com
 * Feb 13, 2020
 */

const {readdirSync} = require('fs');
const {normalize, join} = require('path');

const dirPath = normalize('./build/static/js');
const fileNames = readdirSync(dirPath);

for (const fileName of fileNames) {
  if (fileName.match(/^BnInput.*\.js$/)) {
    const filePath = join(dirPath, fileName);
    module.exports = require(filePath);
    break;
  }
}
