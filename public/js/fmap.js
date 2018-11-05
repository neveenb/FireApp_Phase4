var map;

// creates the function that gets map through ID from google map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14,
    //Positioning center view for map
    center: new google.maps.LatLng(25.312506, 55.491425),
    mapTypeId: 'roadmap'
  });


  // locate image resource to find list of marker images
  var iconBase = 'http://localhost:8080/img/';
  var icons = {
    fireplace: {
      icon: iconBase + 'fire.png', //fire incident place icon initialized

    },
    hydrant: {
      icon: iconBase + 'fire-hydrant.png', //fire hydrant icon initialized

    },
    firetruck: {
      icon: iconBase + 'truck-lighting.png', //fire truck icon initialized

    }
  };

  // Features the Google Maps latitude and longitude locations where we have placed icon pictures on 
  // that specify each icon like fire truck, and fire hydrants 
  var features = [
    {
      position: new google.maps.LatLng(25.306932, 55.462102),
      type: 'hydrant'
    }, {
      position: new google.maps.LatLng(25.314245, 55.488068),
      type: 'hydrant'
    }, {
      position: new google.maps.LatLng(25.310626, 55.494592),
      type: 'hydrant'
    }, {
      position: new google.maps.LatLng(25.315069, 55.483008),
      type: 'hydrant'
    }, {
      position: new google.maps.LatLng(25.311704, 55.484715),
      type: 'firetruck'
    }, {
      position: new google.maps.LatLng(25.310579, 55.521831),
      type: 'hydrant'
    },
    {
      position: new google.maps.LatLng(25.293541, 55.447102),
      type: 'hydrant'
    }, {
      position: new google.maps.LatLng(25.274107, 55.470597),
      type: 'hydrant'
    }, {
      position: new google.maps.LatLng(25.311168, 55.492236),
      type: 'fireplace'
    }
  ];

  // Create markers on Google Maps.
  features.forEach(function (feature) {
    var marker = new google.maps.Marker({
      position: feature.position,
      icon: icons[feature.type].icon,
      map: map
    });

  });
}