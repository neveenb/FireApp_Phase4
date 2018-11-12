var map;
var destinationMarkerLocation;
var destinationMarker;
var hydrants = {};
//Creates the function that gets map through ID from google maps
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: new google.maps.LatLng(25.311984, 55.490568),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    // Locate image resource to find list of marker images through the initialization of a localhost
    var iconBase = 'http://localhost:8080/img/';
    var icons = {
        fireplace: {
            icon: iconBase + 'fire.png',//fire incident place

        },
        hydrant: {
            icon: iconBase + 'fire-hydrant.png', //fire hydrant place marker icon initialized

        },
        firetruck: {
            icon: iconBase + 'truck-lighting.png', //fire truck place marker icon initialized

        }
    };

    var locations = null;
    //default pop up window created in the google maps
    var infowindow = new google.maps.InfoWindow();

    var hydrantsLocation;
    var hydrantsCondition;
    var firetrucksLocation;
    var firetrucksMen;
    //GETing database info about the list of fire hydrants and setting up function  
    $.get('http://localhost:8080/api/listAllHydrant', (data) => {
        //put data in hydrant location spot
        hydrantsLocation = data;
        var marker, i;
        var features = [];
        //for each hydrant icon location  initalized, database info such the name, position, temperature, pressure and 
        //condition are pushed into data objects for accessibility
        //type refers to the hydrant icon initialized

        hydrantsLocation.forEach(data => {
            features.push({
                name: data.name,
                position: new google.maps.LatLng(data.lat, data.lng),
                temperature: data.temperature,
                pressure: data.pressure,
                condition: data.condition,
                type: 'hydrant'
            });
            hydrants[data.name] = new google.maps.LatLng(data.lat, data.lng);
        })
        //GETing database info from the local server(localhost) which retrieves info such as the firetruck numbers
        //Hovering over each each firetruck info, info such as age, ID, heartrate 
        //pushing data into the variables
        $.get('http://localhost:8080/api/listAllTrucks', (data) => {
            // debugger
            data.forEach(firetruck => {
                features.push({
                    name: firetruck.name,
                    position: new google.maps.LatLng(firetruck.lat, firetruck.lng),
                    type: 'firetruck',
                    firemen: firetruck.firemen
                })
            });

            // Create markers.
            // Create new instance of markers for each position for type of icon and position them according to longitude and latitude given above
            features.forEach(function (feature) {
                var marker = new google.maps.Marker({
                    position: feature.position,
                    icon: icons[feature.type].icon,
                    map: map
                });

                var name = new google.maps.InfoWindow({
                    content: feature.name
                });
                //if feature type is a firetruck icon the following is initilized
                if (feature.type === 'firetruck') {
                    //Addeventlistener placed when you click a certain icon (Marker)
                    google.maps.event.addListener(marker, 'click', function () {
                        $('#myModal').css('display', 'block');
                        //display firemen info through the JSON file which has the database info from firemen
                        $("#modalTitle").html("Fire Truck Information")
                        $('#hydrantInfo').html(`Firemen: <br><br>`);
                        feature.firemen.forEach(man => {
                            $("#hydrantInfo").append(`Name: ${man.name}<br>
                            Age: ${man.age}<br>
                            HeartRate: ${man.heartrate}<br><br>`);
                        });
                        var span = document.getElementsByClassName("close")[0];
                        // When the user clicks on <span> (x), close the modal
                        span.onclick = function () {

                            $('#myModal').css('display', 'none');
                        }

                        // When the user clicks anywhere outside of the modal, close it
                        window.onclick = function (event) {
                            if (event.target == document.getElementById('myModal')) {
                                $('#myModal').css('display', 'none');
                            }
                        }
                    });
                }
                //if feature type is a hydrant icon the following is initilized
                if (feature.type === 'hydrant') {
                    //Addeventlistener placed when you click a certain icon (Marker)
                    google.maps.event.addListener(marker, 'click', function () {
                        //In this case, display modal box on google maps through jquery
                        $('#myModal').css('display', 'block');
                        $("#modalTitle").html("Hydrant Truck Information")
                        $('#hydrantInfo').html(`Temperature: ${feature.temperature}<br>Pressure: ${feature.pressure}<br>Condition: ${feature.condition}`);
                        var span = document.getElementsByClassName("close")[0];
                        // When the user clicks on <span> (x), close the modal
                        span.onclick = function () {
                            $('#myModal').css('display', 'none');
                        }

                        // When the user clicks anywhere outside of the modal, close it
                        window.onclick = function (event) {
                            if (event.target == document.getElementById('myModal')) {
                                $('#myModal').css('display', 'none');
                            }
                        }
                    });
                }
                //Addlistener event when hovering over marker images, display marker name of hydrant no
                google.maps.event.addListener(marker, 'mouseover', function () {
                    // infowindow.setContent(feature.name);
                    this.info = name;
                    //opening info box containing the hydrant or firetruck ID
                    this.info.open(this.getMap(), this);
                });
                //AddListener when mouseout function is called 
                google.maps.event.addListener(marker, 'mouseout', function () {
                    // infowindow.setContent(feature.name);
                    this.info.close();
                    this.info = undefined;
                });
            });
        })
    });
}

//search box utility to  find hydrants
function findHydrant() {

    var query = document.getElementById("search_field").value;
    //Replace unwanted or extra characters that may be present and converting to lowercase
    var cleanedQuery = query.replace(/\s/g, "").toLowerCase();
    if (destinationMarker) {
        destinationMarker.setMap(null);
        destinationMarker
    }
    //Each marker location placed for hydrants searched 
    destinationMarkerLocation = hydrants[cleanedQuery];
    //Setting up marker location position and pinpoint hydrant location specification
    if (destinationMarkerLocation) {
        destinationMarker = new google.maps.Marker({
            position: destinationMarkerLocation,
            animation: google.maps.Animation.BOUNCE
        });
        //Set destination marker and retrieve position
        destinationMarker.setMap(map);
        map.setCenter(destinationMarker.getPosition())
    }

}