CREATE DATABASE IF NOT EXISTS dorm_snack_mall
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE dorm_snack_mall;

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
