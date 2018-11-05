var map;
var destinationMarkerLocation;
var destinationMarker;
var hydrants = {};

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: new google.maps.LatLng(25.311984, 55.490568),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    var iconBase = 'http://localhost:8080/img/';
    var icons = {
        fireplace: {
            icon: iconBase + 'fire.png',//fire incident place

        },
        hydrant: {
            icon: iconBase + 'fire-hydrant.png',

        },
        firetruck: {
            icon: iconBase + 'truck-lighting.png',

        }
    };

    var locations = null;

    var infowindow = new google.maps.InfoWindow();

    var hydrantsLocation;
    var hydrantsCondition;
    var firetrucksLocation;
    var firetrucksMen;

    $.get('http://localhost:8080/api/listAllHydrant', (data) => {

        hydrantsLocation = data;
        var marker, i;

        var features = [
            {
                position: new google.maps.LatLng(25.311800, 55.497746),
                type: 'firetruck',
                name: 'firetruck1'
            }, {
                position: new google.maps.LatLng(25.311704, 55.484715),
                type: 'firetruck',
                name: 'firetruck2'
            },
            {
                position: new google.maps.LatLng(25.319976, 55.498566),
                type: 'firetruck',
                name: 'firetruck3'
            }
        ];

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

        // Create markers.

        features.forEach(function (feature) {
            var marker = new google.maps.Marker({
                position: feature.position,
                icon: icons[feature.type].icon,
                map: map
            });

            var name = new google.maps.InfoWindow({
                content: feature.name
            });
            if (feature.type === 'hydrant') {

                google.maps.event.addListener(marker, 'click', function () {
                    $('#myModal').css('display', 'block');
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

            google.maps.event.addListener(marker, 'mouseover', function () {
                // infowindow.setContent(feature.name);
                this.info = name;
                this.info.open(this.getMap(), this);
            });

            google.maps.event.addListener(marker, 'mouseout', function () {
                // infowindow.setContent(feature.name);
                this.info.close();
                this.info = undefined;
            });



        });



    });

}

function findHydrant() {

    var query = document.getElementById("search_field").value;

    var cleanedQuery = query.replace(/\s/g, "").toLowerCase();
    if (destinationMarker) {
        destinationMarker.setMap(null);
        destinationMarker
    }
    destinationMarkerLocation = hydrants[cleanedQuery];

    if (destinationMarkerLocation) {
        destinationMarker = new google.maps.Marker({
            position: destinationMarkerLocation,
            animation: google.maps.Animation.BOUNCE
        });
        destinationMarker.setMap(map);
        map.setCenter(destinationMarker.getPosition())
    }

}