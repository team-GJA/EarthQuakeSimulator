$(document).ready(function(){
  $.material.init();
});
//init and set map
var map = L.map('map_elemnt')
  .setView([35.681382, 139.766084], 15);

L.gridLayer.googleMutant({
  type: 'hybrid'
}).addTo(map);


//define popup contents
var obspopup = "<p class=\"popup\">set the observation marker here?</p>"+
  "<button class=\"btn btn-default\" id=\"obscancel\" onclick=\"deleteObsMarker()\">CANCEL</button>"+
  "<button class=\"btn btn-default\" id=\"obsok\" onclick=\"setEpiMarker()\">OK</button>";

var epipopup = "<p class=\"popup\">set the epicenter marker here?</p>"+
  "<button class=\"btn btn-default\" id=\"epicancel\" onclick=\"deleteEpiMarker()\">CANCEL</button>"+
  "<button class=\"btn btn-default\" id=\"obsok\" onclick=\"setEQParam()\">OK</button>";

var parampopup = "<p class=\"popup\">set Magnitude and Depth</p>"+
  "<p>Magnitude(Mj)</p>"+
  "<div id=\"mag-slider\" class=\"slider\"></div><input id=\"mag-input\"></input><br>"+
  "<p>Depth(km)</p>"+
  "<div id=\"dep-slider\" class=\"slider shor slider-material-orange\"></div><input id=\"dep-input\"></input><br>"+
  "<button class=\"btn btn-default\" id=\"paramcancel\" onclick=\"resetEpiMarker()\">CANCEL</button>"+
  "<button class=\"btn btn-default\" id=\"paramok\" onclick=\"\">OK</button>";


//define marker object
var obsIcon = L.icon({
      iconUrl: '../static/img/obsmarker.png',
      iconSize: [110, 110*1.23],
      iconAnchor: [55, 110*1.23],
      popupAnchor: [0, -110*1.23],
      shadowUrl: '../static/img/obsmarker_shadow.png',
      shadowSize: [250, 250*0.33],
      shadowAnchor: [60, 200*0.33]
});

var epiIcon = L.icon({
      iconUrl: '../static/img/epimarker.png',
      iconSize: [110, 110*1.23],
      iconAnchor: [55, 110*1.23],
      popupAnchor: [0, -110*1.23],
      shadowUrl: '../static/img/epimarker_shadow.png',
      shadowSize: [250, 250*0.33],
      shadowAnchor: [60, 200*0.33]
});

var  obsMarker = L.marker([35.681382, 139.766084],{icon: obsIcon}).bindPopup(obspopup);
var  epiMarker = L.marker([35.681382, 139.766084],{icon: epiIcon}).bindPopup(epipopup);
var  isSetEpiMarker = false;


var onMapClick = function(e) {
  if(!isSetEpiMarker){
    obsMarker.remove();
    obsMarker.setLatLng(e.latlng)
      .bindPopup(obspopup)
      .addTo(map).openPopup();
  }else{
    epiMarker.remove();
    epiMarker.setLatLng(e.latlng)
      .bindPopup(epipopup)
      .addTo(map).openPopup();
  }
}

map.on('click',onMapClick);

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

function setEQParam() {
  var magSlider, depSlider, magInput, depInput;
  epiMarker.bindPopup(parampopup).openPopup();
  setSlider(magSlider, magInput, 'mag', [5,1,9]);
  setSlider(depSlider, depInput, 'dep', [100,10,900]);

}

function setSlider(slider, input, id, range) {
  slider = document.getElementById(id+'-slider');
  input = document.getElementById(id+'-input');

  noUiSlider.create(slider,{
    connect:"lower",
    start: range[0],
    range: {
      'min': range[1],
      'max': range[2]
    }
  });

  slider.noUiSlider.on('update', function( values, handle ) {
    input.value = values[handle];
  });

  input.addEventListener('change', function(){
    slider.noUiSlider.set(this.value);
  });
}

