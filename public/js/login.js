
$("#loginbutton").click((event) => {
    console.log('Clicked');
    $.ajax({
        url: "http://localhost:8080/api/login",
        type: "post",
        data: {
            username: $('#username').val(),
            password: $('#password').val(),
        },
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        success: function (data) {
            location.assign(data);
        }
    })
})

