var circleArray = new Array();
function showResult(json_data){
  console.log(json_data);

  map.off("click");
  obsMarker.closePopup().unbindPopup();
  epiMarker.closePopup().unbindPopup();

  var epicenterPos = [json_data.Epicenter.lat, json_data.Epicenter.lng];
  console.log(epicenterPos);
  var seismicIntensityColor = ["#8ec420","#b5d20e","#d6e000","#f0ea00","#f7d600","#f2ad00","#ed8403","#e8510f","#e60013"]

    epiMarker.setLatLng(epicenterPos).addTo(map);

  for(var i=0;i<9;i++){
    if(json_data.Scaleranges[i] != 0){
      var circle =  L.circle(epicenterPos, {
        opacity: 0,
        fillColor: seismicIntensityColor[i],
        fillOpacity: 0.3,
        radius: json_data.Scaleranges[i]*1000,
        fillRule:"inherit"
      }).addTo(map);
      circleArray.push(circle);
    }
  }

  obsMarker.bindPopup(
    "<p class=\"popupSeismic\">震度"+json_data.Scale+"の揺れを観測しました！</p>"+
    "<p class=\"popupTips\"> Tips:<br>"+json_data.Tips+"</p>"+
    "<button class=\"btn btn-default btn-warning\" id=\"paramrun\" onclick=\"restart()\">Restart</button>"
    ,{maxWidth:600}
  ).openPopup();
}

function restart(){
  for(i = 0, l = circleArray.length; i < l; i++){
    circleArray[i].remove();
  }
  isSetEpiMarker = false;
  obsMarker.remove();
  epiMarker.remove();
  map.on('click',onMapClick);
}
