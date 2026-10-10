const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'bulldog',
    password: process.env.DB_PASSWORD || 'change-me',
    database: process.env.DB_NAME || 'merchandise_db'
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.post('/orders', async (req, res) => {
    const { customer_name, customer_email, items } = req.body;
    if (!customer_name || !items || items.length === 0) {
        return res.status(400).json({ error: 'customer_name and items are required' });
    }
    try {
        let total = 0;
        for (const item of items) {
            const [product] = await pool.execute('SELECT price FROM products WHERE id = ?', [item.product_id]);
            if (product.length === 0) return res.status(404).json({ error: Product  not found });
            total += product[0].price * item.quantity;
        }
        const [orderResult] = await pool.execute(
            'INSERT INTO orders (customer_name, customer_email, total) VALUES (?, ?, ?)',
            [customer_name, customer_email || null, total]
        );
        const orderId = orderResult.insertId;
        for (const item of items) {
            const [product] = await pool.execute('SELECT price FROM products WHERE id = ?', [item.product_id]);
            const subtotal = product[0].price * item.quantity;
            await pool.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, subtotal]
            );
        }
        res.status(201).json({ message: 'Order created', order_id: orderId, total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/orders', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM orders');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/orders/:id', async (req, res) => {
    try {
        const [order] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (order.length === 0) return res.status(404).json({ error: 'Order not found' });
        const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        res.status(200).json({ ...order[0], items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/orders/:id', async (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    try {
        await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.status(200).json({ message: 'Order updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Order API running on port 3000'));
