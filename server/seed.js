const { createCustomers, createProducts, getAllCustomers } = require("./db/index.js");


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
            username VARCHAR(100) NOT NULL,
            password VARCHAR(100) NOT NULL,
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
        await createCustomers({
            username: 'jay',
            password: 'jay123',
            name: 'Jay Haymes',
            email: 'jay@example.com',
            phone: '12345678910',
            street_address: "123 Main St",
            city: "anytown",
            state: "IL",
            country: "USA",
            postal_code:"12345"

        });
        console.log('finished creating users');
    }catch(err){
        console.err('err creating user!');
        throw err;
    }
}

async function createInitialProducts(){
    try{
        console.log('starting to create products...')
        await createProducts({
            name:'Office Chair',
            description:'A seat designed for use in office or workspace',
            price:'49.99',
            stock_quantity:'30'
        });

        await createProducts({
            name:'Sofa',
            description:'A long, comfortable seat with a back and usually with arms, which two or three people can sit on.',
            price:'899.99',
            stock_quantity:'20'
        });

        await createProducts({
            name:'Dining Table',
            description:'A table on which meals are served in a dining room',
            price:'499.99',
            stock_quantity:'42'
        });

        await createProducts({
            name:'Office Desk',
            description:'A piece of furniture that is specifically designed for use in an office setting.',
            price:'79.99',
            stock_quantity:'47'
        });

    }catch(err){
        console.log("error creating products")
        throw err;
    }
}


async function rebuildDb(){
    try{
        client.connect();

        await dropTables();
        await createTables();
        await createInitialCustomers();
        await createInitialProducts();
    }catch(err){
        console.log("error during rebuilddb")
        throw err;
    }
}

async function testDB(){
    try{
        const customers = await getAllCustomers();
        console.log("result:", customers)
    }catch(err){
        console.log("error during rebuild")
        throw error;
    }
}


rebuildDb()
.then(testDB)
.catch(console.error)
.finally(()=> client.end())

