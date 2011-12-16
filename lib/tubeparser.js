var sax = require('sax');

var TubeParser = function(){};

TubeParser.url = "http://cloud.tfl.gov.uk/TrackerNet/LineStatus"

TubeParser.prototype.parse = function(xml){
  var parser = sax.parser(/* strict = */ false);

  var result = {};
  var resultKey, resultValue;

  parser.onopentag = function(node){
    switch (node.name) {
      case 'LINESTATUS':
        break;
      case 'LINE':
        resultKey = node.attributes.Name;
        break;
      case 'STATUS':
        resultValue = {
          'class': node.attributes['CssClass'],
          description: node.attributes['Description']
        };
        break;
    }
  };

  parser.onclosetag = function(name){
    if (name == 'LINESTATUS') {
      result[resultKey] = resultValue;
    }
  };

  parser.write(xml + '');
  parser.close();

  return result;
};

exports.TubeParser = TubeParser;
