// Hide the loaded data
map.data.setMap(null)
// or
map.data.setStyle({visible: false});

// Show the loaded data
map.data.setMap(map)
// or
map.data.setStyle({visible: true});

// Set an icon
map.data.setStyle({
  icon: 'http://url.to/icon'
});

// Set declarative style
map.data.setStyle(function(feature) {
    var type = feature.getProperty('type');
    var iconurl;
    if(type === 'rail'){
    	iconurl = '/icons/rail.png';
    } else if(type === 'curb'){
    	iconurl = '/icons/curb.png'
    } else if(type === 'ledge'){
    	iconurl = '/icons/ledge.png'
    } else if(type === 'bank'){
    	iconurl = '/icons/bank.png'
    } else if(type === 'park'){
    	iconurl = '/icons/park.png'
    } else if(type === 'shop'){
    	iconurl = '/icons/shop.png'
    } else{
    	iconurl = '/icons/general.png'
    }
    return {
      icon: iconurl
    };
});

// Reload json
map.data.loadGeoJson('/skatespots.json')

// Add a single marker
location = [lat, lon]
SpotLocation = new google.maps.Marker({
	position: location,
	map: map,
	draggable: true
});