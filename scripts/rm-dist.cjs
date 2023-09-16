const fs = require('node:fs');
const path = require('node:path')
const constants = require('node:constants');

const distPath = path.join(process.cwd(), 'dist');

fs.access(distPath, constants.F_OK, function (err) {
  if (!err) fs.rm(distPath, { recursive: true, force: false }, function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
});
