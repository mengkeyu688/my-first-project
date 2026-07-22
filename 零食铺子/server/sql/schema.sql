CREATE DATABASE IF NOT EXISTS dorm_snack_mall
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE dorm_snack_mall;

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  icon_url VARCHAR(500) DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 enabled, 0 disabled',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_name (name),
  KEY idx_categories_status_sort (status, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  original_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  sales_count INT NOT NULL DEFAULT 0,
  sales INT NOT NULL DEFAULT 0,
  image VARCHAR(500) DEFAULT '',
  description TEXT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 on sale, 0 off sale',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_category_id (category_id),
  KEY idx_products_status (status),
  KEY idx_products_sales_count (sales_count),
  KEY idx_products_sales (sales),
  KEY idx_products_name (name),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  openid VARCHAR(100) NOT NULL,
  unionid VARCHAR(100) DEFAULT NULL,
  session_key VARCHAR(200) NOT NULL,
  nickname VARCHAR(100) DEFAULT '',
  avatar_url VARCHAR(500) DEFAULT '',
  phone VARCHAR(30) DEFAULT '',
  points INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_openid (openid),
  KEY idx_users_unionid (unionid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupons (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  type ENUM('new', 'full', 'delivery') NOT NULL COMMENT 'new newcomer, full threshold discount, delivery delivery fee discount',
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  threshold_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_stock INT NOT NULL DEFAULT 0,
  remaining_stock INT NOT NULL DEFAULT 0,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 enabled, 0 disabled',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_coupons_type (type),
  KEY idx_coupons_status_time (status, start_at, end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_coupons (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  coupon_id BIGINT UNSIGNED NOT NULL,
  status ENUM('unused', 'used', 'expired') NOT NULL DEFAULT 'unused',
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at DATETIME NULL,
  order_id BIGINT UNSIGNED NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_coupons_user_coupon (user_id, coupon_id),
  KEY idx_user_coupons_user_status (user_id, status),
  KEY idx_user_coupons_coupon_id (coupon_id),
  CONSTRAINT fk_user_coupons_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_user_coupons_coupon
    FOREIGN KEY (coupon_id) REFERENCES coupons(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_no VARCHAR(64) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  items JSON NULL,
  total_fee INT NOT NULL DEFAULT 0,
  status ENUM('unpaid', 'pending', 'paid', 'delivery', 'finished', 'canceled', 'cancelled') NOT NULL DEFAULT 'unpaid',
  goods_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  pay_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  coupon_id BIGINT UNSIGNED NULL,
  user_coupon_id BIGINT UNSIGNED NULL,
  receiver_name VARCHAR(100) NOT NULL DEFAULT '',
  receiver_phone VARCHAR(30) NOT NULL DEFAULT '',
  receiver_building VARCHAR(100) NOT NULL DEFAULT '',
  receiver_room VARCHAR(100) NOT NULL DEFAULT '',
  building VARCHAR(100) NOT NULL,
  room VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  delivery_method ENUM('door', 'pickup') NOT NULL DEFAULT 'door',
  delivery_time VARCHAR(100) DEFAULT '',
  remark VARCHAR(500) DEFAULT '',
  paid_at DATETIME NULL,
  canceled_at DATETIME NULL,
  finished_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_orders_order_no (order_no),
  KEY idx_orders_user_id (user_id),
  KEY idx_orders_status (status),
  KEY idx_orders_created_at (created_at),
  KEY idx_orders_coupon_id (coupon_id),
  KEY idx_orders_user_coupon_id (user_coupon_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_orders_coupon
    FOREIGN KEY (coupon_id) REFERENCES coupons(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_orders_user_coupon
    FOREIGN KEY (user_coupon_id) REFERENCES user_coupons(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NULL,
  product_name VARCHAR(200) NOT NULL,
  product_image VARCHAR(500) DEFAULT '',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_order_items_order_id (order_id),
  KEY idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
