-- Check milk records
SELECT * FROM milk_records ORDER BY date DESC, time DESC LIMIT 10;

-- Check mpasi records
SELECT * FROM mpasi_records ORDER BY date DESC, time DESC LIMIT 10;

-- Check growth records
SELECT * FROM growth_records ORDER BY date DESC LIMIT 10;

-- Check user settings
SELECT * FROM user_settings;
