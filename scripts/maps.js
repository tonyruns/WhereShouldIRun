/**
 * Created by Tony on 2015-12-07.
 */
/** copied from *http://stackoverflow.com/questions/2637023/how-to-calculate-the-latlng-of-a-point-a-certain-distance-away-from-another */

Number.prototype.toRad = function() {
    return this * Math.PI / 180;
}

Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
}



//brng is the inital bearing from the start point in degrees
//  e.g. 90 degrees from the start means EAST
//distance is in km
google.maps.LatLng.prototype.destinationPoint = function(brng, dist) {
    dist = dist / 6371;
    brng = brng.toRad();

    var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();

    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
        Math.cos(lat1) * Math.sin(dist) * Math.cos(brng));

    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
            Math.cos(lat1),
            Math.cos(dist) - Math.sin(lat1) *
            Math.sin(lat2));

    if (isNaN(lat2) || isNaN(lon2)) return null;

    return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
}

var directionsService = new google.maps.DirectionsService();

google.maps.LatLng.prototype.snapPointToRoad = function(map){
    var latlng = this;
    directionsService.route(
        {origin:this, destination:this, travelMode: google.maps.DirectionsTravelMode.DRIVING},
        function(response, status) {
            var homeMarker;
            if (status == google.maps.DirectionsStatus.OK)
            {
                homeMarker = new google.maps.Marker({
                    position: response.routes[0].legs[0].start_location,
                    map: map,
                });
                //return new google.maps.LatLng(response.routes[0].legs[0].start_location.lat, response.routes[0].legs[0].start_location.lng);
            } else {
                homeMarker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                });
                //var infowindow = new google.maps.InfoWindow({
                //    content: latlng.lat() + ", "+ latlng.lng()
                //});
                //infowindow.open(map, homeMarker);

                //return this;
            }
    });
    //return roadPoint;
}

function mapPolyLine (xml) {
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

    //setMarker(points[0], FlagType.START);
    while(_activeMarkers.length > 0){
        var tempMarker = _activeMarkers.pop();
        tempMarker.setMap(null);
    }
    _activeMarkers.push(getMarker(points[points.length-1], FlagType.END));

    //to do:
    //set markers for start and end

    bounds.extend(gPos);

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

function getMarker(pos, type){
    var image;

    if(type == FlagType.END){
        image = {
            url: 'images/finishFlag.png',
            size: new google.maps.Size(20, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 32)
        };
    }else if (type == FlagType.START){
        image = {
            url: 'images/startFlag.png',
            size: new google.maps.Size(20,32),
            origin: new google.maps.Point(0,0),
            anchor: new google.maps.Point(20,32),
        }
    }

    var marker = new google.maps.Marker({
        icon: image,
        position: pos,
        map: map
    });

    return marker;

}
