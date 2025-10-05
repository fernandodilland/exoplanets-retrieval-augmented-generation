-- Migration: Add probability_percentage column to responses table
-- Date: 2025-10-04
-- Description: Adds a new column to store the probability percentage (0-100) 
--              that a celestial body is an exoplanet based on AI analysis

USE exoplanets_db;

-- Add the probability_percentage column
ALTER TABLE responses 
ADD COLUMN probability_percentage INT NULL 
COMMENT 'Exoplanet probability percentage (0-100)' 
AFTER response;

-- Optional: Add a check constraint to ensure values are between 0 and 100
-- Note: MySQL 8.0.16+ supports CHECK constraints
ALTER TABLE responses
ADD CONSTRAINT chk_probability_range 
CHECK (probability_percentage IS NULL OR (probability_percentage >= 0 AND probability_percentage <= 100));

-- Verify the change
DESCRIBE responses;

-- Show sample data (if any exists)
SELECT id, user_id, question, 
       LEFT(response, 50) as response_preview,
       probability_percentage, 
       created_at 
FROM responses 
ORDER BY created_at DESC 
LIMIT 5;

COMMIT;

-- Success message
SELECT 'Migration completed successfully! The probability_percentage column has been added to the responses table.' AS status;
