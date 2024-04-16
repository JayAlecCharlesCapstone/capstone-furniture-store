const {client} = require("./client")
const bcrypt = require("bcrypt")



async function getOrdersByCustomerId(customerId) {
    try {
        const { rows } = await client.query(`
            SELECT o.order_id, o.order_date, oi.order_item_id, oi.product_id, p.name AS product_name, oi.quantity, oi.price_per_unit
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.customer_id = $1;
        `, [customerId]);

        const orders = rows.reduce((acc, row) => {
            const { order_id, order_date, ...item } = row;
            const existingOrder = acc.find(order => order.order_id === order_id);
            if (existingOrder) {
                existingOrder.items.push(item);
            } else {
                acc.push({ order_id, order_date, items: [item] });
            }
            return acc;
        }, []);

        return orders;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getOrdersByCustomerId
}