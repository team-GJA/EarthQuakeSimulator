$(function(){
  $('body').bootstrapMaterialDesign();
});

//title animation
$(document).ready(function(){
  mapLoadCallBack(
    function(){
      setTimeout(function(){
        $("#title").animate({
          opacity: 0
        },
          1000,
          "swing",
          function(){$("#title").detach()}
        )
      },
        500
      );
    }
  );
});

//init and set map
var map = L.map('map_elemnt',{
        minZoom: 3,
        maxZoom: 20
    })
  .setView([35.681382, 139.766084], 3).setMaxBounds([[-360,0],[360,360]]);

function mapLoadCallBack(callback){
  L.gridLayer.googleMutant({
    type: 'hybrid'
  }).addTo(map);
  callback();
}


$.getJSON("../static/json/plate.json", function (data) {
  L.geoJson(data, {
    style:{
      color:"#ff0000",
      opacity:0.3
    }
  }).addTo(map);
});

map.on('click',onMapClick);

//define popup contents
var obspopup = "<h4>set the observation marker here?</h4>"+
"<p class=\"text-warning\">Auto mode: run simuration as auto set epicenter and Magnitude.</p>"+
  "<p><button class=\"btn btn-default\" id=\"obscancel\" onclick=\"deleteObsMarker()\">CANCEL</button>"+
  "<button class=\"btn btn-default\" id=\"obsok\" onclick=\"setEpiMarker()\">OK</button>"+
"<button class=\"btn btn-default btn-warning pull-right\" id=\"obsrun\" onclick=\"postJsonAutomode()\">Auto mode Run!</button></p>";


var epipopup = "<h4>set the epicenter marker here?</h4>"+
  "<br><button class=\"btn btn-default\" id=\"epicancel\" onclick=\"deleteEpiMarker()\">CANCEL</button>"+
  "<button class=\"btn btn-default\" id=\"epiok\" onclick=\"setEQParam()\">OK</button>";

var parampopup = "<h4>set Magnitude and Depth</h4>"+
  "<br><h5>Magnitude(Mj)</h5>"+
  "<div id=\"mag-slider\" class=\"slider\"></div><input id=\"mag-input\"></input><br>"+
  "<button class=\"btn btn-default\" id=\"paramcancel\" onclick=\"resetEpiMarker()\">CANCEL</button>"+
  "<button class=\"btn btn-default btn-warning\" id=\"paramrun\" onclick=\"postJsonManualmode()\">Run!</button>";


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

var  obsMarker = L.marker([],{icon: obsIcon}).bindPopup(obspopup);
var  epiMarker = L.marker([],{icon: epiIcon}).bindPopup(epipopup);
var  isSetEpiMarker = false;

// L.circle([35.681,139.763], {
//   opacity: 0,
//   fillColor: '#0000ff',
//   fillOpacity: 0.7,
//   radius: 10000000,
//   fillRule:"nonzero"
// }).addTo(map);
//
// L.circle([35.681,139.763], {
//   opacity: 0,
//   fillColor: '#FF0000',
//   fillOpacity: 0.7,
//   radius: 5000000
// }).addTo(map);

function onMapClick(e) {
  if(!isSetEpiMarker){
    obsMarker.remove();
    obsMarker.setLatLng(e.latlng)
      .bindPopup(obspopup,{maxWidth:800})
      .addTo(map).openPopup();
  }else{
    epiMarker.remove();
    epiMarker.setLatLng(e.latlng)
      .bindPopup(epipopup,{maxWidth:800})
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
  epiMarker.bindPopup(epipopup,{maxWidth:800});
}

function setEQParam() {
  var magSlider, depSlider, magInput, depInput;
  epiMarker.bindPopup(parampopup,{maxWidth:800}).openPopup();
  setSlider(magSlider, magInput, 'mag', [5,1,9]);
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

