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
  CONSTRAINT fk_products_category_seed
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @schema_name = DATABASE();

SET @add_sales_count_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE products ADD COLUMN sales_count INT NOT NULL DEFAULT 0 AFTER stock',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'sales_count'
);
PREPARE add_sales_count_stmt FROM @add_sales_count_sql;
EXECUTE add_sales_count_stmt;
DEALLOCATE PREPARE add_sales_count_stmt;

SET @add_sales_count_index_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE products ADD KEY idx_products_sales_count (sales_count)',
    'SELECT 1'
  )
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'products'
    AND INDEX_NAME = 'idx_products_sales_count'
);
PREPARE add_sales_count_index_stmt FROM @add_sales_count_index_sql;
EXECUTE add_sales_count_index_stmt;
DEALLOCATE PREPARE add_sales_count_index_stmt;
SET @add_image_sql = (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE products ADD COLUMN image VARCHAR(500) DEFAULT '''' AFTER sales',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'image'
);
PREPARE add_image_stmt FROM @add_image_sql;
EXECUTE add_image_stmt;
DEALLOCATE PREPARE add_image_stmt;

SET @copy_image_sql = (
  SELECT IF(
    COUNT(*) > 0,
    'UPDATE products SET image = IF(image IS NULL OR image = '''', image_url, image) WHERE image_url IS NOT NULL',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'image_url'
);
PREPARE copy_image_stmt FROM @copy_image_sql;
EXECUTE copy_image_stmt;
DEALLOCATE PREPARE copy_image_stmt;

SET @drop_image_url_sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE products DROP COLUMN image_url',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'image_url'
);
PREPARE drop_image_url_stmt FROM @drop_image_url_sql;
EXECUTE drop_image_url_stmt;
DEALLOCATE PREPARE drop_image_url_stmt;

SET @drop_images_sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE products DROP COLUMN images',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'images'
);
PREPARE drop_images_stmt FROM @drop_images_sql;
EXECUTE drop_images_stmt;
DEALLOCATE PREPARE drop_images_stmt;

SET @drop_shelf_life_sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE products DROP COLUMN shelf_life',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'shelf_life'
);
PREPARE drop_shelf_life_stmt FROM @drop_shelf_life_sql;
EXECUTE drop_shelf_life_stmt;
DEALLOCATE PREPARE drop_shelf_life_stmt;

SET @drop_specs_sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE products DROP COLUMN specs',
    'SELECT 1'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @schema_name
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'specs'
);
PREPARE drop_specs_stmt FROM @drop_specs_sql;
EXECUTE drop_specs_stmt;
DEALLOCATE PREPARE drop_specs_stmt;

ALTER TABLE products
  MODIFY COLUMN name VARCHAR(200) NOT NULL AFTER id,
  MODIFY COLUMN category_id BIGINT UNSIGNED NULL AFTER name,
  MODIFY COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER category_id,
  MODIFY COLUMN original_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER price,
  MODIFY COLUMN stock INT NOT NULL DEFAULT 0 AFTER original_price,
  MODIFY COLUMN sales_count INT NOT NULL DEFAULT 0 AFTER stock,
  MODIFY COLUMN sales INT NOT NULL DEFAULT 0 AFTER sales_count,
  MODIFY COLUMN image VARCHAR(500) DEFAULT '' AFTER sales,
  MODIFY COLUMN description TEXT NULL AFTER image,
  MODIFY COLUMN status TINYINT NOT NULL DEFAULT 1 COMMENT '1 on sale, 0 off sale' AFTER description,
  MODIFY COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER status,
  MODIFY COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

INSERT INTO categories (id, name, icon_url, sort_order, status, created_at, updated_at) VALUES
(1, '饮料', '/images/cat-0.png', 1, 1, NOW(), NOW()),
(2, '泡面', '/images/cat-1.png', 2, 1, NOW(), NOW()),
(3, '薯片', '/images/cat-2.png', 3, 1, NOW(), NOW()),
(4, '辣条', '/images/cat-3.png', 4, 1, NOW(), NOW()),
(5, '饼干', '/images/cat-4.png', 5, 1, NOW(), NOW()),
(6, '糖果', '/images/cat-5.png', 6, 1, NOW(), NOW()),
(7, '面包', '/images/cat-6.png', 7, 1, NOW(), NOW()),
(8, '速食食品', '/images/cat-7.png', 8, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  icon_url = VALUES(icon_url),
  sort_order = VALUES(sort_order),
  status = VALUES(status),
  updated_at = CURRENT_TIMESTAMP;

DROP TEMPORARY TABLE IF EXISTS seed_products;

CREATE TEMPORARY TABLE seed_products (
  name VARCHAR(200) NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL,
  sales_count INT NOT NULL,
  sales INT NOT NULL,
  image VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  status TINYINT NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO seed_products
  (name, category_id, price, original_price, stock, sales_count, sales, image, description, status, created_at, updated_at)
VALUES
('可口可乐500ml', 1, 3.50, 4.00, 100, 0, 0, '/images/goods-1.png', '宿舍常备饮料，可口可乐500ml，冰镇后口感更佳。', 1, NOW(), NOW()),
('百事可乐500ml', 1, 3.50, 4.00, 100, 0, 0, '/images/goods-2.png', '经典汽水饮料，百事可乐500ml，适合聚餐和夜宵。', 1, NOW(), NOW()),
('雪碧500ml', 1, 3.50, 4.00, 100, 0, 0, '/images/goods-3.png', '清爽柠檬味汽水，雪碧500ml，解渴清新。', 1, NOW(), NOW()),
('芬达橙味500ml', 1, 3.50, 4.00, 100, 0, 0, '/images/goods-4.png', '橙味气泡饮料，芬达橙味500ml，口感香甜。', 1, NOW(), NOW()),
('农夫山泉550ml', 1, 2.00, 2.50, 200, 0, 0, '/images/goods-5.png', '宿舍学习运动常备饮用水，农夫山泉550ml。', 1, NOW(), NOW()),
('康师傅冰红茶500ml', 1, 3.00, 3.50, 100, 0, 0, '/images/goods-6.png', '茶香清爽，康师傅冰红茶500ml，适合饭后饮用。', 1, NOW(), NOW()),
('统一绿茶500ml', 1, 3.00, 3.50, 100, 0, 0, '/images/goods-7.png', '清新绿茶饮料，统一绿茶500ml，低负担解腻。', 1, NOW(), NOW()),
('元气森林白桃味', 1, 5.00, 6.00, 80, 0, 0, '/images/goods-8.png', '白桃风味气泡水，口感轻盈，适合宿舍囤货。', 1, NOW(), NOW()),

('康师傅红烧牛肉面', 2, 5.50, 6.00, 100, 0, 0, '/images/goods-9.png', '经典红烧牛肉风味泡面，夜宵和赶课前快速补能。', 1, NOW(), NOW()),
('康师傅香辣牛肉面', 2, 5.50, 6.00, 100, 0, 0, '/images/goods-10.png', '香辣牛肉味泡面，汤底浓郁，适合重口味同学。', 1, NOW(), NOW()),
('统一老坛酸菜面', 2, 5.50, 6.00, 100, 0, 0, '/images/goods-11.png', '酸爽开胃的老坛酸菜风味泡面，宿舍夜宵热门款。', 1, NOW(), NOW()),
('今麦郎弹面', 2, 4.50, 5.00, 100, 0, 0, '/images/goods-12.png', '面条劲道弹滑，价格实惠，适合日常囤货。', 1, NOW(), NOW()),
('白象大骨面', 2, 5.00, 5.50, 100, 0, 0, '/images/goods-1.png', '大骨汤风味泡面，汤感醇厚，简单方便。', 1, NOW(), NOW()),

('乐事原味薯片', 3, 6.00, 7.00, 100, 0, 0, '/images/goods-2.png', '经典原味薯片，香脆可口，追剧学习都合适。', 1, NOW(), NOW()),
('乐事黄瓜味薯片', 3, 6.00, 7.00, 100, 0, 0, '/images/goods-3.png', '黄瓜清香口味薯片，清爽不腻。', 1, NOW(), NOW()),
('乐事番茄味薯片', 3, 6.00, 7.00, 100, 0, 0, '/images/goods-4.png', '酸甜番茄味薯片，宿舍零食分享款。', 1, NOW(), NOW()),
('可比克薯片', 3, 5.00, 6.00, 100, 0, 0, '/images/goods-5.png', '酥脆可口的桶装薯片，便携耐放。', 1, NOW(), NOW()),
('上好佳薯片', 3, 4.50, 5.00, 100, 0, 0, '/images/goods-6.png', '经典膨化薯片，价格亲民，适合日常加购。', 1, NOW(), NOW()),

('卫龙大面筋', 4, 3.00, 3.50, 200, 0, 0, '/images/goods-7.png', '宿舍人气辣条，香辣有嚼劲，解馋必备。', 1, NOW(), NOW()),
('卫龙亲嘴烧', 4, 2.00, 2.50, 200, 0, 0, '/images/goods-8.png', '小包装辣味零食，方便分享，口感香辣。', 1, NOW(), NOW()),
('麻辣王子辣条', 4, 4.00, 4.50, 100, 0, 0, '/images/goods-9.png', '麻辣鲜香，辣味更足，适合重辣爱好者。', 1, NOW(), NOW()),
('翻天娃辣条', 4, 3.50, 4.00, 100, 0, 0, '/images/goods-10.png', '经典辣条小吃，口味浓郁，宿舍追剧搭档。', 1, NOW(), NOW()),

('奥利奥夹心饼干', 5, 6.50, 7.50, 100, 0, 0, '/images/goods-11.png', '经典夹心饼干，香甜酥脆，适合早餐或下午茶。', 1, NOW(), NOW()),
('趣多多曲奇', 5, 7.00, 8.00, 100, 0, 0, '/images/goods-12.png', '巧克力豆曲奇饼干，口感酥松，甜食爱好者常备。', 1, NOW(), NOW()),
('太平苏打饼干', 5, 5.00, 5.50, 100, 0, 0, '/images/goods-1.png', '清淡苏打饼干，饱腹耐放，适合学习间隙补充。', 1, NOW(), NOW()),
('达利园饼干', 5, 5.50, 6.00, 100, 0, 0, '/images/goods-2.png', '香脆饼干，独立包装，宿舍分享更方便。', 1, NOW(), NOW()),

('阿尔卑斯硬糖', 6, 0.50, 0.80, 500, 0, 0, '/images/goods-3.png', '经典硬糖，单颗购买方便，适合随手加购。', 1, NOW(), NOW()),
('大白兔奶糖', 6, 1.00, 1.20, 300, 0, 0, '/images/goods-4.png', '浓郁奶香糖果，经典口味，宿舍常备小甜食。', 1, NOW(), NOW()),
('徐福记酥糖', 6, 1.00, 1.20, 300, 0, 0, '/images/goods-5.png', '香酥甜口糖果，独立小包装，方便分享。', 1, NOW(), NOW()),

('达利园蛋黄派', 7, 2.50, 3.00, 100, 0, 0, '/images/goods-6.png', '松软蛋黄派，甜香饱腹，适合早餐或夜宵。', 1, NOW(), NOW()),
('盼盼法式小面包', 7, 3.00, 3.50, 100, 0, 0, '/images/goods-7.png', '软糯小面包，独立包装，适合宿舍囤货。', 1, NOW(), NOW()),
('桃李面包', 7, 4.00, 4.50, 100, 0, 0, '/images/goods-8.png', '新鲜软面包，早餐和课间补能都合适。', 1, NOW(), NOW()),

('自热火锅', 8, 15.00, 18.00, 50, 0, 0, '/images/goods-9.png', '无需明火的自热火锅，宿舍聚餐方便快捷。', 1, NOW(), NOW()),
('自热米饭', 8, 12.00, 15.00, 50, 0, 0, '/images/goods-10.png', '自热米饭套餐，饱腹方便，适合忙碌学习日。', 1, NOW(), NOW()),
('火腿肠', 8, 2.00, 2.50, 300, 0, 0, '/images/goods-11.png', '即食火腿肠，泡面搭档，宿舍常备加餐。', 1, NOW(), NOW()),
('卤蛋', 8, 1.50, 2.00, 300, 0, 0, '/images/goods-12.png', '入味卤蛋，即开即食，泡面和夜宵好搭档。', 1, NOW(), NOW());

INSERT INTO products
  (name, category_id, price, original_price, stock, sales_count, sales, image, description, status, created_at, updated_at)
SELECT
  s.name,
  s.category_id,
  s.price,
  s.original_price,
  s.stock,
  s.sales_count,
  s.sales,
  s.image,
  s.description,
  s.status,
  s.created_at,
  s.updated_at
FROM seed_products s
WHERE NOT EXISTS (
  SELECT 1
  FROM products p
  WHERE p.name = s.name
);

DROP TEMPORARY TABLE seed_products;

