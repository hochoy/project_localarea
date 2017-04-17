
// Read in and convert local boundaries into geojson
var boundaries;
var boundary1;
var boundary1_name;
var boundary1_polygon;

function loadboundaries(){
  $.ajax('kml/cov_localareas.kml').done(function(xml) {
      // convert kml to geojson
      boundaries = toGeoJSON.kml(xml).features;

      // loop through each feature
      boundary1 = boundaries[0];
      boundary1_name = boundary1.properties.name;
      boundary1_polygon = boundary1.geometry.coordinates[0];
      console.log(boundary1);
      console.log(boundary1_name);
      console.log(boundary1_polygon);
  });
}

// Run DataBC geocoder API on physical address
// Awaiting apikey. In the meantime, using a hardcoded response.
var geocoder_query;
var geocoder_response;
var geocoder_coordinate;

function loadaddress() {
  loadsample(); // temporary hardcoded geocoder response
}


// Check if address is within boundary
function checkwithin() {
  var iswithin = inBoundary(geocoder_coordinate,boundary1_polygon);

  console.log(iswithin);
}


// Core function to detect if point is within boundary1
function inBoundary(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}
