CREATE DATABASE IF NOT EXISTS dorm_snack_mall
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE dorm_snack_mall;

SET @schema_name = DATABASE();

SET @add_items_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE orders ADD COLUMN items JSON NULL AFTER user_id',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'items'
);
PREPARE add_items_stmt FROM @add_items_sql;
EXECUTE add_items_stmt;
DEALLOCATE PREPARE add_items_stmt;

SET @add_total_fee_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE orders ADD COLUMN total_fee INT NOT NULL DEFAULT 0 AFTER items',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'total_fee'
);
PREPARE add_total_fee_stmt FROM @add_total_fee_sql;
EXECUTE add_total_fee_stmt;
DEALLOCATE PREPARE add_total_fee_stmt;

SET @add_receiver_name_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE orders ADD COLUMN receiver_name VARCHAR(100) NOT NULL DEFAULT '''' AFTER user_coupon_id',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'receiver_name'
);
PREPARE add_receiver_name_stmt FROM @add_receiver_name_sql;
EXECUTE add_receiver_name_stmt;
DEALLOCATE PREPARE add_receiver_name_stmt;

SET @add_receiver_phone_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE orders ADD COLUMN receiver_phone VARCHAR(30) NOT NULL DEFAULT '''' AFTER receiver_name',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'receiver_phone'
);
PREPARE add_receiver_phone_stmt FROM @add_receiver_phone_sql;
EXECUTE add_receiver_phone_stmt;
DEALLOCATE PREPARE add_receiver_phone_stmt;

SET @add_receiver_building_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE orders ADD COLUMN receiver_building VARCHAR(100) NOT NULL DEFAULT '''' AFTER receiver_phone',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'receiver_building'
);
PREPARE add_receiver_building_stmt FROM @add_receiver_building_sql;
EXECUTE add_receiver_building_stmt;
DEALLOCATE PREPARE add_receiver_building_stmt;

SET @add_receiver_room_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE orders ADD COLUMN receiver_room VARCHAR(100) NOT NULL DEFAULT '''' AFTER receiver_building',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'receiver_room'
);
PREPARE add_receiver_room_stmt FROM @add_receiver_room_sql;
EXECUTE add_receiver_room_stmt;
DEALLOCATE PREPARE add_receiver_room_stmt;

ALTER TABLE orders
  MODIFY COLUMN status ENUM('unpaid', 'pending', 'paid', 'delivery', 'finished', 'canceled', 'cancelled') NOT NULL DEFAULT 'unpaid';

UPDATE orders
SET total_fee = IF(total_fee = 0, ROUND(pay_amount * 100), total_fee),
    receiver_phone = IF(receiver_phone = '', phone, receiver_phone),
    receiver_building = IF(receiver_building = '', building, receiver_building),
    receiver_room = IF(receiver_room = '', room, receiver_room)
WHERE total_fee = 0
   OR receiver_phone = ''
   OR receiver_building = ''
   OR receiver_room = '';
