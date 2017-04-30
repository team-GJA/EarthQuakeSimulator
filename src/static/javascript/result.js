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
    "<h2 class=\"text-danger\">震度"+json_data.Scale+"の揺れを観測しました！</h2>"+
    "<br><h6> Tips:<br>"+json_data.Tips+"</h6>"+
   "<br><a href=\"https://twitter.com/share\" data-size=\"large\" class=\"twitter-share-button\" data-url=\"http://hogehoge.com\" data-text=\"text\" data-hashtags=\"hashtag\">Tweet</a>"+
    "<br><button class=\"btn btn-default\" id=\"paramrun\" onclick=\"restart()\">Restart</button>"
    ,{maxWidth:600}
  ).openPopup();
  !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

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
