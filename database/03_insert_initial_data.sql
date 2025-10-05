-- Use the database
USE `exoplanets-rag`;

-- Insert initial users
INSERT INTO `users` (`user`, `password`) VALUES
('vanessa', '$argon2id$v=19$m=16,t=2,p=1$VEdrTXhaYzQyZ2oySmhJaQ$7LyMUvnbqjsd40QdOyqHtA'),
('luciana', '$argon2id$v=19$m=16,t=2,p=1$VEdrTXhaYzQyZ2oySmhJaQ$drgbDsfMDFeP72f+avYVdA'),
('dana', '$argon2id$v=19$m=16,t=2,p=1$VEdrTXhaYzQyZ2oySmhJaQ$soMnsxyVGh/ENLDeWfcV4w'),
('fernando', '$argon2id$v=19$m=16,t=2,p=1$VEdrTXhaYzQyZ2oySmhJaQ$ooiP1M9NsxaYy9RmxHr26A'),
('omar', '$argon2id$v=19$m=16,t=2,p=1$VEdrTXhaYzQyZ2oySmhJaQ$B9iOqihmBHAtu36xoFnZMw'),
('demo', '$argon2id$v=19$m=16,t=2,p=1$VEdrTXhaYzQyZ2oySmhJaQ$wmi+s1r7RpjJPt8Iy6I8+g');
