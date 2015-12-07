/**
 * Created by Tony on 2015-12-06.
 */


var map;
var myLocation;
var gPos;

function init(){
    getMyLocation();
    //$('#submit').click(function(){
    //    alert("yo");
    //
    //});
    $('#submit').on("click", {distance: 5}, generateCourse);
}

function getMyLocation(){
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            initMap(pos);
            myLocation = pos;
            gPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        }, function() {
            // handleLocationError(true, infoWindow, map.getCenter());
            alert("error");
        });
    } else {
        alert("doesnt support geolocation?");
        // Browser doesn't support Geolocation
        // handleLocationError(false, infoWindow, map.getCenter());
    }
}

function initMap(pos){
    map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 16
    });
    var startMarker = new google.maps.Marker({
        position: pos,
        map: map
    });
}

function generateCourse(event){
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location':myLocation}, function(results, status){
        if (status === google.maps.GeocoderStatus.OK) {
            alert(results[0].formatted_address);
        }else {
            alert('Geocoder failed due to: ' + status);
        }
    });
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);
    var increments = event.data.distance/6.0;

    findCoordinates(myLocation);

    //BECAUSE I DONT WANNA USE HAVERSINE
    //latitude is the same regardless of longitude ---> this applies for north/south points
    // 1 degree = 111.23 km or 110.574
    // longitude -> 1 deg = 111.32cos(lat) km
    var lat = myLocation["lat"];
    var lng = myLocation["lng"];

    var latConst = 110.574;
    var lngConst = 111.32*Math.cos(lat);
    var northCrd = {
        lat: increments/latConst + lat,
        lng: lng,
    };

    var southCrd = {
        lat: lat - increments/latConst,
        lng: lng,
    };

    $('#crd').html(northCrd["lat"]+", "+northCrd["lng"]);

    var waypts = [];
    waypts.push({location: northCrd, stopover: true});


    //directionsService.route({
    //    origin: myLocation,
    //    destination: myLocation,
    //    waypoints: waypts,
    //    optimizeWaypoints: true,
    //    travelMode: google.maps.TravelMode.DRIVING
    //}, function(response, status) {
    //    if (status === google.maps.DirectionsStatus.OK) {
    //        directionsDisplay.setDirections(response);
    //        var route = response.routes[0];
    //        var summaryPanel = document.getElementById('directions-panel');
    //        summaryPanel.innerHTML = '';
    //        // For each route, display summary information.
    //        for (var i = 0; i < route.legs.length; i++) {
    //            var routeSegment = i + 1;
    //            summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
    //                '</b><br>';
    //            summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
    //            summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
    //            summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
    //        }
    //    } else {
    //        window.alert('Directions request failed due to ' + status);
    //    }
    //});


}

function findCoordinates(pos)
{

    var lat = pos["lat"];
    var lng = pos.lng;
    var range = .02;
    // How many points do we want? (should probably be function param..)
    var numberOfPoints = 16;
    var degreesPerPoint = 360 / numberOfPoints;
    // Keep track of the angle from centre to radius
    var currentAngle = 0;

    // The points on the radius will be lat+x2, long+y2
    var x2;
    var y2;
    // Track the points we generate to return at the end
    var points = new Array();

    var brng = 0;
    for(var i=0; i < numberOfPoints; i++)
    {
        new google.maps.Marker({
            position: gPos.destinationPoint(brng, 1),
            map: map
        });
        brng += degreesPerPoint;
        //// X2 point will be cosine of angle * radius (range)
        //x2 = Math.cos(currentAngle) * range;
        //// Y2 point will be sin * range
        //y2 = Math.sin(currentAngle) * range;
        //
        //// Assuming here you're using points for each x,y..
        //newLat = lat+x2;
        //newLng = lng+y2;
        //var lat_lng = new google.maps.LatLng(newLat,newLng);
        //var marker = new google.maps.Marker({
        //    position: lat_lng,
        //    map: map
        //});
        //
        //
        //// Shift our angle around for the next point
        //currentAngle += degreesPerPoint;
    }
    // Return the points we've generated
    //return points;
}

google.maps.event.addDomListener(window, 'load', init);