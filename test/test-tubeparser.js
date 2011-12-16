var common = require('./common');
var TubeParser = require('tubeparser').TubeParser;

exports['should extract statuses'] = function(test){
  var tp = new TubeParser();
  var xml = common.readFixture('linestatus.xml');

  var expected = {
    'Bakerloo': {'class': 'GoodService', description: 'Good Service'},
    'Central':  {'class': 'GoodService', description: 'Good Service'}
  };
	test.deepEqual(tp.parse(xml), expected);
  test.done();
};
