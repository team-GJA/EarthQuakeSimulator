//leaflet OSM map
function init() {

  var map = L.map('map_elemnt')
    .setView([35.681382, 139.766084], 15);

  var googlemap = new L.Google('HYBRID');
  map.addLayer(googlemap);

  L.marker([35.681382, 139.766084])
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup()
    .addTo(map);
}
