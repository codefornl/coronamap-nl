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
  addTheme(map);
  $('#datum-select').change(function () {
    map.removeLayer(themeLayer);
    labelLayer.clearLayers();
    addTheme(map); // fixme: doesn't need to reload the data
  });
});

Number.prototype.pad = function (size) {
  var s = String(this);
  while (s.length < (size || 2)) { s = "0" + s; }
  return s;
}

var labelLayer = L.layerGroup();
var regionsLayer;
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

function formatDate() {
  var temp = new Date("2020-03-13");
  var mydate = temp.getDate().pad(2).toString() + '-' + (temp.getMonth() + 1).pad(2).toString() + '-' + temp.getFullYear().toString()
  return mydate;
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

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  }

  function onEachThemeFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
    var aantal = feature.properties.besmettingen['COVID ' + $('#datum-select').val()].aantal;
    if(aantal > 0) {
      L.marker(layer.getBounds().getCenter(), {
        icon: L.divIcon({
          className: 'label',
          html:  aantal
        })
      }).addTo(labelLayer);
    }
  }

  function regionStyle() {
    var data = {
      weight: 2,
      opacity: 1,
      color: '#f00',
      fillOpacity: 0
    };
    return data;
  };

  function themeStyle(e) {
    var value =
      e.properties.besmettingen['COVID ' + $('#datum-select').val()].aantal;
    var data = {
      weight: 1,
      opacity: 0.1,
      color: '#555',
      fillOpacity: 0
    };
    if (value) {
      data.fillColor = getColor(value);
      data.fillOpacity = 0.5;
    }
    return data;
  };

  function reindexBesmettingen(data) {
    var dates = [];
    for (var i in data) {
      if (i.match(/COVID [0-9]{2}\-[0-9]{2}/)) {
        dates.push({
          "datum": i,
          "aantal": data[i]
        });
        delete (data[i]);
      }
    }
    dates[0].toename = dates[0].aantal;
    for (var i = 1; dates[i]; i++) {
      dates[i].toename = dates[i].aantal - dates[i - 1].aantal;
    }
    for (var i in dates) {
      dates[dates[i].datum] = dates[i];
      delete (dates[i]);
    }
    return dates;
  }

  $.getJSON('./data/gemeentegrenzen_simplified.geojson', function (mapdata) {
    $.getJSON('./data/veiligheidsregios_simplified.geojson', function (regions) {
      $.getJSON('./data/covid_16_03.json', function (themedata) {
        var besmettingsData = []; // indexed map for quick lookup
        $(themedata).each(function (i, data) {
          data["besmettingen"] = reindexBesmettingen(data);
          besmettingsData[data.GemeentecodeGM.replace(/GM0*/, '')] = data;
        });
        $(mapdata.features).each(function (i, feature) {
          feature.properties = besmettingsData[feature.properties.Code];
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
