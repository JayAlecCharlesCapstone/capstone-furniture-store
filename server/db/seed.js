const { client } = require("./client")
const bcrypt = require('bcrypt')
const { createAdminUser, getAllAdminUsers } = require('./admin')
const { createCustomers, updateCustomers, getAllCustomers, getCustomersById } = require('./customers')
const { getOrdersByCustomerId } = require('./orders')
const { createProducts, getAllProducts, updateProduct } = require('./product')



async function dropTables() {
    try {
        console.log("Dropping tables...");

        await client.query(`
            DROP TABLE IF EXISTS Cart CASCADE;
            DROP TABLE IF EXISTS Order_Items CASCADE;
            DROP TABLE IF EXISTS Orders CASCADE;
            DROP TABLE IF EXISTS Products CASCADE;
            DROP TABLE IF EXISTS Addresses CASCADE;
            DROP TABLE IF EXISTS Customers CASCADE;
            DROP TABLE IF EXISTS Admin_Users CASCADE;
        `);

        console.log("Tables dropped successfully!");
    } catch (err) {
        console.error("Error dropping tables:", err.message);
        throw err;
    }
}


async function createTables() {
    try {
        console.log("Creating tables...");

        await client.query(`

        CREATE TABLE Addresses (
            address_id SERIAL PRIMARY KEY,
            street_address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100),
            country VARCHAR(100) NOT NULL,
            postal_code VARCHAR(20) NOT NULL
        );

        CREATE TABLE Customers (
            customer_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            phone VARCHAR(20),
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255),
            password_salt VARCHAR(255),
            address_id INT,
            FOREIGN KEY (address_id) REFERENCES Addresses(address_id)
        );
        

        CREATE TABLE Products (
            product_id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            stock_quantity INT NOT NULL,
            image_url VARCHAR(255)
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
            password_hash VARCHAR(255),
            password_salt VARCHAR(255)
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


        console.log("Tables created successfully!");
    } catch (err) {
        console.error("Error creating tables:", err.message);
        throw err;
    }
}

async function createInitialAdminUser() {
    try {
        console.log("Creating initial admin users....")
        const username = "jjhaymes";
        const password = "password123";

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await createAdminUser({
            username,
            password_hash: hashedPassword,
            password_salt: saltRounds
        })
    } catch (error) {
        console.error(error)
    }
}

async function createInitialCustomers() {
    try {
        console.log("Creating initial customers...");

        const customers = [
            {
                name: "Jay H",
                email: "jayh@example.com",
                phone: "1234567890",
                username: "jjhay",
                password: "password123",
                street_address: "123 Main St",
                city: "Anytown",
                state: "IL",
                country: "USA",
                postal_code: "12345"
            },
            {
                name: "Alec W",
                email: "Alecw@example.com",
                phone: "1234567890",
                username: "alecw",
                password: "password321",
                street_address: "321 Main St",
                city: "Anytown",
                state: "LA",
                country: "USA",
                postal_code: "54321"
            },
            {
                name: "Lil Charles",
                email: "lilcharles@example.com",
                phone: "5432167890",
                username: "lilcharles",
                password: "password987",
                street_address: "987 Main St",
                city: "Anytown",
                state: "GA",
                country: "USA",
                postal_code: "56789"
            }
        ];

        const saltRounds = 10;

        for (const customer of customers) {
            const { password, ...customerData } = customer;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await createCustomers({
                ...customerData,
                password_hash: hashedPassword,
                password_salt: saltRounds
            });
        }

        console.log('Initial customers created successfully!');
    } catch (err) {
        console.error('Error creating initial customers:', err.message);
        throw err;
    }
};



async function createInitialProducts() {
    try {
        console.log('Creating initial products...');
        await createProducts({
            name: 'Office Chair',
            description: 'A seat designed for use in office or workspace',
            price: '49.99',
            stock_quantity: '30',
            image_url:'https://www.nouhaus.com/cdn/shop/products/2_2_800x.png?v=1657245441'
        });

        await createProducts({
            name: 'Sofa',
            description: 'A long, comfortable seat with a back and usually with arms, which two or three people can sit on.',
            price: '899.99',
            stock_quantity: '20',
            image_url:'https://images.eq3.com/product-definitions/ckh3u370s7dxy01269b6hyibb/instance/ckwl5fymw000238618kzgyyf2/THUMBNAIL/343bda99-69a5-4898-a62b-45e572250344.jpg'
        });

        await createProducts({
            name: 'Dining Table',
            description: 'A table on which meals are served in a dining room',
            price: '499.99',
            stock_quantity: '42',
            image_url:'https://i.etsystatic.com/41227869/r/il/cfa40d/4631176414/il_570xN.4631176414_p4db.jpg'
        });

        await createProducts({
            name: 'Office Desk',
            description: 'A piece of furniture that is specifically designed for use in an office setting.',
            price: '79.99',
            stock_quantity: '47',
            image_url:'https://i5.walmartimages.com/seo/FEZIBO-55-x-24-Inch-Height-Adjustable-Electric-Standing-Desk-Double-Drawer-Stand-Up-Table-Storage-Shelf-Sit-Splice-Board-Black-Frame-Rustic-Brown-Top_602db03a-fc2e-4dee-86f4-1c629a0c573c.bff23421c44d54bcd6888497d2f65e85.jpeg?odnHeight=640&odnWidth=640&odnBg=FFFFFF'
        });

        console.log('Initial products created successfully!');
    } catch (err) {
        console.error('Error creating initial products:', err.message);
        throw err;
    }
}

async function rebuildDb() {
    try {
        await client.connect();

        await dropTables();
        await createTables();
        await createInitialAdminUser();
        await createInitialCustomers();
        await createInitialProducts();


        return true;
    } catch (err) {
        console.error("Error rebuilding database:", err.message);
        throw err;
    }
}



async function testDB() {
    try {
        console.log("Testing database...");
        const adminUsers = await getAllAdminUsers();
        console.log("Admin Users:", adminUsers);
        const customers = await getAllCustomers();
        console.log("Customers:", customers);
        const products = await getAllProducts();
        console.log("Products:", products)
        await client.end();
    } catch (err) {
        console.error("Error testing database:", err.message);
        throw err;
    }
}




rebuildDb()
    .then(testDB)
    .catch(console.error);
