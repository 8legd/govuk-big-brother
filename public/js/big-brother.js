var BigBrother = {

  socket: null,

  initialize: function() {
    BigBrother.clock();
    BigBrother.bugs.fetch();
    BigBrother.commits.fetch();
    BigBrother.project.fetch();  
    BigBrother.tube.fetch();  
  },

  clock: function() {
    var countdownEnd = null;
    $.getJSON('/data/countdown.json?'+Date.now(), function(data){
      $('#clock').countdown({until: new Date(data.until), layout: "{dn}{sep}{hnn}{sep}{mnn}{sep}{snn}", compact: true});
    });

  },

  bugs: {
    fetch: function(){
      $.getJSON('/data/bugs.json?'+Date.now(), function(data){
        BigBrother.bugs.display(data);
      });
    },
    display: function(data) {
      $('#bug-count .number').text(data.story.length);
      $('#bugs li').not('.placeholder').remove();
      $.each(data.story,function(key,story){
        var owner = (story.owned_by) ? story.owned_by.split(" ").map(function(i){ return i.substring(0,1); }).join("") : "--";
        var bug = $('#bugs li.placeholder').clone();
        var app = story.labels;

        bug.removeClass('placeholder').addClass('state_'+story.current_state);
        bug.find('.title').text(story.name.truncate(30));
        bug.find('.owner').text(owner);
        bug.find('.app').addClass(app).text(app);

        bug.appendTo('#bugs ul');
      });
    }
  },

  commits: {
    fetch: function() {
      $.getJSON('/data/commits.json?'+Date.now(), function(data){
        BigBrother.commits.display(data);
      });
    },
    display: function(data) {
      $.each(data,function(key,commit){
        BigBrother.commits.item(commit).appendTo('#checkins ul');
      });
    },
    receive: function(data) {
      BigBrother.commits.item(data).hide().prependTo('#checkins ul').slideDown('fast');
    },
    item: function(object) {
      var checkin = $('#checkins li.placeholder').clone().removeClass('placeholder');

      checkin.find('.changes').text(object.commit.message.truncate(140));
      checkin.find('.author').text( (object.committer) ? object.committer.login : object.commit.committer.name );
      checkin.find('.time').attr('title',object.commit.committer.date).timeago({minute: "a minute", hour: "an hour", hours: "%d hours"});
      checkin.find('.app').addClass(object.app).text(object.app);

      return checkin;
    }
  },

  project: {
     fetch: function() {
      $.getJSON('/data/project.json?'+Date.now(), function(data){
        BigBrother.project.display(data);
      });
    },
    display: function(data) {
       $('#velocity .number').text(data.current_velocity);
    }
  },

  tube: {
    fetch: function() {
      $.getJSON('/data/tube.json', function(data){
        BigBrother.tube.display(data);
      });
    },                                
    display: function(data) {
      $('#tube .status.central_line div').text(data.Central.description);  
      $('#tube .status.piccadilly_line div').text(data.Piccadilly.description);
    }
  },

};

String.prototype.truncate = function(n){
  return this.substr(0,n-1)+(this.length>n?'...':'');
};

$(document).ready(function() {
  BigBrother.initialize();                                
  BigBrother.socket = io.connect("http://"+window.location.hostname+":"+window.location.port);

  BigBrother.socket.on('bugs.update',function(data){
    $('#status').attr('class','up');
  });
  BigBrother.socket.on('bugs.update',function(data){
    window.console.log('Received bugs update: '+ data);
    BigBrother.bugs.display(data);
  });
  BigBrother.socket.on('project.update',function(data){
    window.console.log('Received project update: '+ data);
    BigBrother.project.display(data);
  });
  BigBrother.socket.on('commits.new',function(data){
    window.console.log('Received new commit: '+ data);
    BigBrother.commits.receive(data);
  }); 
  BigBrother.socket.on('tube.update',function(data){
    window.console.log('Received tube status update: '+ data);
    BigBrother.tube.display(data);
  });
  BigBrother.socket.on('disconnect',function(data){
    $('#status').attr('class','down');
    window.location.reload();
  });

});
