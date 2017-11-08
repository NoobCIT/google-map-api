var map;
var markers = [];
function initMap() {
  var styles = [
    {
      featureType: 'water',
      stylers: [
        { color: '#19a0d8' }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.stroke',
      stylers: [
        { color: '#ffffff' },
        { weight: 6 }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        { color: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -40 }
      ]
    },{
      featureType: 'transit.station',
      stylers: [
        { weight: 9 },
        { hue: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'labels.icon',
      stylers: [
        { visibility: 'off' }
      ]
    },{
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [
        { lightness: 100 }
      ]
    },{
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        { lightness: -100 }
      ]
    },{
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        { visibility: 'on' },
        { color: '#f0e4d3' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -25 }
      ]
    }
  ];

  //Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.7749, lng: -122.4194},
    zoom: 13,
    styles: styles,
    mapTypeControl: false
  });
  var singleLatLng = {lat: 37.8059, lng: -122.4230};
  var singleLatLng_marker = new google.maps.Marker({
    position: singleLatLng,
    title: "Ghiradelli Square"
  });

  var single_window = new google.maps.InfoWindow();
  single_window.setContent('<div>' + singleLatLng_marker.title + ', ' + singleLatLng_marker.position + '</div>');

  singleLatLng_marker.addListener('click', function() {
    populateInfoWindow(singleLatLng_marker, single_window);
  });

  singleLatLng_marker.setMap(map);


  var locations = [
    {title: 'Coit Tower', location: {lat: 37.8024, lng: -122.4058}},
    {title: 'SF Museum of Modern Art', location: {lat: 37.7857, lng: -122.4011}},
    {title: 'Golden Gate Park', location: {lat: 37.7694, lng: -122.4862}},
    {title: 'Painted Ladies', location: {lat: 37.7763, lng: -122.4328}},
    {title: 'Palace of Fine Arts', location: {lat: 37.8020, lng: -122.4487}},
  ];

  var largeInfowindow = new google.maps.InfoWindow();

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    //Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    //Create a marker per location and put into the markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // PUsh the marker to our array of markers
    markers.push(marker);
    //Create an onclick event to open an info window at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
  }

  document.getElementById('show-listings').addEventListener('click', showListings);
  document.getElementById('hide-listings').addEventListener('click', hideListings);
}
  //This function populates the infowindow when the marker is clicked.  We'll only allow
  // one info window which will open at the marker that is clicked, and populate based
  // on that markers position.
  function populateInfoWindow(marker, infowindow) {
    //Check to make sure the info window is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent('<div>' + marker.title + '</div>');
      infowindow.open(map, marker);
      //Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker(null);
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 50;
      // In case the status is OK, which means pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
        if (status == google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 30
              }
            };
            var panorama = new google.maps.StreetViewPanorama(
              document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
              '<div>No Street View Found</div>');
            }
          }
          //Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }

  //This function loops through the markers array and displays them all.
  function showListings() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boudnaries of th emap for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  };

  //This function will loop through the listings and hide them all.
  function hideListings() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  };
