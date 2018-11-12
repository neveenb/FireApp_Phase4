// On the click of the login button, if username and password are a match, it will successfully login the user.

window.onload = function() {
    document.getElementById('password').onkeypress = function searchKeyPress(event) {
       if (event.keyCode == 13) {
           document.getElementById('loginbutton').click();
       }
   };

   $("#loginbutton").click((event) => {
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
        success: function (data, status) {
            if (status == 404) {
                alert("User Not Found")
            } else if (data == "WrongPassword")
                alert("Incorrect Password");
            else
                location.assign(data);
        }
    })
})
   
}
