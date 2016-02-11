create table users (
id serial primary key,
username text,
password text,
email text,
firstname text,
lastname text,
location text[]
);

create table spots (
id serial primary key,
name text,
type text,
location text[],
photo text,
description text,
videolink text[],
author integer references users
);

SELECT row_to_json(fc) FROM (
  SELECT 'FeatureCollection' AS TYPE, array_to_json(array_agg(f)) AS features FROM (
    SELECT 'Feature' AS TYPE , row_to_json((
      SELECT l FROM (
        SELECT id, name, type, description, videolink, author
      ) AS l
    )) AS properties, row_to_json((
      SELECT l FROM (
        SELECT 'Point' AS TYPE, array_to_json(location::float[]) as coordinates
      ) AS l
    )) AS geometry FROM spots AS lg
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

 SELECT row_to_json(fc) FROM (SELECT 'FeatureCollection' AS TYPE, array_to_json(array_agg(f)) AS features FROM (SELECT 'Feature' AS TYPE , row_to_json((SELECT l FROM (SELECT name, type, description, videolink, author) AS l)) AS properties, row_to_json((SELECT l FROM (SELECT 'Point' AS TYPE, array_to_json(location::float[]) as coordinates) AS l)) AS geometry FROM spots AS lg) AS f) AS fc;