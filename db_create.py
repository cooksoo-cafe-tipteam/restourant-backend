
import sqlite3
import datetime
conn = sqlite3.connect("food.db")
c = conn.cursor()

c.execute(
    """
    CREATE TABLE IF NOT EXISTS menu_categories (
        id INTEGER PRIMARY KEY,
        category_name TEXT,
        description TEXT
    )
    """
)

c.execute(
    """
    CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY,
        item_name TEXT,
        price INTEGER,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES menu_categories(id)
    )
    """
)

c.execute(
    """
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        customer_name TEXT,
        order_time DATETIME,
        cancelled INTEGER DEFAULT 0
    )
    """
)

c.execute(
    """
    CREATE TABLE IF NOT EXISTS order_items (
        order_id INTEGER,
        item_id INTEGER,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (item_id) REFERENCES menu_items(id)
    )
    """
)

c.execute(
    """
    CREATE TABLE IF NOT EXISTS couriers (
        id INTEGER PRIMARY KEY,
        courier_name TEXT,
        contact_number TEXT,
        offline_interview_passed INTEGER DEFAULT 0
    )
    """
)

c.execute(
    """
    CREATE TABLE IF NOT EXISTS branches (
        id INTEGER PRIMARY KEY,
        branch_name TEXT,
        location TEXT
    )
    """
)

c.execute(
    """
    CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY,
        promo_code TEXT,
        discount_amount INTEGER
    )
    """
)

c.execute(
    """
    CREATE TABLE IF NOT EXISTS order_promotions (
        order_id INTEGER,
        promo_id INTEGER,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (promo_id) REFERENCES promotions(id)
    )
    """
)

c.execute("INSERT INTO menu_categories (category_name, description) VALUES ('Appetizers', 'Starters for the meal')")
c.execute("INSERT INTO menu_categories (category_name, description) VALUES ('Main Course', 'Main dishes')")
c.execute("INSERT INTO menu_categories (category_name, description) VALUES ('Desserts', 'Sweet treats')")

c.execute("INSERT INTO menu_items (item_name, price, category_id) VALUES ('Caesar Salad', 120, 1)")
c.execute("INSERT INTO menu_items (item_name, price, category_id) VALUES ('Margherita Pizza', 200, 2)")
c.execute("INSERT INTO menu_items (item_name, price, category_id) VALUES ('Chocolate Cake', 80, 3)")

c.execute("INSERT INTO orders (customer_name, order_time, cancelled) VALUES ('John Doe', '2023-11-24 10:00:00', 0)")
c.execute("INSERT INTO orders (customer_name, order_time, cancelled) VALUES ('Jane Smith', '2023-11-24 12:30:00', 1)")

c.execute("INSERT INTO order_items (order_id, item_id) VALUES (1, 1)")
c.execute("INSERT INTO order_items (order_id, item_id) VALUES (2, 2)")

c.execute("INSERT INTO couriers (courier_name, contact_number, offline_interview_passed) VALUES ('Courier 1', '123-456-7890', 1)")
c.execute("INSERT INTO couriers (courier_name, contact_number, offline_interview_passed) VALUES ('Courier 2', '987-654-3210', 0)")

c.execute("INSERT INTO branches (branch_name, location) VALUES ('Downtown', '123 Main St')")
c.execute("INSERT INTO branches (branch_name, location) VALUES ('Suburb', '456 Oak Ave')")

c.execute("INSERT INTO promotions (promo_code, discount_amount) VALUES ('SUMMER20', 20)")
c.execute("INSERT INTO promotions (promo_code, discount_amount) VALUES ('FREESHIP', 15)")

c.execute("INSERT INTO order_promotions (order_id, promo_id) VALUES (1, 1)")
c.execute("INSERT INTO order_promotions (order_id, promo_id) VALUES (2, 2)")

conn.commit()
conn.close()
