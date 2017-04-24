//init and set map
var map = L.map('map_elemnt')
  .setView([35.681382, 139.766084], 15);

L.gridLayer.googleMutant({
  type: 'hybrid'
}).addTo(map);

var obspopup = "<p class=\"popup\">set the observation marker here?</p>"+
  "<button id=\"obscancel\" onclick=\"deleteObsMarker()\">CANCEL</button>"+
  "<button id=\"obsok\" onclick=\"setEpiMarker()\">OK</button>";

var epipopup = "<p class=\"popup\">set the epicenter marker here?</p>"+
  "<button id=\"epicancel\" onclick=\"deleteEpiMarker()\">CANCEL</button>"+
  "<button id=\"obsok\" onclick=\"setParam()\">OK</button>";

var parampopup = "<p class=\"popup\">set Magnitude and Depth</p>"+
  "<button id=\"paramcancel\" onclick=\"resetEpiMarker()\">CANCEL</button>"+
  "<button id=\"paramok\" onclick=\"setParam()\">OK</button>";


//define marker object
var obsMarker = L.marker().bindPopup(obspopup);
var epiMarker = L.marker().bindPopup(epipopup);
var isSetEpiMarker = false;

var onMapClick = function(e) {
  if(!isSetEpiMarker){
    obsMarker.setLatLng(e.latlng)
      .addTo(map).openPopup();
  }else{
    epiMarker.setLatLng(e.latlng)
      .addTo(map).openPopup();
  }
}


function deleteObsMarker() {
  obsMarker.remove();
  isSetEpiMarker = false;
}

function setEpiMarker() {
  isSetEpiMarker = true;
  obsMarker.closePopup();
}

function deleteEpiMarker() {
  epiMarker.remove();
  isSetEpiMarker = true;
}

function resetEpiMarker(){
  epiMarker.remove();
  epiMarker.bindPopup(epipopup);
}

function setParam() {
  epiMarker.bindPopup(parampopup).openPopup();
}

map.on('click',onMapClick);
