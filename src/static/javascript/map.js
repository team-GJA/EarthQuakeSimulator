//leaflet OSM map
function init() {

  var map = L.map('map_elemnt')
    .setView([35.681382, 139.766084], 15);

  L.gridLayer.googleMutant({
    type: 'hybrid'
  }).addTo(map);

  L.marker([35.681382, 139.766084])
    .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    .openPopup()
    .addTo(map);
}
