/**
 * JavaScript to produce a map of csv data
 * 
 * freely based on from (c) Ralph Straumann, www.ralphstraumann.ch, 2014
 * Questions: milo@codefor.nl
 * 
 */
var maptype = "world"; // or "mapbox"

/**
 * set gets filled after reading all the data_records. and is used to color the worldmap.
 * I intend to use a full ramp, but am working out how to do that.
 */
var dataset = {};

$(document).ready(function () {
    var map = setMap(maptype);
    getData(map);

});

/**
 * Retrieve the geodata_records via AJAX call to local CSV file
 * @param {*} map 
 */
function getData(map) {
    $.ajax({
        type: 'GET',
        dataType: 'text',
        /**
         * The url should be replaced by a maintained source and may also be changed to a
         * url that produces geojson which would mean this script would have to be
         * rewritten slightly
         */
        //url: 'http://www.ralphstraumann.ch/projects/geohipster-map/user_geotable.csv',
        url: './data/data_table.csv',
        error: function () {
            alert('Data loading didn\'t work, unfortunately.');
        },
        success: function (response) {
            csv = readCSV(response);
            //markers = new L.MarkerClusterGroup();
            //markers.addLayer(csv);
            //map.addLayer(markers);
        },
        complete: function () {
            console.log('Data loading complete.');
        }
    });
}

/**
 * Transform CSV file into Leaflet Layer
 * @param {*} csv 
 */
function readCSV(csv) {
    var data_records = L.geoCsv(null, {
        onEachFeature: function (feature) {
            dataset[feature.properties.municipality] = dataset[feature.properties.municipality] ? dataset[feature.properties.municipality] + 1 : 1;
        },
        // TODO needs to be changed to a function where the attribute is added to a municipality geometry
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng);
        },
        firstLineTitles: true,
        fieldSeparator: ';'
    });
    data_records.addData(csv);
    console.log(dataset);
    //if (maptype === "mapbox") {
        mapboxMap(map);
    //} else {
        worldMap(map);
    //}
    return data_records;
}

/**
 * Initialize the map
 */
function setMap(type) {
    // Set up the map
    map = new L.Map('map', {
        center: [52, 5],
        zoom: 8,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false
    });

    return map;
}

/**
 * Load Mapbox base layer
 * @param {*} map 
 */
function mapboxMap(map) {
    var mapbox_token = 'pk.eyJ1IjoibWlibG9uIiwiYSI6ImNrMGtvajhwaDBsdHQzbm16cGtkcHZlaXUifQ.dJTOE8FJc801TAT0yUhn3g';
    L.tileLayer(
        'https://api.mapbox.com/styles/v1/mapbox/emerald-v8/tiles/{z}/{x}/{y}?access_token=' + mapbox_token, {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

function worldMap(map, max = 100) {

    function zoomToFeature(e) {
        var layer = e.target;
        map.fitBounds(layer.getBounds());
    }

    function resetHighlight(e) {
        var layer = e.target;
        worldLayer.resetStyle(layer);
    }

    function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            color: '#f00',
            fillColor: '#0f0',
            fillOpacity: .5
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }
    function worldStyle() {
        return {
            fillColor: '#ccc',
            weight: 1,
            opacity: 1,
            color: '#7d7b6d',
            fillOpacity: .2
        };
    };

    $.getJSON('./data/gemeentegrenzen_simplified.geojson', function (response) {
        worldLayer = L.geoJSON(response, { style: worldStyle, onEachFeature: onEachFeature }).addTo(map);
    });

}