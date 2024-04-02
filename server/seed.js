async function dropTables(){
    try{
     console.log("creating tables");
     
     
     await client.query(`
     DROP TABLE IF EXISTS CUSTOMERS;
     DROP TABLE IF EXISTS ADDRESSES;
     DROP TABLE IF EXISTS PRODUCTS;
     DROP TABLE IF EXISTS ORDERS
     DROP TABLE IF EXISTS ORDERS_ITEMS;
     DROP TABLE IF EXISTS ADMIN_USERS;
     DROP TABLE IF EXISTS CART

     `);
     console.log("finished dropping tables!")
    }catch(err){
        console.err("Error dropping tables!")
        throw err;
    }
}

async function createTables(){
    try{
        console.log("starting to build tables...")
        await client.query(`
        CREATE TABLE Customers (
            customer_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            phone VARCHAR(20),
            address_id INT,
            FOREIGN KEY (address_id) REFERENCES Addresses(address_id)
        );

        CREATE TABLE Addresses (
            address_id SERIAL PRIMARY KEY,
            street_address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100),
            country VARCHAR(100) NOT NULL,
            postal_code VARCHAR(20) NOT NULL
        );

        CREATE TABLE Products (
            product_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            stock_quantity INT NOT NULL
        );

        CREATE TABLE Orders (
            order_id SERIAL PRIMARY KEY,
            customer_id INT NOT NULL,
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            shipping_address_id INT,
            FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
            FOREIGN KEY (shipping_address_id) REFERENCES Addresses(address_id)
        );

        CREATE TABLE Order_Items (
            order_item_id SERIAL PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            price_per_unit DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES Orders(order_id),
            FOREIGN KEY (product_id) REFERENCES Products(product_id)
        );

        CREATE TABLE Admin_Users (
            admin_id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL 
        );

        CREATE TABLE Cart (
            cart_id SERIAL PRIMARY KEY,
            customer_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES Customers(customer_id),
            FOREIGN KEY (product_id) REFERENCES Products(product_id)
        );
    `);

    console.log("finished building tables!")
    }catch(err){
        console.err("error building tables!")
        throw err;
    }
}

async function createInitialCustomers(){
    try{
        console.log("starting to create users...");
        await create
    }
}