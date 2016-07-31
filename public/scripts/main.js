/**
 * Created by Tony on 2015-12-06.
 */


var map;
var myLocation; //json object
var gPos;
var currentPoly = new google.maps.Polyline();
var _activeMarkers = [];
var autocomplete;
var startMarker;
var latestRouteId;

var KM_PER_MILE = 1.60934;

var FlagType ={
    REGULAR:0,
    START:1,
    END:2
};

function init(){

    $("#unit").attr({
        "data-on-text": "KM",
        "data-off-text": "MI",
        "data-on-color": "default",
    });

    $("#unit").bootstrapSwitch();


    showOverlay();

    getMyLocation();

    $('#submit').on("click",findPublicRoutes);

}

function getMyLocation(){
    //$.ajax({
    //    url: "http://jservice.io/api/random",
    //    dataType: "json",
    //    success: function(response){
    //        debugger;
    //    }
    //});
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(function(position) {

            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            initMap(pos);
            myLocation = pos;
            gPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            hideOverlay();
            $('#searchScreen').hide();
            //$('.main').hide();
            //initSearch();

            //
            //hideOverlay();
        }, function() {
            // handleLocationError(true, infoWindow, map.getCenter());
            pos = { //default location to TDOT
                lat: 43.652073,
                lng: -79.382293,
            }
            initMap(pos);

            initSearch();
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
    startMarker = new google.maps.Marker({
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
    //var lat = myLocation["lat"];
    //var lng = myLocation["lng"];
    //
    //var latConst = 110.574;
    //var lngConst = 111.32*Math.cos(lat);
    //var northCrd = {
    //    lat: increments/latConst + lat,
    //    lng: lng,
    //};
    //
    //var southCrd = {
    //    lat: lat - increments/latConst,
    //    lng: lng,
    //};
    //
    //$('#crd').html(northCrd["lat"]+", "+northCrd["lng"]);
    //
    //var waypts = [];
    //waypts.push({location: northCrd, stopover: true});


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

    //convert distances to metres
    var distance=$( "#distance" ).val()*1000 * (!$('#unit').prop("checked") ? KM_PER_MILE : 1);

    showOverlay();

    $('#routeActionContainer').show();



    $.ajax({
        url: "https://oauth2-api.mapmyapi.com/v7.1/route/?close_to_location=" +
            myLocation.lat + "%2C" + myLocation.lng +"&maximum_distance="+(distance*1.05)+"&minimum_distance="+(distance*0.95),
        beforeSend: function(xhr){
            xhr.setRequestHeader('Api-Key', '5y9kjxu2jy5g4mf3h8pfaz3ky8uc7c49');
            xhr.setRequestHeader('Authorization', 'Bearer ed6199693b8c767f600e20775bfabf26c3f2ce65');
            xhr.setRequestHeader('X-Originating-Ip', '174.92.76.85');
            xhr.setRequestHeader('Content-Type', 'application/json');
            $('#loadMusic').trigger('play');
        },
        success: function(response){

            console.log(response);
            var numRoutes = response._embedded.routes.length;
            var selectedRoute = Math.floor(numRoutes*Math.random());
            var gpxHref = response._embedded.routes[selectedRoute]._links.alternate[1].href;
            var distance = response._embedded.routes[selectedRoute].distance/1000;

            latestRouteId = response._embedded.routes[selectedRoute]._links.self[0].id;
            getRouteTimes(latestRouteId);
            $.ajax({
                type: "GET",
                url: "https://oauth2-api.mapmyapi.com"+gpxHref,
                beforeSend: function(xhr){
                        xhr.setRequestHeader('Api-Key', '5y9kjxu2jy5g4mf3h8pfaz3ky8uc7c49');
                        xhr.setRequestHeader('Authorization', 'Bearer ed6199693b8c767f600e20775bfabf26c3f2ce65');
                        xhr.setRequestHeader('X-Originating-Ip', '174.92.76.85');
                        xhr.setRequestHeader('Content-Type', 'application/json');
                },
                dataType: "xml",
                success: function(result){

                    if ($('#unit').prop("checked")) {
                        $('#result').html(distance.toFixed(2) + " KM");
                    }else{
                        $('#result').html((distance/KM_PER_MILE).toFixed(2) + " MI");
                    }
                    mapPolyLine(result);

                    $('#loadMusic').trigger('pause');
                    $('#loadMusic').prop("currentTime",0);
                    hideOverlay();

                }
            });


        }
    });

}

function updateDistances(){
    //0 represents km, 1 represents miles
    var limit = !$('#unit').prop("checked") ? 26 : 42;
    
    $('#distance option').remove();
    $('#distance').selectpicker('refresh');

    for(var i=0; i<limit; i++){
        $('#distance').append($('<option>',{
            value: i+1,
            text: i+1
        }));
        $('#distance').selectpicker('refresh');

    }
}

function showOverlay(){
    $('#overlayMain').show();
    $('#searchScreen').hide();
}

function hideOverlay(){
    $('#overlayMain').hide();
}

google.maps.event.addDomListener(window, 'load', init);

$(function(){
    $('#unit').on('switchChange.bootstrapSwitch', function(event, state){
        updateDistances();
    });

    $('#timepicker1').timepicker(
        {
            disableFocus: true,
            showInputs: false,
            showSeconds: true,
            showMeridian: false,
            secondStep: 1,
            defaultValue: '00:00:00'
        }
    );

    $('#timepicker1').timepicker('setTime', '0:0:0');



    updateDistances();
    $('#changeLocation').click(function(){

        initSearch();
        return false;
    })

    $('#test').click(function(){

        postRouteTimes();

    });
})


function initSearch(){
    hideOverlay();
    $('#searchScreen').show();
    $('.selectpicker').selectpicker('hide');
    initAutocomplete();

}

function getRouteTimes(routeId){
    console.log(routeId);
    $.ajax({
        type: 'GET',
        url: '/getRouteTimes',
       // data: {id: routeId},
       // contenttype: 'application/json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('id', routeId);

           // xhr.setRequestHeader('Content-Type', 'application/json');
        },
        success: function(result){
            var times = JSON.parse(result);
            $('#list1').empty();
            $('#list2').empty();
            var i=0;
            for (i=0; i<times.length; i++){
                if (i<5){
                    $('#list1').append($('<div>',{
                        class: 'list-item',
                        text: (i+1) + ".  " +times[i].name + " - " + times[i].time
                    }));
                }else{
                    $('#list2').append($('<div>',{
                        class: 'list-item',

                        text: (i+1) + ".  " +times[i].name + " - " + times[i].time
                    }));
                }
            }
            for (i; i < 10; i++) {
                if (i<5){
                    $('#list1').append($('<div>',{
                        class: 'list-item',
                        text: (i+1) + ".  --- -----"
                    }));
                }else{
                    $('#list2').append($('<div>',{
                        class: 'list-item',
                        text: (i+1) + ".  --- -----"
                    }));
                }


                //$('')
            }
            console.log(result);
        }
    })
}

function postRouteTimes(){
    //$.post('/test')
    $.ajax({
        type: 'POST',
        url: '/postRouteTimes',
        // data: {id: routeId},
        // contenttype: 'application/json',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('id', latestRouteId);
            xhr.setRequestHeader('time', $('#timepicker1').val());
            xhr.setRequestHeader('name', $('#runnerName').val());


            // xhr.setRequestHeader('Content-Type', 'application/json');
        },
        success: function(result){
            getRouteTimes(latestRouteId);

        }
    })
}