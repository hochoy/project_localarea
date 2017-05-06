// 1. Load googlemap
var curr_map; // the google map
var curr_geocoder; // the google geocoder

function googleMap_callbacks() {
    curr_map = initMap(lat_ = 49.262081, lng_ = -123.125886, zoom_ = 12);
    curr_geocoder = initGeocoder();
    loadBoundaries();
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
var geocode_coord; // the coordinates from the geocoded address


function loadAddress() {

    // get the address from an input box
    curr_address = $("#input_address").val();

    // remove any existing map markers
    removeExistMarker(marker_ = curr_marker);

    // remove any drawn boundaries
    removeExistBoundary(map_ = curr_map, boundary_ = curr_boundary);

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
            geocode_coord = [goolocation.lng(), goolocation.lat()];
            // set the value for step 3's text input to the coordinates
            $('#search_coord').attr('value', geocode_coord);

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
    curr_marker = marker_;
}



// 3. Read in and convert local boundaries into geojson
var boundaries;

function loadBoundaries() {
    // Get kml link from step 1 input box
    var kml_link = $('#kml_link').val();
    console.log(kml_link);
    // Request kml as string from link
    $.get(kml_link).done(function(xml) {
        // convert kml string to xml document
        var temp_xml = $.parseXML(xml);
        // convert xml document to geojson object and extract features
        var temp_boundaries = toGeoJSON.kml(temp_xml).features;
        //output boundaries
        boundaries = temp_boundaries;
        return temp_boundaries;
    });
}



// 4. Find the neighbourhood using the search/query coordinate and the loaded neighbourhood boundaries
var search_coord;
var result_neighbourhoods;
var result_vertices;

function findHood() {
    // parse coord from coordinate input box at step 3
    search_coord_str = $('#search_coord').val().split(",");
    search_coord = search_coord_str.map(Number);

    // check to see if coordinate is valid
    if (search_coord.length == 2 && typeof search_coord[0] == 'number') {

        // loop through all boundaries to find the neighbourhood the coordinate belongs in
        search_results = loopSearch(search_coord, boundaries, first = true);
        result_neighbourhoods = search_results.neighbourhoods; // names
        result_vertices = search_results.vertices[0]; // polygon corner coordinates
        result_boundaryobj = search_results.boundaryobj[0]; // google's boundary object (used in drawBoundary for drawing)

        // assign the neighbourhood to the final output
        // $('#neighbourhood').attr('val', result_neighbourhoods);
        $('#neighbourhood').text(result_neighbourhoods);

        // draw the neighbourhood boundary if there's only one clear neighbourhood
        if (result_neighbourhoods.length == 1) {
            drawBoundary(curr_map, result_boundaryobj);
        } else {
            alert("More than 2 neighbourhoods were detected!");
        }

    } else {
        alert("Please input a valid geocoordinate");
    }


}

// Check if address is within boundary
function loopSearch(search_coord_, boundaries_, first_) {

    // create empty search result object
    var searchResult = {};
    searchResult.neighbourhoods = []; // names
    searchResult.vertices = []; // polygon vertices
    searchResult.boundaryobj = []; // google's boundary object (used for drawing boundary at drawBoundary)

    for (var i = 0; i < boundaries_.length; i++) {

        // extract neighbourhood names and vertices (corners)
        boundary_name = boundaries_[i].properties.name;
        boundary_vertices = boundaries_[i].geometry.coordinates[0];

        // check to see if coordinate is within the polygon (using vertices to outline the polygon)
        var isWithin = inBoundary(search_coord_, boundary_vertices);
        if (isWithin) {
            searchResult.neighbourhoods.push(boundary_name);
            searchResult.vertices.push(boundary_vertices);
            searchResult.boundaryobj.push(boundaries_[i]);
        }
    }

    return searchResult;
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

var curr_boundary;

function drawBoundary(map_, vertices_) {

    var data = vertices_;
    curr_boundary = map_.data.addGeoJson(data);

    map_.data.setStyle({
        fillColor: 'green',
        strokeWeight: 1
    });

}

// remove existing markers https://developers.google.com/maps/documentation/javascript/examples/marker-remove
function removeExistBoundary(map_, boundary_) {
    if (boundary_ !== undefined) {
        map_.data.forEach(function(feature) {
            map_.data.remove(feature);
        });

    }
}
