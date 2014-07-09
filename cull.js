var fs = require("fs");

// sessions.json is the response from 
// http://cdh.esri.com/2.0/?action=getWebAppData&confid=65
// it's ~3.5MB
// after removing unused info, it's ~1MB, probably ~200K gzipped
var source = "sessions.json";
var out = "sessions-culled.json";

fs.exists(out, function(exists) {
  if ( exists ) {
    fs.unlink(out, function(err) {
      go();
    });
  } else {
    go();
  }
});

function go() {
  fs.readFile(source, "utf-8", function(err, data) {
    sessions(data);
  });
}

function sessions(data) {
  // 7/5/2014:  there were a few backslashes in weird places that were
  // causing errors when passing data with JSON.parse().
  // Examples:  www.fema.gov\hazus, GIS Analyst\Environmental Scientist
  // Replace backslashes that aren't followed by " (double-quotes).
  data = data.replace(/\\([^"])/g, function(m, g) { return "/" + g; });
  // Strip vertical tabs, they also break stuff.
  data = data.replace(/\v/g, "");
  var s = JSON.parse(data);
  var results = s.sessionsView.results;
  var relevant = {};
  // relevant.conference = s.conference;
  relevant.conference = {
    results: [{
      fullname: s.conference.results[0].fullname,
      year: s.conference.results[0].year
    }]
  };
  relevant.sessionsView = {};
  relevant.sessionsView.count = s.sessionsView.count;
  relevant.sessionsView.results = results.map(function(session) {
    return {
      startDay: session.startDay,
      startDate: session.startDate,
      endDate: session.endDate,
      sessionTitle: session.sessionTitle,
      eventTypeID: session.eventTypeID,
      sessionDescription: session.sessionDescription,
      contacts: session.contacts,
      room: session.room,
      sessionID: session.sessionID,
      offeringID: session.offeringID,
      floor: session.floor,
      xPoint: session.xPoint,
      yPoint: session.yPoint,
      offeringCount: session.offeringCount,
      istScheduleID: session.istScheduleID,
      paperTitle: session.paperTitle
    }
  });
  fs.writeFile(out, JSON.stringify(relevant), function(err) {
    if ( err ) {
      throw err;
    }
    console.log("Wrote file", out);
  });
}
