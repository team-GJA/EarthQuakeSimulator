function postJsonManualmode() {
  var button = $(this);
  button.attr("disabled", true);

  var data = {
    observation: {pos: {lat: obsMarker.getLatLng().lat, lng: obsMarker.getLatLng().lng}},
    epicenter: {pos:{lat: epiMarker.getLatLng().lat, lng: epiMarker.getLatLng().lng}, mag:parseFloat($("#mag-input").val())}
  };
  console.log(data);
  $.ajax({
    type:"post",
    url:"/sim/manual",
    data:JSON.stringify(data),
    contentType: 'application/json',
    dataType: "json",
    success: function(json_data) {
      showResult(json_data);
    },
    error: function() {
      alert("Server Error. Pleasy try again later.");
    },
    complete: function() {
      button.attr("disabled", false);
    }
  });
};

function postJsonAutomode() {
  var button = $(this);
  button.attr("disabled", true);

  var data = {
    observation:{pos: {lat: obsMarker.getLatLng().lat, lng: obsMarker.getLatLng().lng}}
  };
  console.log(data);
  $.ajax({
    type:"post",
    url:"/sim/auto",
    data:JSON.stringify(data),
    contentType: 'application/json',
    dataType: "json",
    success: function(json_data) {
      showResult(json_data);
    },
    error: function() {
      alert("Server Error. Pleasy try again later.");
    },
    complete: function() {
      button.attr("disabled", false);
    }
  });
}
