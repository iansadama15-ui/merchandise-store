from flask import Flask, request, jsonify
import mysql.connector
import os

app = Flask(__name__)

def get_db():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'db'),
        user=os.getenv('DB_USER', 'bulldog'),
        password=os.getenv('DB_PASSWORD', 'change-me'),
        database=os.getenv('DB_NAME', 'merchandise_db')
    )

@app.route('/health')
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/products', methods=['GET'])
def get_products():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(products), 200

@app.route('/products', methods=['POST'])
def add_product():
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"error": "name is required"}), 400
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO products (name, description, price, category) VALUES (%s, %s, %s, %s)",
        (data['name'], data.get('description', ''), data['price'], data.get('category', ''))
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"message": "Product added"}), 201

@app.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    data = request.get_json()
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE products SET name=%s, description=%s, price=%s, category=%s WHERE id=%s",
        (data['name'], data.get('description', ''), data['price'], data.get('category', ''), id)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"message": "Product updated"}), 200

@app.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("DELETE FROM products WHERE id=%s", (id,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"message": "Product deleted"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
