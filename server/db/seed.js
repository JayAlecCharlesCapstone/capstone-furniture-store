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
            image_url VARCHAR(500)
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
            image_url:'https://images.thdstatic.com/productImages/2d38eedb-521b-408c-8834-d76ada5546e4/svn/black-boss-office-products-executive-chairs-b8551-bk-64_1000.jpg'
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

        await createProducts({
            name: 'Coffee Table',
            description: 'A low table typically placed in front of a sofa, used for drinks, books, and other items.',
            price: '149.99',
            stock_quantity: '25',
            image_url: 'https://m.media-amazon.com/images/I/71eV6jJsMXL._AC_UF894,1000_QL80_.jpg'
        });
        
        await createProducts({
            name: 'Bookshelf',
            description: 'A piece of furniture with horizontal shelves, often in a cabinet, used to store books or other printed materials.',
            price: '199.99',
            stock_quantity: '35',
            image_url: 'https://assets.wfcdn.com/im/75410954/compr-r85/2021/202124290/bamboo-modern-bookcase-open-bookshelf-books-display-shelf-for-home.jpg'
        });
        
        await createProducts({
            name: 'TV Stand',
            description: 'A low cabinet or table on which a television is placed.',
            price: '129.99',
            stock_quantity: '30',
            image_url: 'https://i5.walmartimages.com/seo/HNEBC-LED-TV-Stand-USB-Wireless-Charging-Station-Television-Stands-Auto-Induction-Adjustable-Lights-TV-75-inch-Storage-Cabinet-Suitable-Living-Room-B_73413fad-88f9-4cc4-9ec7-6ccdfa8fff38.831600aef5bb5a063a7aa3634ce438ab.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF'
        });
        
        await createProducts({
            name: 'Bed Frame',
            description: 'A structure that supports and elevates a mattress.',
            price: '299.99',
            stock_quantity: '20',
            image_url: 'https://images-us-prod.cms.dynamics365commerce.ms/cms/api/cncgmclkfv/imageFileData/search?fileName=/Products/144007P_000_001.png'
        });
        
        await createProducts({
            name: 'Dresser',
            description: 'A piece of furniture with drawers, used typically for storing clothing.',
            price: '249.99',
            stock_quantity: '15',
            image_url: 'https://i5.walmartimages.com/seo/Better-Homes-Gardens-Modern-Farmhouse-6-Drawer-Dresser-Rustic-White-Finish_67aed562-4498-4f42-80e8-17b77f276860.4a5560054b1dd3ad1ee0a2463bc53744.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF'
        });
        
        await createProducts({
            name: 'Nightstand',
            description: 'A small table or cabinet intended to stand beside a bed.',
            price: '79.99',
            stock_quantity: '25',
            image_url: 'https://i5.walmartimages.com/seo/Mainstays-Hillside-Nightstand-with-Drawer-Espresso-Finish_4ef38d92-c065-46f3-9295-2794a3981ea9.3485c7f5e08e1efcb7ee0f8575d9cd3c.jpeg'
        });
        
        await createProducts({
            name: 'Recliner Chair',
            description: 'An armchair with a backrest that can be tilted back, and often a footrest that may be extended by means of a lever on the side of the chair.',
            price: '399.99',
            stock_quantity: '10',
            image_url: 'https://assets.wfcdn.com/im/15107791/resize-h755-w755%5Ecompr-r85/2279/227953864/Daquez+38.19%22+Wide+Manual+Swivel+Rocker+Recliner+Chair+with+Massager+and+Heat.jpg'
        });
        
        await createProducts({
            name: 'Bar Stool',
            description: 'A tall seat for one person, with no arms or back, often found at a bar or high table.',
            price: '59.99',
            stock_quantity: '40',
            image_url: 'https://m.media-amazon.com/images/I/81YY4i49+JL.jpg'
        });
        
        await createProducts({
            name: 'Desk Chair',
            description: 'A chair specifically designed for use with a desk, typically featuring adjustable height and swivel functionality.',
            price: '129.99',
            stock_quantity: '20',
            image_url: 'https://mobileimages.lowes.com/productimages/f3b49f08-3d4c-43c5-90d1-4ba08c2d3db1/15797895.jpg'
        });
        
        await createProducts({
            name: 'Corner Desk',
            description: 'A desk designed to fit into a corner of a room, often maximizing space efficiency.',
            price: '199.99',
            stock_quantity: '15',
            image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZgv193qk3ulnVJSRO9Fais867tZ90vboN1PgECfm2sA&s'
        });
        
        await createProducts({
            name: 'Folding Table',
            description: 'A table with legs that fold up against the underside of the table.',
            price: '69.99',
            stock_quantity: '30',
            image_url: 'https://cdn11.bigcommerce.com/s-lxku4v/images/stencil/1280x1280/products/1194/27417/81KALZZUWO-20171115-153352__06387.1522101903.jpg?c=2&imbypass=on'
        });
        
        await createProducts({
            name: 'Cabinet',
            description: 'A piece of furniture with doors and shelves, used for storing or displaying items.',
            price: '179.99',
            stock_quantity: '25',
            image_url: 'https://target.scene7.com/is/image/Target/GUEST_afb9cbce-5551-46ce-9d95-fb68ce425f33?wid=488&hei=488&fmt=pjpeg'
        });
        
        await createProducts({
            name: 'Accent Chair',
            description: 'A chair designed to stand out and add character to a room\'s decor.',
            price: '149.99',
            stock_quantity: '20',
            image_url: 'https://m.media-amazon.com/images/I/71q32o2in-L.jpg'
        });
        
        await createProducts({
            name: 'Rocking Chair',
            description: 'A chair mounted on curved bands that allow it to rock back and forth.',
            price: '199.99',
            stock_quantity: '15',
            image_url: 'https://target.scene7.com/is/image/Target/GUEST_857bd992-09f8-4d8f-9950-3fdc92abef3d'
        });
        
        await createProducts({
            name: 'Console Table',
            description: 'A narrow table designed to be placed against a wall.',
            price: '99.99',
            stock_quantity: '25',
            image_url: 'https://vinnahomeandkitchen.com/cdn/shop/files/LikeToBeHomeSpring-120_1.jpg?v=1707078662g'
        });
        
        await createProducts({
            name: 'Bean Bag Chair',
            description: 'A large fabric bag filled with small polystyrene beads, used as a seat.',
            price: '49.99',
            stock_quantity: '30',
            image_url: 'https://img.fruugo.com/product/2/92/848114922_max.jpg'
        });

        await createProducts({
            name: 'Chaise Lounge',
            description: 'A long chair for reclining, with a back and a single armrest.',
            price: '299.99',
            stock_quantity: '10',
            image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiYVyAj7axzek01U7dhSl6S31rbjeuGwqFXZDnS3s2sA&s'
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
