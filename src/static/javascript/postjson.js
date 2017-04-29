function postJson() {
  var button = $(this);
  button.attr("disabled", true);

  var data = {
    observation: {lat: obsMarker.getLatLng().lat, long: obsMarker.getLatLng().lng},
    epicenter: {lat: epiMarker.getLatLng().lat, long: epiMarker.getLatLng().lng, magnitude:$("#mag-input").val()}
  };
  console.log(data);
  $.ajax({
    type:"post",
    url:"/json",
    data:JSON.stringify(data),
    contentType: 'application/json',
    dataType: "json",
    success: function(json_data) {
      if (!json_data[0]) {
        alert("Transaction error. " + json_data[1]);
        return;
      }
      location.reload();
    },
    error: function() {
      alert("Server Error. Pleasy try again later.");
    },
    complete: function() {
      button.attr("disabled", false);
    }
  });
};
