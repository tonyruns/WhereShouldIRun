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
