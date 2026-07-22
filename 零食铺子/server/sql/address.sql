CREATE DATABASE IF NOT EXISTS dorm_snack_mall
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE dorm_snack_mall;

CREATE TABLE IF NOT EXISTS address (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  building VARCHAR(100) NOT NULL,
  room VARCHAR(100) NOT NULL,
  is_default TINYINT NOT NULL DEFAULT 0 COMMENT '1 default, 0 normal',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_address_user_id (user_id),
  KEY idx_address_user_default (user_id, is_default),
  CONSTRAINT fk_address_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @schema_name = DATABASE();

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

UPDATE orders
SET receiver_phone = IF(receiver_phone = '', phone, receiver_phone),
    receiver_building = IF(receiver_building = '', building, receiver_building),
    receiver_room = IF(receiver_room = '', room, receiver_room)
WHERE receiver_phone = ''
   OR receiver_building = ''
   OR receiver_room = '';
