CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100),
    status ENUM('pending', 'ready', 'claimed') DEFAULT 'pending',
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO products (name, description, price, category) VALUES
('Bulldog Shirt', 'Official NU Bulldogs shirt', 450.00, 'Apparel'),
('Bulldog Hoodie', 'Warm hoodie with bulldog logo', 850.00, 'Apparel'),
('NU Cap', 'Adjustable cap with embroidered logo', 350.00, 'Accessories'),
('Bulldog Lanyard', 'ID lanyard with bulldog design', 150.00, 'Accessories'),
('NU Notebook', 'Official university notebook', 120.00, 'School Supplies'),
('Bulldog Mug', 'Ceramic mug with bulldog print', 250.00, 'Accessories');
