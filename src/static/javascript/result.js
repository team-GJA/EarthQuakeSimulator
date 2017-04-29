function showResult(json_data){
  console.log(json_data);

  map.off("click");
  obsMarker.closePopup().unbindPopup();
  epiMarker.closePopup().unbindPopup();
  console.log(epiMarker.getLatLng());

  var epicenterPos = [epiMarker.getLatLng().lat, epiMarker.getLatLng().lng]
  // var seismicIntensityColor = ["#8ec420","#b5d20e","#d6e000","#f0ea00","#f7d600","#f2ad00","#ed8403","#e8510f","#e60013"]
  var seismicIntensityColor = ["#8ec420","#b5d20e","#d6e000","#f0ea00","#f2ad00","#e8510f","#e60013"]

  if(!epiMarker.getLatLng()){
    epiMarker.setLaLng(epicenterPos);
  }

  for(var i=0;i<8;i++){
    if(json_data.Scaleranges[i] != 0){
      L.circle(epicenterPos, {
        opacity: 0,
        fillColor: seismicIntensityColor[i],
        fillOpacity: 0.3,
        radius: json_data.Scaleranges[i]*1000,
        fillRule:"inherit"
      }).addTo(map);
    }
  }
}
