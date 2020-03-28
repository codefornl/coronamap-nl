/**
 * JavaScript to produce a map of csv data
 *
 * freely based on from (c) Ralph Straumann, www.ralphstraumann.ch, 2014
 * also see: https://leafletjs.com/examples/choropleth/
 * Questions: milo@codefor.nl
 *
 */
$(document).ready(function () {
    var map = setMap();
    mapboxMap(map);
    $.getJSON('https://kapulara.github.io/COVID-19-NL/Municipalities/json/files.json', function (files) {
        var dateSelect = $('#datum-select');
        var index = 0;
        window.files = [];
        for (let fileName of files) {
            fileName = fileName.split('-latest.json').join('');
            window.files.push(fileName);
            if ( index === files.length ) {
                dateSelect.append('<option value="' + fileName + '">' + fileName + '</option>');
            } else {
                dateSelect.append('<option value="' + fileName + '" selected=selected>' + fileName + '</option>');
            }
            index++;
        }
        //console.log(files);

        window.map = map;
        $('#datum-select').change(onChange);
        addTheme(map);

        $('#previous').click(previousClick);
        $('#next').click(nextClick);
        $('#start').click(startClick);
        $('#play').click(playClick);
    });
});

Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) {
        s = '0' + s;
    }
    return s;
};

var labelLayer = L.layerGroup();
var regionsLayer;
var themeLayer;
var interval;
var isPlaying = false;

function playClick() {
    clearInterval(interval);
    if(isPlaying) {
        isPlaying = false;
        return;
    }

    var dateSelect = $('#datum-select');
    startClick();

    isPlaying = true;
    interval = setInterval(function () {
        var currentIndex = window.files.indexOf(dateSelect.val());
        if ( canGoNext(currentIndex) ) {
            nextClick();
        } else {
            isPlaying = false;
            clearInterval(interval);
        }
    }, 1500);
}

function startClick() {
    var dateSelect = $('#datum-select');
    var firstFile = window.files[ 0 ];
    dateSelect.val(firstFile);
    onChange();
}

function canGoPrevious(currentIndex) {
    return (currentIndex - 1) >= 0;
}

function canGoNext(currentIndex) {
    return currentIndex + 1 <= (window.files.length - 1);
}

function updateButtons() {
    var dateSelect = $('#datum-select');
    var currentIndex = window.files.indexOf(dateSelect.val());

    //console.log((currentIndex - 1) > 0, (currentIndex - 1));
    $('#previous').prop('disabled', !canGoPrevious(currentIndex));
    $('#next').prop('disabled', !canGoNext(currentIndex));
}

function previousClick() {
    var dateSelect = $('#datum-select');

    var currentIndex = window.files.indexOf(dateSelect.val());
    var nextIndex = currentIndex - 1;

    if ( canGoPrevious(currentIndex) ) {
        dateSelect.val(window.files[ nextIndex ]);
        onChange();
    } else {
        return;
    }

    updateButtons();
}

function nextClick() {
    var dateSelect = $('#datum-select');

    var currentIndex = window.files.indexOf(dateSelect.val());
    var nextIndex = currentIndex + 1;

    if ( canGoNext(currentIndex) ) {
        dateSelect.val(window.files[ nextIndex ]);
        onChange();
    } else {
        return;
    }

    updateButtons();
}

function onChange() {
    window.map.removeLayer(themeLayer);
    labelLayer.clearLayers();
    addTheme(map); // fixme: doesn't need to reload the data
    updateButtons();
}

/**
 * Initialize the map
 */
function setMap() {
    return new L.Map('map', {
        center: [ 52, 5 ],
        zoom: 8,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: false
    });
}


// get color depending on population density value
function getColor(d) {
    return d > 4096 ? '#800026' :
        d > 1024 ? '#BD0026' :
            d > 256 ? '#E31A1C' :
                d > 64 ? '#FC4E2A' :
                    d > 16 ? '#FD8D3C' :
                        d > 4 ? '#FEB24C' :
                            d > 1 ? '#FED976' :
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
            weight: 2,
            opacity: 1
        });

        if ( !L.Browser.ie && !L.Browser.opera && !L.Browser.edge ) {
            layer.bringToFront();
        }
    }

    function onEachThemeFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });

        if(!feature.properties) {
            return
        }

        var aantal = feature.properties.Aantal;
        if ( aantal > 0 ) {
            L.marker(layer.getBounds().getCenter(), {
                icon: L.divIcon({
                    className: 'label',
                    html: aantal
                })
            }).addTo(labelLayer);
        }
    }

    function regionStyle() {
        var data = {
            weight: 1,
            opacity: 0.5,
            color: '#f00',
            fillOpacity: 0
        };
        return data;
    }

    function themeStyle(e) {
        if(!e.properties) {
            return
        }

        var value = e.properties.Aantal;
        var data = {
            weight: 1,
            opacity: 0.1,
            color: '#555',
            fillOpacity: 0
        };
        if ( value ) {
            data.fillColor = getColor(value);
            data.fillOpacity = 0.5;
        }
        return data;
    }

    function tryFromCache(url, func) {
      if (!window.cache) window.cache = {};
      if (!window.cache[url]) {
        $.getJSON(url, function (data) {
          window.cache[url] = data;
          func(JSON.parse(JSON.stringify(data)));
        });
      } else {
        var data = window.cache[url];
        func(JSON.parse(JSON.stringify(data)));
      }
    }

    tryFromCache('./data/gemeentegrenzen_simplified.geojson', function (mapdata) {

        tryFromCache('./data/veiligheidsregios_simplified.geojson', function (regions) {
            tryFromCache('https://kapulara.github.io/COVID-19-NL/Municipalities/json/' + $('#datum-select').val() + '-latest.json', function (selectedData) {
                let mappedData = {};
                $(selectedData).each(function (i, data) {
                    mappedData[ data[ 'Gemnr' ] ] = data;
                });

                $(mapdata.features).each(function (i, feature) {
                    feature.properties = mappedData[ feature.properties.Code ];
                });

                regionsLayer = L.geoJSON(regions, {
                    style: regionStyle
                }).addTo(map);

                themeLayer = L.geoJSON(mapdata, {
                    style: themeStyle,
                    onEachFeature: onEachThemeFeature
                }).addTo(map);

                labelLayer.addTo(map);
            });
        });
    });

}
