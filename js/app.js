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
    addTheme(map);
});

Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}


var themeLayer;
var themeField = "COVID 13-03";
/**
 * Initialize the map
 */
function setMap() {
    return new L.Map('map', {
        center: [52, 5],
        zoom: 8,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false
    });
}


// get color depending on population density value
function getColor(d) {
    return d > 50 ? '#800026' :
            d > 40  ? '#BD0026' :
            d > 30 ? '#E31A1C' :
            d > 20  ? '#FC4E2A' :
            d > 10   ? '#FD8D3C' :
            d > 5   ? '#FEB24C' :
            d > 1   ? '#FED976' :
                        '#FFEDA0';
}
/**
 * Load Mapbox base layer
 * @param {*} map 
 */
function mapboxMap(map) {
    var mapbox_token = 'pk.eyJ1IjoibWlibG9uIiwiYSI6ImNrMGtvajhwaDBsdHQzbm16cGtkcHZlaXUifQ.dJTOE8FJc801TAT0yUhn3g';
    L.tileLayer(
        'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=' + mapbox_token, {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

function formatDate(){
    var temp = new Date("2020-03-13");
    var mydate = temp.getDate().pad(2).toString() + '-' + (temp.getMonth()+1).pad(2).toString() + '-' + temp.getFullYear().toString()
    console.log(mydate);
    return mydate;
}

function getMatch(code, targetdata) {
    return targetdata.filter(function (data) {
        return data.GemeentecodeGM == code;
    })
}

function addTheme(map) {

    function zoomToFeature(e) {
        var layer = e.target;
        map.fitBounds(layer.getBounds());
    }

    function resetHighlight(e) {
        var layer = e.target;
        themeLayer.resetStyle(layer);
    }

    function highlightFeature(e) {
        var layer = e.target;
        layer.setStyle({
            //fillColor: getColor(layer),
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
    function worldStyle(e) {
        return {
            fillColor: getColor(e.properties[formatDate()]),
            weight: 1,
            opacity: 0.1,
            color: '#fff',
            fillOpacity: .2
        };
    };

    $.getJSON('./data/gemeentegrenzen_simplified.geojson', function (mapdata) {
        $.getJSON('./data/covid_13_03.json', function (themedata) {
            // Update the municipalities with the values from the json file.
            for (var i = 0; i < mapdata.features.length; i++) {
                var matchdata = getMatch(mapdata.features[i].properties.Code, themedata)
                if(matchdata){
                    mapdata.features[i].properties = matchdata[0];
                }
                
                //find the covid entry for this municipality and add it to the properties.
            }
            themeLayer = L.geoJSON(mapdata, { style: worldStyle, onEachFeature: onEachFeature }).addTo(map);
        });



    });

}