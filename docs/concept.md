# Skatespots App
An app that allows users to add skate spots to an ever growing list of spots which is geo-referenced. This means that you can find nearby spots, or spots at specific places.


# Uses
	- NodeJS
	- GraphicsMagick
	- Google Maps API

# Database
	User
		- Username *			String
		- Password *			String
		- First Name *			String
		- Last Name *			String
		- Email Address *		String
		- Location *			Google Maps API location
	Spot
		- Name *				String
		- Type *				String
		- Location *			Lat/Lon array
		- Photo *				String (location)
		- Added by User *		Integer
		- Description			Text
		- Video Link			String
		- Video Time			String
		- Rating				Integer

# Information per Spot
	- Name (Required)
	- Type (Required)
	- Location (Required)
	- Photo (Required)
	- Rating (Optional)
	- Description (Optional)
	- More photo's and videos of the spot (Optional)

# User registration
	- Username (Required)
	- Password (Required)
	- First Name (Required)
	- Last Name
	- Email Address (Required)
	- Location

# Main page
	- Always shows
		- Login || Registration || Userinfo
		- Search bar
		- Map centered on current location (city scale)
		- List of the spots currently visible on the map
		- Filter options
		- Add spot button
	- Add Spot overlay
	- Modify Spot overlay
	- Registration overlay
	- Modify user overlay

# Add Spot Overlay
	- Map
		- Center at current location
		- Drop pin to set lat/lon
	- Form with required & optional fields
	- Add Button
	- Cancel Button

# Modify Spot Overlay
	- Map
		- Pin at spots location
		- Can drag pin to re-position
	- Form with current values that can be modified
	- Modify Button
	- Cancel Button

# Registration Form Overlay
	- Location bar
	- User details form
	- Register Button
	- Cancel Button

# Modify User Overlay
	- Form with current values that can be modified
	- Modify Button
	- Cancel BUtton