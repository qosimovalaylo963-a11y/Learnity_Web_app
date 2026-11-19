'use strict';
const fs = require('node:fs');
const path = require('node:path');
const nested = path.join(__dirname, 'src', 'server.js');
require(fs.existsSync(nested) ? nested : './server.js').start();
