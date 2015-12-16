/**
 * Created by Tony on 2015-12-06.
 */


var map;
var myLocation;
var gPos;
var currentPoly = new google.maps.Polyline();

function init(){
    getMyLocation();
    //$('#submit').click(function(){
    //    alert("yo");
    //
    //});
    //$('#submit').on("click", {distance: 5}, generateCourse);
    debugger
    $('#submit').on("click",findPublicRoutes);
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
    //pos = {lat: 30.2688, lng: -97.7489}
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
    var points;

    var brng = 0;
    var target = gPos.destinationPoint(brng, 1);
    points = target.lat + "," + target.lng;
    for(var i=1; i < numberOfPoints; i++)
    {
        brng += degreesPerPoint;

        target = gPos.destinationPoint(brng, 1);
        points = target.lat + ", "


        //roadPos.snapPointToRoad(map);
        //new google.maps.Marker({
        //    position: roadPos,
        //    map: map
        //});
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

function findPublicRoutes(){

    var distance=$( "#distance" ).val()*1000;
    alert(distance);
    $.ajax({
        url: "https://oauth2-api.mapmyapi.com/v7.1/route/?close_to_location=" +
            pos.lat + "%2C" + pos.lng +"&maximum_distance="+(distance*1.05)+"&minimum_distance="+(distance*0.95),
        beforeSend: function(xhr){
            xhr.setRequestHeader('Api-Key', '5y9kjxu2jy5g4mf3h8pfaz3ky8uc7c49');
            xhr.setRequestHeader('Authorization', 'Bearer 9b0254af91f48005a74a95041a08c82b9bd747b3');
            xhr.setRequestHeader('X-Originating-Ip', '174.92.76.85');
            xhr.setRequestHeader('Content-Type', 'application/json');
        },
        success: function(response){

            console.log(response);
            var numRoutes = response._embedded.routes.length;
            var selectedRoute = Math.floor(numRoutes*Math.random());
            var gpxHref = response._embedded.routes[selectedRoute]._links.alternate[1].href;
            $.ajax({
                type: "GET",
                url: "https://oauth2-api.mapmyapi.com"+gpxHref,
                beforeSend: function(xhr){
                        xhr.setRequestHeader('Api-Key', '5y9kjxu2jy5g4mf3h8pfaz3ky8uc7c49');
                        xhr.setRequestHeader('Authorization', 'Bearer 9b0254af91f48005a74a95041a08c82b9bd747b3');
                        xhr.setRequestHeader('X-Originating-Ip', '174.92.76.85');
                        xhr.setRequestHeader('Content-Type', 'application/json');
                },
                dataType: "xml",
                success: function(xml) {
                    console.log(xml);
                    var points = [];
                    var bounds = new google.maps.LatLngBounds ();
                    $(xml).find("trkpt").each(function() {
                        var lat = $(this).attr("lat");
                        var lon = $(this).attr("lon");
                        var p = new google.maps.LatLng(lat, lon);
                        points.push(p);
                        bounds.extend(p);
                    });

                    var poly = new google.maps.Polyline({
                        // use your own style here
                        path: points,
                        strokeColor: "#FF00AA",
                        strokeOpacity: .7,
                        strokeWeight: 4
                    });
                    currentPoly.setMap(null);

                    currentPoly = poly;

                    poly.setMap(map);

                    // fit bounds to track
                    map.fitBounds(bounds);
                }
            });


        }
    });

}

google.maps.event.addDomListener(window, 'load', init);