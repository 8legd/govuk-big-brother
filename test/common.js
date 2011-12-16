var path = require("path");
var fs = require('fs');
require.paths.unshift(path.join(path.dirname(__filename), '../lib'));

exports.readFixture = function(name){
	return fs.readFileSync(path.join(path.dirname(__filename), 'data', name));
};
