$("button#update").click(function() {
    var button = $(this);
    button.attr("disabled", true);

    // 各フィールドから値を取得してJSONデータを作成
    var data = {
      observation: {lat: 37.7664995, long: 141.0643965 },
      epicenter: {lat: 36.0995126, long: 140.095151, magnitude:7.3 }
    };

    $.ajax({
        type:"post",
        url:"/path/to/post",
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
});
