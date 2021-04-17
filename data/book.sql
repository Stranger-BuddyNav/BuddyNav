DROP TABLE IF EXISTS books;
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  authors VARCHAR(255),
  isbn VARCHAR(255),
  imageLinks VARCHAR(255),
  description TEXT,
  categories VARCHAR(255)
);
