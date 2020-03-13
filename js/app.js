/**
 * JavaScript to produce a map of csv data
 * 
 * freely based on from (c) Ralph Straumann, www.ralphstraumann.ch, 2014
 * Questions: milo@codefor.nl
 * 
 */

$(document).ready(function () {
    var map = setMap();
    mapboxMap(map);
    getData(map);

});

function getData(map) {
    $.getJSON('./data/covid_13_03.json', function (response) {
        // Update the municipalities with the values from the json file.
        worldMap(map);
    });
}


/**
 * Initialize the map
 */
function setMap() {
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