-- Insert Tony Stark into the account table
INSERT INTO account (first_name, last_name, email, password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Update Tony Stark's account_type to 'Admin'
UPDATE account
SET account_type = 'Admin'
WHERE first_name = 'Tony' AND last_name = 'Stark';

-- Delete Tony Stark's record
DELETE FROM account
WHERE first_name = 'Tony' AND last_name = 'Stark';

-- Update GM Hummer description using REPLACE
UPDATE inventory
SET description = REPLACE(description, 'small interiors', 'a huge interior')
WHERE model = 'GM Hummer';

-- Select with JOIN to get make, model, and classification_name for 'Sport' category
SELECT i.make, i.model, c.classification_name
FROM inventory i
JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- Update inv_image and inv_thumbnail to add '/vehicles' in the file path
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
WHERE inv_image IS NOT NULL AND inv_thumbnail IS NOT NULL;
