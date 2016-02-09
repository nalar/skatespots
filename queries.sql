SELECT row_to_json(fc) FROM (
  SELECT 'FeatureCollection' AS TYPE, array_to_json(array_agg(f)) AS features FROM (
    SELECT 'Feature' AS TYPE , row_to_json((
      SELECT l FROM (
        SELECT username, password
      ) AS l
    )) AS properties, row_to_json((
      SELECT l FROM (
        SELECT 'Point' AS TYPE, location as coordinates
      ) AS l
    )) AS geometry FROM users AS lg
  ) AS f
) AS fc;

-- Returns
 {
 	"type": "FeatureCollection",
 	"features": [{
 		"type": "Feature",
 		"properties": {
 			"username": "thijs",
 			"password": "pokemon"
 		},
 		"geometry": {
 			"type": "Point",
 			"coordinates": ["52.370568669179676", "4.895782470703125"]
 		}
 	}, {
 		"type": "Feature",
 		"properties": {
 			"username": "olympia",
 			"password": "plein"
 		},
 		"geometry": {
 			"type": "Point",
 			"coordinates": ["52.3467445820525", "4.867029190063477"]
 		}
 	}]
 }