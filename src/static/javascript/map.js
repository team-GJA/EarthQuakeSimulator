//leaflet OSM map
var map = L.map('map_elemnt')
  .setView([35.681382, 139.766084], 15);

L.gridLayer.googleMutant({
  type: 'hybrid'
}).addTo(map);


var marker = L.marker([35.681382, 139.766084])
  .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
  .openPopup()
  .addTo(map);

var popup = L.popup();
function onMapClick(e) {
  marker.setLatLng(e.latlng)
    .bindPopup("You clicked the map at " + e.latlng.toString())
    .openPopup()
}

map.on('click',onMapClick);
