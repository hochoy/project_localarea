function loadsample(){
  geocoder_response = {
      "queryAddress": "3553 mayfair avenue",
      "searchTimestamp": "2017-04-16 18:19:45.353",
      "executionTime": 1.041,
      "version": "3.0.0",
      "srsCode": 4326,
      "echo": "true",
      "interpolation": "adaptive",
      "locationDescriptor": "any",
      "setBack": "0",
      "minScore": 1,
      "maxResults": 1,
      "disclaimer": "http:\/\/www2.gov.bc.ca\/gov\/admin\/disclaimer.page",
      "privacyStatement": "http:\/\/www2.gov.bc.ca\/gov\/admin\/privacy.page",
      "copyrightNotice": "Copyright \u00A9 2016, Province of British Columbia - Open Government License",
      "copyrightLicense": "http:\/\/www2.gov.bc.ca\/gov\/content\/governments\/about-the-bc-government\/databc\/open-data\/open-government-license-bc",
      "type": "FeatureCollection",
      "crs": {
          "type": "EPSG",
          "properties": {
              "code": 4326
          }
      },
      "features": [{
          "type": "Feature",
          "geometry": {
              "type": "Point",
              "crs": {
                  "type": "EPSG",
                  "properties": {
                      "code": 4326
                  }
              },
              "coordinates": [-123.1837892, 49.2371317]
          },
          "properties": {
              "fullAddress": "3553 Mayfair Ave, Vancouver, BC",
              "score": 89,
              "matchPrecision": "CIVIC_NUMBER",
              "precisionPoints": 100,
              "faults": [{
                  "element": "LOCALITY",
                  "fault": "missing",
                  "penalty": 10
              }, {
                  "element": "PROVINCE",
                  "fault": "missing",
                  "penalty": 1
              }],
              "siteName": "",
              "unitDesignator": "",
              "unitNumber": "",
              "unitNumberSuffix": "",
              "civicNumber": 3553,
              "civicNumberSuffix": "",
              "streetName": "Mayfair",
              "streetType": "Ave",
              "isStreetTypePrefix": "false",
              "streetDirection": "",
              "isStreetDirectionPrefix": "",
              "streetQualifier": "",
              "localityName": "Vancouver",
              "localityType": "City",
              "provinceCode": "BC",
              "locationPositionalAccuracy": "high",
              "locationDescriptor": "parcelPoint",
              "siteID": "091583d3-aad5-4857-9e9d-b8cd3b793623",
              "blockID": 103294,
              "fullSiteDescriptor": "",
              "accessNotes": "",
              "siteStatus": "active",
              "siteRetireDate": "Fri Dec 31 00:00:00 PST 9999",
              "changeDate": "2016-09-07",
              "isPrimary": true
          }
      }]
  };
  geocoder_query = geocoder_response.queryAddress;
  geocoder_coordinate = geocoder_response.features[0].geometry.coordinates;
  console.log(geocoder_coordinate);
}
