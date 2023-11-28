import datetime
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
import sqlite3
from flasgger import Swagger
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user, logout_user

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.secret_key = '12345678'  
swagger = Swagger(app, template_file='swagger.yaml')
conn = sqlite3.connect('food.db', check_same_thread=False)
c = conn.cursor()
login_manager = LoginManager()
login_manager.init_app(app)

users = {'admin': {'password': 'admin'}}

class User(UserMixin):
    pass

@login_manager.user_loader
def load_user(user_id):
    if user_id in users:
        user = User()
        user.id = user_id
        return user
    return None

@app.route('/login', methods=['POST', 'GET'])
def login():
    """
    Log in to the application
    ---
    """
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
        else:
            username = request.form.get('username')
            password = request.form.get('password')

        if username in users and users[username]['password'] == password:
            user = User()
            user.id = username
            login_user(user)
            return jsonify(success=True)

        return jsonify(success=False), 401  # Unauthorized

    return render_template('login.html')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/admin')
@login_required
def admin():
    if current_user.is_authenticated:
        return render_template('admin.html')
    else:
        return redirect(url_for('login'))

#---------------------УПРАВЛЕНИЕ МЕНЮ---------------------------

@app.route("/admin/menu_items", methods=["GET"])
def admin_menu_items():
    if request.method == "GET":
        menu_items = get_menu_items()
        return jsonify(menu_items=menu_items)

def get_menu_items():
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("SELECT * FROM menu_items")
    menu_items = c.fetchall()
    conn.close()
    return menu_items

@app.route("/admin/add_menu_item", methods=["POST"])
def add_menu_item():
    try:
        data = request.json
        item_name = data["item_name"]
        price = float(data["price"])
        category_id = int(data["category_id"])

        conn = sqlite3.connect("food.db")
        c = conn.cursor()
        c.execute("INSERT INTO menu_items (item_name, price, category_id) VALUES (?, ?, ?)", (item_name, price, category_id))
        conn.commit()
        conn.close()
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e))

@app.route("/admin/menu_items/delete", methods=["POST"])
def delete_menu_item():
    try:
        data = request.get_json()
        item_id = data.get("item_id")

        if item_id is None:
            raise ValueError("Не указан ID блюда")

        if not menu_item_exists(item_id):
            raise ValueError("Блюдо с указанным ID не найдено")

        delete_menu_item_from_db(item_id)

        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e))


def menu_item_exists(item_id):
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("SELECT * FROM menu_items WHERE id=?", (item_id,))
    item = c.fetchone()
    conn.close()
    return item is not None

def delete_menu_item_from_db(item_id):
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("DELETE FROM menu_items WHERE id=?", (item_id,))
    conn.commit()
    conn.close()


@app.route("/admin/menu_items/edit", methods=["POST"])
def edit_menu_item():
    try:
        data = request.json
        print(request.json)  

        new_category = request.json.get("new_category")
        print(new_category) 
        item_id = int(data["item_id"])
        new_item_name = data["new_item_name"]
        new_price = float(data["new_price"])
        new_category = data["new_category"]

        if not menu_category_exists(new_category):
            raise ValueError("Категория не существует")

        conn = sqlite3.connect("food.db")
        c = conn.cursor()
        c.execute("UPDATE menu_items SET item_name=?, price=?, category_id=? WHERE id=?", (new_item_name, new_price, new_category, item_id))
        conn.commit()
        conn.close()

        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e))

#КАТЕГОРИИ

@app.route("/admin/menu_categories", methods=["GET"])
def get_menu_categories_route():
    categories = get_menu_categories()
    return jsonify(menu_categories=categories)

def get_menu_categories():
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("SELECT * FROM menu_categories")
    menu_categories = c.fetchall()
    conn.close()
    return menu_categories

@app.route("/admin/add_menu_category", methods=["POST"])
def add_menu_category():
    try:
        data = request.get_json()
        print("Received data:", data)  
        category_name = data.get("category_name")
        description = data.get("description")

        if not category_name:
            raise ValueError("Не указано название категории")

        if menu_category_exists(category_name):
            raise ValueError("Категория с таким названием уже существует")

        add_menu_category_to_db(category_name, description)

        return jsonify(success=True), 200
    except Exception as e:
        print("Error:", str(e))  
        return jsonify(error=str(e)), 500

def add_menu_category_to_db(category_name, description):
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("INSERT INTO menu_categories (category_name, description) VALUES (?, ?)", (category_name, description or ''))
    conn.commit()
    conn.close()


@app.route("/admin/menu_categories/delete", methods=["DELETE"])
def delete_menu_category():
    try:
        data = request.get_json()
        category_id = data.get("category_id")

        if category_id is None:
            raise ValueError("Не указан ID категории")

        if not menu_category_exists(category_id):
            raise ValueError("Категория с указанным ID не найдена")

        delete_menu_category_from_db(category_id)

        return jsonify(success=True), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

def menu_category_exists(category_id):
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("SELECT * FROM menu_categories WHERE id=?", (category_id,))
    category = c.fetchone()
    conn.close()
    return category is not None

def delete_menu_category_from_db(category_id):
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("DELETE FROM menu_categories WHERE id=?", (category_id,))
    conn.commit()
    conn.close()


@app.route("/admin/menu_categories/edit_description", methods=["POST"])
def edit_category_description():
    try:
        data = request.get_json()
        category_id = data.get("category_id")
        new_description = data.get("new_description")

        if category_id is None or new_description is None:
            raise ValueError("Не указан ID категории или новое описание")

        if not menu_category_exists(category_id):
            raise ValueError("Категория с указанным ID не найдена")

        edit_category_description_in_db(category_id, new_description)

        return jsonify(success=True), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

def edit_category_description_in_db(category_id, new_description):
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("UPDATE menu_categories SET description=? WHERE id=?", (new_description, category_id))
    conn.commit()
    conn.close()



#-----------------------------------------УПРАВЛЕНИЕ КУРЬЕРАМИ-----------------------------------

def get_couriers():
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("SELECT * FROM couriers")
    couriers_info = c.fetchall()
    conn.close()
    return couriers_info


@app.route("/admin/couriers", methods=["GET"])
def admin_cocouriers_info():
    if request.method == "GET":
        couriers_info = get_couriers()
        return jsonify(couriers_info=couriers_info)

    

@app.route("/admin/add_courier", methods=["GET", "POST"])
def add_courier():
    if request.method == "POST":
        try:
            data = request.json
            courier_name = data["courier_name"]
            contact_number = data["phone_num"]
            offline_interview_passed = data["offline_interview_passed"]

            conn = sqlite3.connect("food.db")
            c = conn.cursor()
            c.execute("INSERT INTO couriers (courier_name, contact_number, offline_interview_passed) VALUES (?, ?, ?)", (courier_name, contact_number, offline_interview_passed))
            conn.commit()
            conn.close()
            return jsonify(success=True)
        except Exception as e:
            return jsonify(success=False, error=str(e))

    return "Method Not Allowed", 405

@app.route("/admin/delete_courier", methods=["POST"])
def delete_courier():
    try:
        data = request.get_json()
        courier_id = data.get("courier_id")

        if courier_id is None:
            raise ValueError("Не указан ID курьера")

        if not courier_exists(courier_id):
            raise ValueError("Курьер с указанным ID не найден")

        delete_courier_from_db(courier_id)

        return jsonify(success=True), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

def courier_exists(courier_id):
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("SELECT * FROM couriers WHERE id=?", (courier_id,))
    courier = c.fetchone()
    conn.close()
    return courier is not None

def delete_courier_from_db(courier_id):
    conn = sqlite3.connect("food.db")
    c = conn.cursor()
    c.execute("DELETE FROM couriers WHERE id=?", (courier_id,))
    conn.commit()
    conn.close()

@app.route("/admin/edit_courier", methods=["POST"])
def edit_courier():
    try:
        data = request.json
        courier_id = data["courier_id"]
        new_name = data["new_name"]
        new_phone = data["new_phone"]
        new_interview_passed = data["new_interview_passed"]

        conn = sqlite3.connect("food.db")
        c = conn.cursor()
        c.execute("UPDATE couriers SET courier_name=?, contact_number=?, offline_interview_passed=? WHERE id=?",
                  (new_name, new_phone, new_interview_passed, courier_id))
        conn.commit()
        conn.close()

        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e))



#----------------------------УПРАВЛЕНИЕ ПРОМОКОДАМИ-----------------------------

@app.route("/admin/promotions_data", methods=["GET"])
def get_promotions_data():
    conn = sqlite3.connect("food.db")  
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM promotions")
    promotions_data = cursor.fetchall()

    conn.close()

    return jsonify(promotions_data=promotions_data)

@app.route("/admin/add_promotion", methods=["POST"])
def add_promotion():
    data = request.get_json()

    promo_code = data.get("promo_code")
    discount_amount = data.get("discount_amount")

    conn = sqlite3.connect("food.db")  
    cursor = conn.cursor()

    cursor.execute("INSERT INTO promotions (promo_code, discount_amount) VALUES (?, ?)", (promo_code, discount_amount))
    conn.commit()

    conn.close()

    return jsonify(success=True)

@app.route("/admin/delete_promotion", methods=["POST"])
def delete_promotion():
    data = request.get_json()

    promotion_id = data.get("promotion_id")

    conn = sqlite3.connect("food.db")  
    cursor = conn.cursor()

    cursor.execute("DELETE FROM promotions WHERE id=?", (promotion_id,))
    conn.commit()

    conn.close()

    return jsonify(success=True)

#----------------------------------------УПРАВЛЕНИЕ ФИЛИАЛАМИ--------------------------------------------------------------------

@app.route("/admin/branches_data", methods=["GET"])
def get_branches_data():
    if request.method == "GET":
        branches_data = get_branches()
        return jsonify(branches_data=branches_data)


@app.route("/admin/delete_branch", methods=["POST"])
def delete_branch():
    try:
        branch_id = request.json.get("branch_id")
        delete_branch_by_id(branch_id)
        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e))

def get_branches():
    with sqlite3.connect("food.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM branches")
        branches_data = cursor.fetchall()
    return branches_data

def delete_branch_by_id(branch_id):
    with sqlite3.connect("food.db") as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM branches WHERE id=?", (branch_id,))
        conn.commit()

@app.route("/admin/add_branch", methods=["POST"])
def add_branch():
    try:
        data = request.json
        branch_name = data.get("branch_name")
        location = data.get("location")

        if branch_name and location:
            add_branch_to_db(branch_name, location)
            return jsonify(success=True)
        else:
            return jsonify(success=False, error="Invalid data")
    except Exception as e:
        return jsonify(success=False, error=str(e))

def add_branch_to_db(branch_name, location):
    with sqlite3.connect("food.db") as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO branches (branch_name, location) VALUES (?, ?)", (branch_name, location))
        conn.commit()

@app.route("/admin/edit_branch", methods=["POST"])
def edit_branch():
    try:
        data = request.json
        branch_id = data.get("branch_id")
        new_name = data.get("new_name")
        new_location = data.get("new_location")

        if branch_id and new_name and new_location:
            edit_branch_in_db(branch_id, new_name, new_location)
            return jsonify(success=True)
        else:
            return jsonify(success=False, error="Invalid data")
    except Exception as e:
        return jsonify(success=False, error=str(e))
def edit_branch_in_db(branch_id, new_name, new_location):
    with sqlite3.connect("food.db") as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE branches SET branch_name=?, location=? WHERE id=?", (new_name, new_location, branch_id))
        conn.commit()


#------------------ЗАКАЗЫ----------------------------------------------------

def get_orders():
    with sqlite3.connect("food.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, customer_name, order_time, cancelled FROM orders")
        orders = cursor.fetchall()
    return orders

def delete_order(order_id):
    with sqlite3.connect("food.db") as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM orders WHERE id=?", (order_id,))
        conn.commit()

@app.route("/admin/orders_data", methods=["GET"])
def get_orders_data():
    if request.method == "GET":
        orders_data = get_orders()
        return jsonify(orders_data=orders_data)

@app.route("/admin/delete_order", methods=["POST"])
def delete_order_route():
    data = request.get_json()
    order_id = data.get("order_id")

    delete_order(order_id)

    return jsonify(success=True)

if __name__ == "__main__":
    app.run(debug=True)
