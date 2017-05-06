//http://stackoverflow.com/questions/27628938/using-google-map-javascript-api-to-render-a-geojson-polygon-overlay-from-javascr
//https://developers.google.com/maps/documentation/javascript/datalayer

function drawBoundary() {
    var data = boundaries[0];
    // var data = {
    // type: "Feature",
    // geometry:{
    //   "type": "Polygon",
    //   "coordinates": [
    //     [
    //       [-123.18378569999999,49.23713],
    //       [-123.20,49.24],
    //       [-123.190302304,49.2600],
    //       [-123.18378569999999,49.23713]
    //     ]
    //   ]
    // }
    // };

    map.data.addGeoJson(data);
    console.log("try draw");
}


// Load googlemap
var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 49.262081,
            lng: -123.125886
        },
        zoom: 12
    });

    initGeocoder();
}

// Load google geocoder
var geocoder;

function initGeocoder() {
    geocoder = new google.maps.Geocoder();
}


// Run geocoder to code an address
var address_coords;
var marker;

function codeAddress(input_address) {

    // run google geocoding
    geocoder.geocode({
        'address': input_address
    }, function(results, status) {
        if (status == 'OK') {

            // remove existing markers https://developers.google.com/maps/documentation/javascript/examples/marker-remove
            if (marker !== undefined) {
                marker.setMap(null);
            }

            // centre map on address coordinates
            map.setCenter(results[0].geometry.location);
            marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });

            // save the coordinates
            geocode_results = results[0].geometry.location;
            geocode_coords = [geocode_results.lng(), geocode_results.lat()];

            // change step 3 text input value to new geocode
            $('#custom_coord').attr('value', geocode_coords);

        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}


// Read in and convert local boundaries into geojson
var boundaries;
var boundary1;
var boundary1_name;
var boundary1_vertices;


function loadboundaries() {
    // $.ajax('kml/cov_localareas.kml').done(function(xml) {
    $.get('https://raw.githubusercontent.com/hochoy/project_localarea/master/kml/cov_localareas.kml').done(function(xml) {
        // convert kml to geojson
        console.log(xml);
        var temp_xml = $.parseXML(xml);
        console.log(temp_xml);
        boundaries = toGeoJSON.kml(temp_xml).features;

        // FIX: loop through each feature
        boundary1 = boundaries[0];
        boundary1_name = boundary1.properties.name;
        boundary1_vertices = boundary1.geometry.coordinates[0];
        console.log(boundary1);
        console.log(boundary1_name);
        console.log(boundary1_vertices);

    });
}

// Run DataBC geocoder API on physical address
// Awaiting apikey. In the meantime, using google geocoder
var geocoder_query;
var geocoder_response;
var geocoder_coordinate;

function loadaddress() {
    // loadsample(); // temporary hardcoded geocoder response from DataBC
    // TEMP: Use google's geocoding with the following key:

    // Grab input address
    var input_address = $("#input_address").val();
    // Call geocoding function
    codeAddress(input_address);
}


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


//
// // create a coordinate array for google maps
// //http://stackoverflow.com/questions/30760731/converting-string-of-coordinates-to-lat-long-array-for-google-maps-api-v3-return
//
// function kmlpolytoArray(vertices) {
//     // create an empty array
//     var polygonCoords = [];
//     // creates a new LatLng
//     var j = 0;
//     var z = j + 1;
//     var co1;
//     var co2;
//     var newLatLng;
//
//     while (z < vertices.length) {
//         if ((j % 2) === 0) {
//             co1 = parseFloat(vertices[z]);
//             //document.write(coordinate[j]);
//             co2 = parseFloat(vertices[j]);
//             //document.write(co2);
//             newLatLng = new google.maps.LatLng(co1, co2);
//
//             polygonCoords.push(newLatLng);
//         } else {
//             co2 = parseFloat(vertices[z]);
//             co1 = parseFloat(vertices[j]);
//             newLatLng = new google.maps.LatLng(co1, co2);
//             polygonCoords.push(newLatLng);
//         }
//         z++;
//         j++;
//     }
//     return polygonCoords;
// }

//
// // Draw boundary polygons
// var boundary_polygon;
//
// function drawBoundary(vertices) {
//     boundary_polygon = new google.maps.Polygon({
//         paths: vertices,
//         strokeColor: '#FF0000',
//         strokeOpacity: 0.8,
//         strokeWeight: 3,
//         fillColor: '#FF0000',
//         fillOpacity: 0.35
//     });
//     boundary_polygon.setMap(map);
// }
