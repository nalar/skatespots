// Needs google maps javascript API & jQuery

var map;

function initMap() {

	map = new google.maps.Map(document.getElementById('map'), {
		center: {
			lat: 52.4,
			lng: 4.92
		},
		zoom: 12
	});

	var UserLocation;
	var UserLocationArr = [0, 0];

	function placeMarker(location) {
		if (UserLocation) {
			UserLocation.setPosition(location);
			UserLocationArr[0] = location.lat();
			UserLocationArr[1] = location.lng();
			$("#formlatlon").val(UserLocationArr)
		} else {
			UserLocation = new google.maps.Marker({
				position: location,
				map: map,
				draggable: true
			});
			UserLocationArr[0] = location.lat();
			UserLocationArr[1] = location.lng();
			$("#formlatlon").val(UserLocationArr)

			UserLocation.addListener('dragend', function(event) {
				UserLocationArr[0] = UserLocation.getPosition().lat();
				UserLocationArr[1] = UserLocation.getPosition().lng();
				console.log(UserLocationArr);
				$("#formlatlon").val(UserLocationArr)
			});
		}
	}

	map.addListener('click', function(event) {
		placeMarker(event.latLng);
	});
}