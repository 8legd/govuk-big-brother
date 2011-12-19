var TubeParser = require('./lib/tubeparser').TubeParser;

BigBrother = {
  poll_interval: 60,
  clients: {},
  tokens: {},
  parser: null,
  socket: null,
  countdown: {
    until: '5 November 1955'
  },

  commits: {
    store: [],
    sha_store: [],
    poll: null,
    repositories: ['publisher','frontend','panopticon', 'imminence', 'need-o-tron','static', 'smart-answers', 'calendars', 'planner', 'rummager', 'jobs', 'fco', 'slimmer', 'publisher', 'contact-o-tron', 'router'],
    update: function() {
      var options = {
        host: "api.github.com",
        port: 443
      };

      this.repositories.forEach(function(repo){
        options.path = "/repos/alphagov/"+ repo +"/commits";
        BigBrother.clients.https.get(options, function(response) {
          console.log("[BigBrother.commits.import] Got response: " + response.statusCode);
          response.setEncoding('utf8');
          var data = [];
          response.on('data', function(chunk) {
            data.push(chunk);
          });
          response.on('end', function() {
            json = JSON.parse(data.join(''));
            json.forEach(function(hash){
              if (BigBrother.commits.sha_store.indexOf(hash.sha) == -1) {
                hash.app = hash.commit.url.match(/repos\/alphagov\/([A-Za-z0-9\-]+)\//)[1];
                if (BigBrother.socket)
                    BigBrother.socket.emit('commits.new', hash);
                BigBrother.commits.add(hash);
              }
            }.bind(this));
          });
        }).on('error', function(e) {
          console.log("[BigBrother.commits.import] Got error: " + e.message);
        });
      }.bind(this));

      BigBrother.commits.poll = setTimeout(function(){BigBrother.commits.update();},BigBrother.poll_interval*1000);
      return BigBrother.commits.store;
    },
    add: function(hash) {
      BigBrother.commits.store.push(hash);
      BigBrother.commits.sha_store.push(hash.sha);
      BigBrother.commits.sort();
    },
    sort: function() {
      function compare(a,b){
        function parseDateFor(commit) {
          matches = commit.commit.author.date.match(/([0-9]{4})\-([0-9]{2})\-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})/);
          return new Date(matches[1],matches[2],matches[3],matches[4],matches[5],matches[6]);
        }
        return (parseDateFor(a) < parseDateFor(b)) ? 1 : -1;
      }
      BigBrother.commits.store.sort(compare);
    }
  },

  bugs: {
    store: [],
    poll: null,
    update: function() {
      var options = {
        host: "www.pivotaltracker.com",
        port: 443,
        path: "/services/v3/projects/380195/stories?filter=type%3Abug%20state%3Aunscheduled,unstarted,started,finished,delivered",
        headers: {"X-TrackerToken": BigBrother.tokens.pivotalTracker}
      };

      BigBrother.clients.https.get(options, function(response) {
        console.log("[BigBrother.bugs.import] Got response: " + response.statusCode);
        response.setEncoding('utf8');
        var data = [];
        response.on('data', function(chunk) {
          data.push(chunk);
        });
        response.on('end', function() {
          var xml = data.join('');
          BigBrother.parser.parseString(xml, function(err, data){
            BigBrother.bugs.store = data;
            if (BigBrother.socket)
                BigBrother.socket.emit('bugs.update', data);
          });
        });
      }).on('error', function(e) {
        console.log("[BigBrother.bugs.import] Got error: " + e.message);
      });
      BigBrother.bugs.poll = setTimeout(function(){BigBrother.bugs.update();},BigBrother.poll_interval*1000);
    }
  },

  project: {
    store: [],
    poll: null,
    update: function() {
      var options = {
        host: "www.pivotaltracker.com",
        port: 443,
        path: "/services/v3/projects/380195",
        headers: {"X-TrackerToken": BigBrother.tokens.pivotalTracker}
      };

      BigBrother.clients.https.get(options, function(response) {
        console.log("[BigBrother.project.import] Got response: " + response.statusCode);
        response.setEncoding('utf8');
        var data = [];
        response.on('data', function(chunk) {
          data.push(chunk);
        });
        response.on('end', function() {
          var xml = data.join('');
          BigBrother.parser.parseString(xml, function(err, data){
            BigBrother.project.store = data;
            if (BigBrother.socket)
                BigBrother.socket.emit('project.update', data);
          });
        });
        BigBrother.project.poll = setTimeout(function(){BigBrother.project.update();},BigBrother.poll_interval*1000);
      }).on('error', function(e) {
        console.log("[BigBrother.project.import] Got error: " + e.message);
      });
    }
  },

  tube: {
    store: {},
    poll: null,
    'import': function(http_client, parser) {
      var options = {
        host: "cloud.tfl.gov.uk",
        port: 80,
        path: "/TrackerNet/LineStatus"
      };

      BigBrother.clients.http.get(options, function(response) {
        console.log("[BigBrother.tube.import] Got response: " + response.statusCode);
        response.setEncoding('ascii');
        var data = [];
        response.on('data', function(chunk) {
          data.push(chunk);
        });
        response.on('end', function() {
          BigBrother.tube.store = new TubeParser().parse(data.join(''));
        });                                                         
      }).on('error', function(e) {
        console.log("[BigBrother.tube.import] Got error: " + e.message);
      });
      BigBrother.tube.poll = setTimeout(function(){BigBrother.tube['import']();},BigBrother.poll_interval*1000);
    }
  }
};

BigBrother.prototype = {};
