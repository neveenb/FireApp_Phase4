
// When clicking on home, it will take you to the homepage.
document.getElementById("home").onclick = function () {
    window.location.assign("/html/homepage.html")
};

// When clicking on home, it will take you to the city map view.
document.getElementById("map").onclick = function () {
    window.location.assign("/html/citymap.html")
};

// When clicking on home, it will take you to the fire trucks in action.
document.getElementById("trucks").onclick = function () {
    window.location.assign("/html/trucks.html")
};

// When clicking on home, it will take you to the alerts page where you view incoming alerts.
document.getElementById("alerts").onclick = function () {
    window.location.assign("/html/alert.html")
};

// On click logout button will logout the current user 
$('#logout').click((event) => {
    $.ajax({
        url: 'http://localhost:8080/api/logout',
        type: "get",
        success: function (data) {
            if(data.msg){
                console.log(data.msg);
            }else
                location.assign('http://localhost:8080/home');
        }
    })
})