// globals
//map
var map = null;
//markers
var markers_on_map = [];
// places displayed
var places_displayed = [];
// geocoder
var geocoder;
// info window
var infowindow;
// current location
var currentLocation;

function open_help(){
    $('#helpText').toggle();
}
function set_to_selected_locals(){
    var count = $('#selectLocalities :selected').length;
    if ($('#selectResults').val() >= count) {
    return;
    }
    document.getElementById("selectResults").value = count;

}
function open_Options(){
    $('#options_row').toggle();
}
function show_inputForm(){

    $('#location_input').toggle();
}
function show_map(){
    $('#map-container').show();
}
function callback_details(place, status, callback){
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        let url = place.url;
        callback(url);
    }
}
function createMarker(place, identifier) {
    //TODO test
    // hier nochmal richtig überprüfen
        //places_displayed.append(place);

    // get URL for a specific Place
    // create Request
    let request = {
        placeId: place.place_id,
    };
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: place.name,
            label: identifier,

        });

        service = new google.maps.places.PlacesService(map);
        service.getDetails(request, function (place, status){
            callback_details(place, status, function(url){

                google.maps.event.addListener(marker, 'click', function() {
                    if (infowindow){
                        // let content = gen_content_string(place);
                        let content = '<div>'+
                            place.name +
                            '<br>' +
                            '<a href='+
                            url +
                            '>View on Google Maps</a>' +
                            '</div>';
                        infowindow.setContent(content);
                        // mal schauen ob es funktioniert
                        //infowindow.setContent(place.name);
                        infowindow.open(map, this);
                    } else {
                        infowindow = new google.maps.InfoWindow;
                        let content = '<div>'+
                            place.name +
                            '<br>' +
                            '<a href='+
                            url +
                            '>View on Google Maps</a>' +
                            '</div>';
                        infowindow.setContent(content);
                        // mal schauen ob es funktioniert
                        //infowindow.setContent(place.url);
                        infowindow.open(map, this);
                    }
                });
            })
        });
        // Barrier here to wait for the url to finally end the directions once and for all
        return marker;

}
function build_listview_item(place) {
    places_displayed.push(place);
    let request = {
        placeId: place.place_id
    };
    let service = new google.maps.places.PlacesService(map);

    service.getDetails(request, function(place, status){
            callback_details(place,status, function(url){

                var item =
                    '<div class="column" >'+
                    '<div class="listitem" >' +
                    '<div class="listitem-name">' +
                    place.name +
                    '</div>'+
                    '<div class="listitem-url">' +
                    '<a href='+
                    url +
                    '>View on Google Maps</a>'+
                    '</div>'+
                    '<div class="listitem-icon">' +
                    '<img src='+
                     place.icon +
                    '>'+
                    '</div>'+
                    '</div>'+
                    '</div>';
                $('.list').append(item);

        });
    });


}
function callback(result, status, identifier, num) {

    if (status === google.maps.places.PlacesServiceStatus.OK) {

        if ($('#radio_map').prop('checked')){

            for (let i = 0; i < num; i++) {
                console.log(result[i]);
                places_displayed.push(result[i]);
               let  marker = createMarker(result[i], identifier);
                markers_on_map.push(marker);
                marker.setMap(map);
            }
        } else {
            for (let i = 0; i < num; i++ ){
                build_listview_item(result[i]);
            }
        }

    }
}
function query_restaurant(location, num){
    let service = new google.maps.places.PlacesService(map);
    var request = {
                location: location,
                type: ['restaurant'],
                rankBy: google.maps.places.RankBy.DISTANCE
            };
            service.nearbySearch(request, function(result, status){
                callback(result,status,'R', num);
            });

}
function query_gas_station(location, num){
    let service = new google.maps.places.PlacesService(map);
    var request = {
        location: location,
        type: ['gas_station'],
        rankBy: google.maps.places.RankBy.DISTANCE
    };
    service.nearbySearch(request, function(result,status){
        callback(result,status, 'G', num);
    });
}
function query_bar(location, num ){
    let service = new google.maps.places.PlacesService(map);
    var request = {
        location: location,
        type: ['bar'],
        rankBy: google.maps.places.RankBy.DISTANCE
    };
    service.nearbySearch(request, function(result, status){
        callback(result,status, 'B', num);
    });
}
function query_supermarket(location, num){
    let service = new google.maps.places.PlacesService(map);
    var request = {
        location: location,
        type: ['supermarket'],
        rankBy: google.maps.places.RankBy.DISTANCE
    };
    service.nearbySearch(request, function(result, status){
        callback(result, status, 'S', num);
    });
}
function query_google_db(arr) {

    let cnt = 0;
  $('#selectLocalities option:selected').map(function () {
        switch ($(this).val()) {
            case 'Restaurant':
                query_restaurant(currentLocation, arr[cnt]);
                cnt++;
                break;
            case 'Bar':
                query_bar(currentLocation, arr[cnt]);
                cnt++;
                break;
            case 'Gas_Station':
                query_gas_station(currentLocation, arr[cnt]);
                cnt++;
                break;
            case 'Supermarket':
                query_supermarket(currentLocation, arr[cnt]);
                cnt++;
                break;
            default:
                alert('Please select at least one locality.')
        }
    });
}
function geocoder_callback(results, status, arr) {
    if (status === google.maps.GeocoderStatus.OK) {
        if($('#radio_map').prop('checked')){
        let marker = new google.maps.Marker({
            position: results[0].geometry.location,
            title: 'center',
            map: map,
            label: 'C'
        });
        markers_on_map.push(marker);
        var content = "Current Location";
        google.maps.event.addListener(marker, 'click', function(){
            infowindow.setContent(content);
            infowindow.open(map,this);
        });
        map.setCenter(results[0].geometry.location);
        show_map();
        }
        currentLocation = results[0].geometry.location;
        query_google_db(arr);
    }

}
function current_location(arr) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(currentLocation);
            if($('#radio_map').is(':checked')) {
                show_map();


                let marker = new google.maps.Marker({
                    position: currentLocation,
                    title: 'Current Location',
                    map: map,
                    label: 'A'
                });

                markers_on_map.push(marker);
                var content = "Current Location";
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow = new google.maps.InfoWindow;
                    infowindow.setContent(content);
                    infowindow.open(map, this);
                });
                query_google_db(arr);
            } else
            if($('#input[name=radio_list]:checked')){
                $('#list_results').show();
                $('#listItemResult').show();
                query_google_db(arr);
            } else {
                alert("Something went wrong");
            }
        });
    } else {
        alert("Geolocation is not supported")
    }
    }
function custom_location(arr) {
    geocoder = new google.maps.Geocoder();
    if(geocoder){
        // query the value of the input form
        let location = $('#location_input').val();
        if(location == null || location == "" ){
            alert("The location input is empty. Please enter a location.");
        } else {
            //TODO mal schauen ob das funktioniert
            geocoder.geocode({'address': location}, function(results, status){
                geocoder_callback(results, status, arr);
            });
        }
    }
}
function show_Locations(){

    $('.list').empty();
    if ($('#radio_list').prop('checked')){
        $('.list').show();
        $('#list_results').show();
        $('#map-container').hide();
    } else {
        $('.list').hide();
        $('#list_results').hide();
        $('#map-container').show();
    }

    for (let i = 0; i < markers_on_map.length; i++) {
        if (markers_on_map[i]) {
            markers_on_map[i].setMap(null);
            markers_on_map[i] = null;
        }
    }
    var num_locality = $('#selectLocalities :checked').length;
    var num_result = $('#selectResults').val();
    var arr = [];
    var i;
    var num_mod = num_result % num_locality;
    var num_div = Math.floor(num_result / num_locality);

    for (i = 0; i < num_locality; i++ ){
        arr.push(num_div);
    }
    for (i= 0; i < num_mod; i++){
        arr[i] = arr[i] + 1;
    }
    if (($('#radiocurrentlocation').prop('checked'))){
        current_location(arr);
    } else {
        custom_location(arr);
    }

}

$(document).ready(function() {
    // detect mobile
    let mobile =  navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i);

    if (mobile){

        $('#radiocurrentlocation').prop('checked', true);
        $('#list_results').hide();
        $('#listItemResult').hide();
        $('#location_input').hide();

    } else {

        $('#radiocurrentlocation').prop('checked', false);
        $('#location_input').show();
        $('#list_results').hide();
        $('#radio_map').prop('checked', false);
        $('#radio_list').prop('checked', true);

    }
     $('#options_row').hide();
     $('#map-container').hide();
    $('#helpText').hide();
    let uluru = {lat: -25.344, lng: 131.036};
    var map_options = {
        zoom: 13,
        center : uluru,
        mapTypeControl: true,
        mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
        navigationControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
             map = new google.maps.Map(document.getElementById('map-container'), map_options);

            google.maps.event.addListener(map, 'click', function () {
                if (infowindow) {
                    infowindow.setMap(null);
                    infowindow = null;

                }
            });
        });
