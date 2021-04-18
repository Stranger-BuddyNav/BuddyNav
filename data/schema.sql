DROP TABLE IF EXISTS booking;
CREATE TABLE booking (
  id SERIAL PRIMARY KEY,
  city VARCHAR(255),
  image_url VARCHAR(255),
  date VARCHAR(255),
  hotel VARCHAR(255),
  transport VARCHAR(255),
);
