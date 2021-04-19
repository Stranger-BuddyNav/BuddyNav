DROP TABLE IF EXISTS city;
CREATE TABLE city (
  id SERIAL PRIMARY KEY,
  city VARCHAR(255)
);

DROP TABLE IF EXISTS locationdata;
CREATE TABLE locationdata (
  id SERIAL PRIMARY KEY,
  city_id int,
  map_url VARCHAR(255),
  city_url VARCHAR(255),
  FOREIGN KEY (city_id) REFERENCES city(id)
);

DROP TABLE IF EXISTS hoteldata;
CREATE TABLE hoteldata (
  id SERIAL PRIMARY KEY,
  city_id int,
  hotel_image VARCHAR(255),
  hotel_name VARCHAR(255),
  hotel_price VARCHAR(255),
  hotel_rate VARCHAR(255),
  FOREIGN KEY (city_id) REFERENCES city(id)
);

DROP TABLE IF EXISTS transportdata;
CREATE TABLE transportdata (
  id SERIAL PRIMARY KEY,
  city_id int,
  station_name VARCHAR(255),
  station_type VARCHAR(255),
  transport_price VARCHAR(255),
  FOREIGN KEY (city_id) REFERENCES city(id)
);



-- buddynav=# select * from hoteldata join city on hoteldata.city_id=city.id join transportdata on transportdata.city_id=city.id where city.id=5;



DROP TABLE IF EXISTS booking;
CREATE TABLE booking (
  id SERIAL PRIMARY KEY,
  city VARCHAR(255),
  map_url VARCHAR(255),
  city_url VARCHAR(255),
  time VARCHAR(255),
  hotel_name VARCHAR(255),
  hotel_price VARCHAR(255),
  hotel_rate VARCHAR(255),
  hotel_img VARCHAR(255),
  station_name VARCHAR(255),
  station_type VARCHAR(255),
  transport_price VARCHAR(255)
);