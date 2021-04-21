-- INSERT INTO city (city) Values ('amman');
-- INSERT INTO city (city) Values ('irbid');

INSERT INTO hoteldata ( hotel_name , hotel_price , hotel_rate,hotel_image,city_name) Values ('Hilton Tokyo','58 USD','4','https://pixabay.com/get/gdb7bf6e64f97d1b1383c1157f5b1fd327f56c48706ce06816b463c7aa4c7c3083a695cd5833e1dc96e075c53ebf29c3bbea4644876748f6ddac30dc518842b6e_640.jpg','Tokyo');

INSERT INTO hoteldata ( hotel_name , hotel_price , hotel_rate,hotel_image,city_name) Values ('Park Hyatt Tokyo','214 USD','1','https://thumbs.dreamstime.com/b/find-hotel-search-hotels-concept-smartphone-maps-gps-location-building-team-people-modern-flat-style-vector-147792003.jpg','Tokyo');


INSERT INTO transportdata ( city_name , station_name,station_type ,transport_price) Values ('Tokyo', 'Tokyo (NRT-Narita Intl.)','AIRPORT','55 USD');
INSERT INTO transportdata ( city_name , station_name,station_type ,transport_price) Values ('Tokyo', 'Tokyo (HND-Haneda)','AIRPORT','55 USD');
INSERT INTO transportdata ( city_name , station_name,station_type ,transport_price) Values ('Tokyo', 'Haneda Airport International Terminal Station','METRO_STATION','55 USD');

-- INSERT INTO hoteldata ( city_id , hotel_name , hotel_price , hotel_rate) Values (2,'5','5','5');

INSERT INTO locationdata ( city_name , map_url , city_url) Values ('Tokyo','4','4');
INSERT INTO locationdata ( city_name , map_url , city_url) Values ('Tokyo','4','4');

INSERT INTO booking ( city , map_url , city_url,time,hotel_name,hotel_price,hotel_rate,hotel_price,hotel_img,station_name,station_type,transport_price) Values ('Tokyo','4','4','4','Park Hyatt Tokyo','214 USD','1','https://thumbs.dreamstime.com/b/find-hotel-search-hotels-concept-smartphone-maps-gps-location-building-team-people-modern-flat-style-vector-147792003.jpg','Tokyo');
