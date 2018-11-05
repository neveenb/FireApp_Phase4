// On the click of the login button, if username and password are a match, it will successfully login the user.
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

