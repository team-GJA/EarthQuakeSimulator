function postJsonManualmode() {
  var button = $(this);
  button.attr("disabled", true);

  var data = {
    observation:{pos: {lat: obsMarker.getLatLng().lat, long: obsMarker.getLatLng().lng}},
    epicenter: {pos:{lat: epiMarker.getLatLng().lat, long: epiMarker.getLatLng().lng}, mag:$("#mag-input").val()}
  };
  console.log(data);
  $.ajax({
    type:"post",
    url:"/sim/manual",
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

function postJsonAutomode() {
  var button = $(this);
  button.attr("disabled", true);

  var data = {
    observation:{pos: {lat: obsMarker.getLatLng().lat, long: obsMarker.getLatLng().lng}}
  };
  console.log(data);
  $.ajax({
    type:"post",
    url:"/sim/auto",
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
}
