// 1. Load googlemap
var curr_map; // the google map
var curr_geocoder; // the google geocoder

function googleMap_callbacks() {
    curr_map = initMap(lat_ = 49.262081, lng_ = -123.125886, zoom_ = 12);
    curr_geocoder = initGeocoder();
}

// return a google map
function initMap(lat_, lng_, zoom_) {
    return new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: lat_,
            lng: lng_
        },
        zoom: zoom_
    });
}

// return a google geocoder
function initGeocoder() {
    return new google.maps.Geocoder();
}



// 2. Geocode an address
var curr_address; // the current address being searched
var curr_marker; // the current marker on google map
var geocode_results; // all results from the geocoded address
var geocode_coords; // the coordinates from the geocoded address


function loadAddress() {
    // remove any existing map markers
    removeExistMarker(marker_ = curr_marker);

    // get the address from an input box
    curr_address = $("#input_address").val();

    // geocode the address using google geocoder
    geocodeAddress(curr_address, function(locations, status) {

        if (status == 'OK') {
            // extract the best-hit google location (special google object) from the google result
            var best_googlehit = locations[0];
            var goolocation = best_googlehit.geometry.location;

            // centre the map to the google location
            centreMap(map_ = curr_map, goolocation_ = goolocation);
            // create a new google map marker at the google location
            newMarker(map_ = curr_map, goolocation_ = goolocation, marker_ = curr_marker);
            // extract a simpler coordinate array from the google location
            geocode_coords = [goolocation.lng(), goolocation.lat()];
            // set the value for step 3's text input to the coordinates
            $('#custom_coord').attr('value', geocode_coords);

        } else {
            alert('Geocode was not successful for the following reason: ' + status);
            return "geocoding failed";
        }

    });

}

// remove existing markers https://developers.google.com/maps/documentation/javascript/examples/marker-remove
function removeExistMarker(marker_) {
    if (marker_ !== undefined) {
        marker_.setMap(null);
    }
}

function geocodeAddress(address_, callback) {

    // check to see if google geocoder is present
    if (curr_geocoder === undefined) {
        alert("Geocoder not set!");
    } else {
        // run google geocoding and return two variables in the callback
        curr_geocoder.geocode({
            'address': address_
        }, function(locations, status) {
            callback(locations, status);
        });
    }
}

function centreMap(map_, goolocation_) {
    map_.setCenter(goolocation_);
}

function newMarker(map_, goolocation_, marker_) {
    marker_ = new google.maps.Marker({
        map: map_,
        position: goolocation_
    });
}


// Read in and convert local boundaries into geojson
var boundaries;

function loadboundaries() {

    // Request xml as string from github raw xml page
    $.get('https://raw.githubusercontent.com/hochoy/project_localarea/master/kml/cov_localareas.kml').done(function(xml) {
        // convert kml string to xml document
        var temp_xml = $.parseXML(xml);
        // convert xml document to geojson object and extract features
        boundaries = toGeoJSON.kml(temp_xml).features;

    });
}

// // FIX: loop through each feature
// boundary1 = boundaries[0];
// boundary1_name = boundary1.properties.name;
// boundary1_vertices = boundary1.geometry.coordinates[0];
// console.log(boundary1);
// console.log(boundary1_name);
// console.log(boundary1_vertices);

// Run DataBC geocoder API on physical address
// Awaiting apikey. In the meantime, using google geocoder
var geocoder_query;
var geocoder_response;
var geocoder_coordinate;




// Check if address is within boundary
function checkwithin() {

    // check boundary polygons
    if (boundary1_vertices === undefined) {
        alert("Boundaries not loaded");
        return false;
    }

    // extract address geocoordinate
    var custom_coord = $('#custom_coord').val();
    var custom_lnglat_string = custom_coord.split(",");

    // check if coordinate is valid (comma-separated string should split into array of length 2)
    if (custom_lnglat_string.length == 2) {
        var custom_lnglat_num = [Number(custom_lnglat_string[0]),
            Number(custom_lnglat_string[1])
        ];
        geocoder_coordinate = custom_lnglat_num;
        var iswithin = inBoundary(geocoder_coordinate, boundary1_vertices);

        console.log(geocoder_coordinate);
        console.log(iswithin);

    } else {
        alert("Please input a valid geocoordinate");
    }
}


// Core function to detect if point is within boundary1
function inBoundary(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    // from https://github.com/substack/point-in-polygon/blob/master/index.js

    var x = point[0],
        y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0],
            yi = vs[i][1];
        var xj = vs[j][0],
            yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}



function drawBoundary() {
    // FIX: draw boundary based on an input number
    // var data = boundaries[neighbourhood_id];
    var data = boundaries[0];
    map.data.addGeoJson(data);
    console.log("try draw");
}
