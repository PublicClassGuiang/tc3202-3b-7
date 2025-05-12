from flask import Blueprint, request, jsonify
from .models import db, Dishes, Orders, order_dishes, User
from flask_mail import Message
from flask import current_app, url_for
from flask_mail import Mail
from werkzeug.security import check_password_hash
from flask_jwt_extended import jwt_required, create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies, unset_jwt_cookies, get_jwt_identity

bp = Blueprint('dishes', __name__, url_prefix='/dishes')

mail = Mail()

def send_verification_email(user):
    token = User.generate_verification_token(user.email)
    verification_url = url_for('dishes.verify_email', token=token, _external=True)  # Flask route for email verification
    msg = Message('Verify Your Email', sender=current_app.config['MAIL_DEFAULT_SENDER'], recipients=[user.email])
    msg.body = f'Click the link to verify your email: {verification_url}'
    mail.send(msg)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not all(k in data for k in ('first_name', 'last_name', 'email', 'password')):
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 409

    new_user = User(email=data['email'], first_name=data['first_name'], last_name=data['last_name'])
    new_user.set_password(data['password'])

    try:
        db.session.add(new_user)
        db.session.commit()

        send_verification_email(new_user)

        return jsonify({'message': 'User registered successfully, check your email for verification'}), 201
    except Exception as e:
        db.session.rollback() 
        return jsonify({'message': 'Error registering user', 'error': str(e)}), 500


@bp.route('/verify-email/<token>', methods=['GET'])
def verify_email(token):
    user_email = User.verify_verification_token(token)
    
    if not user_email:
        return jsonify({'message': 'Invalid or expired token'}), 400
    
    user = User.query.filter_by(email=user_email).first()
    if user:
        user.verified = True
        db.session.commit()
        return jsonify({'message': 'Email verified successfully!'}), 200
    return jsonify({'message': 'User not found'}), 404

@bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json()

    if not data or 'email' not in data:
        return jsonify({'message': 'Missing email field'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if user.verified:
        return jsonify({'message': 'Email already verified'}), 400

    # Send verification email again
    send_verification_email(user)

    return jsonify({'message': 'Verification email resent successfully'}), 200

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print(data)
    if not data or not all(k in data for k in ('email', 'password')):
        print('here')
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = User.query.filter_by(email=data['email']).first()

    if not user:
        print('here1')
        return jsonify({'message': 'User not found'}), 404

    print("Received password:", data['password'])
    print("Stored hash:", user.password_hash)
    print("Password check result:", check_password_hash(user.password_hash, data['password']))
    print("Manual check:", check_password_hash(user.password_hash, 'Admin123'))

    if not check_password_hash(user.password_hash, data['password']):
        print('here2')
        return jsonify({'message': 'Invalid password'}), 401

    if not user.verified:
        print('here3')
        return jsonify({'message': 'Please verify your email to log in.'}), 403
    
    print('here22')
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    response = jsonify({'message': 'Login successful'})
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)

    return response, 200

@bp.route('/logout', methods=['POST'])
def logout():
    response = jsonify({"msg": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200

@bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    return jsonify({'message': 'Valid token'}), 200


@bp.route('/refresh', methods=['GET'])
@jwt_required(refresh=True)
def refresh_access_token():
    identity = get_jwt_identity() #this returns a string id so it does not need to parse it into integer
    access_token = create_access_token(identity=identity) #since identity is string no need to parse it into string
    response = jsonify({"message": "Token refreshed"})
    set_access_cookies(response, access_token)
    return response, 200






@bp.route('/all', methods=['GET'])
@jwt_required()
def all_dishes():
    user_id = int(get_jwt_identity())
    dishes = Dishes.query.filter_by(user_id=user_id).all()
    # dishes = Dishes.query.filter(Dishes.user_id == user_id).all()
    return jsonify([dish.as_dict() for dish in dishes]), 200

@bp.route('/create', methods=['POST'])
@jwt_required()
def create_dish():
    data = request.get_json()
    print('creating dish')
    if not data or 'dish_name' not in data or 'price' not in data:
        return jsonify({'error': 'Missing dish_name or price'}), 400

    if Dishes.query.filter_by(dish_name=data['dish_name']).first():
        return jsonify({'error': 'Dish already exists'}), 409
    
    user_id = int(get_jwt_identity())

    new_dish = Dishes(dish_name=data['dish_name'], price=data['price'], user_id=user_id)
    db.session.add(new_dish)
    db.session.commit()

    return jsonify(new_dish.as_dict()), 201

@bp.route('/dish/<int:dish_id>', methods=['GET'])
@jwt_required()
def get_dish(dish_id):
    user_id = int(get_jwt_identity())
    dish = Dishes.query.filter_by(id=dish_id, user_id=user_id)

    if not dish:
        return jsonify({'error': 'Dish not found'}), 404
    
    return jsonify(dish.as_dict()), 200

@bp.route('/dish/<int:dish_id>', methods=['PUT'])
@jwt_required()
def update_dish(dish_id):
    user_id = int(get_jwt_identity())
    dish = Dishes.query.filter_by(id=dish_id, user_id=user_id)

    if not dish:
        return jsonify({'error': 'Dish not found'}), 404
    
    data = request.get_json()

    if 'dish_name' in data:
        dish.dish_name = data['dish_name']
    if 'price' in data:
        dish.price = data['price']
    
    db.session.commit()

    return jsonify(dish.as_dict()), 200

@bp.route('/dish/<int:dish_id>', methods=['DELETE'])
@jwt_required()
def delete_dish(dish_id):
    user_id = int(get_jwt_identity())
    dish = Dishes.query.filter_by(id=dish_id, user_id=user_id)

    if not dish:
        return jsonify({'error': 'Dish not found'}), 404
    
    db.session.delete(dish)
    db.session.commit()

    return jsonify({'message': f'Dish {dish_id} deleted'}), 200


@bp.route('/order', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()

    if not data or 'items' not in data:
        return jsonify({'error': 'Missing items'}), 400

    items = data['items'] 
    if not isinstance(items, list) or not all('id' in item and 'quantity' in item for item in items):
        return jsonify({'error': 'Invalid items format'}), 400

    user_id = int(get_jwt_identity())

    new_order = Orders(user_id=user_id)
    db.session.add(new_order)
    db.session.flush() 

    for item in items:
        dish = Dishes.query.filter_by(id=item['id'], user_id=user_id).first()
        if not dish:
            db.session.rollback()
            return jsonify({'error': f"Dish with ID {item['id']} not found"}), 404

        stmt = order_dishes.insert().values(
            order_id=new_order.id,
            dish_id=dish.id,
            quantity=item['quantity'],
            price_at_order_time=dish.price
        )
        db.session.execute(stmt)

    db.session.commit()
    return jsonify({'message': 'Order created successfully', 'order_id': new_order.id}), 201


@bp.route('/orders', methods=['GET'])
@jwt_required()
def get_all_order():
    user_id = int(get_jwt_identity())
    orders = Orders.query.filter_by(user_id=user_id).all()
    result = []

    for order in orders:
        order_data = {
            "id": order.id,
            "order_time": order.order_time.isoformat(),
            "dishes": []
        }

        stmt = db.select(order_dishes).where(order_dishes.c.order_id == order.id)
        order_dishes_entries = db.session.execute(stmt).fetchall()

        for entry in order_dishes_entries:
            dish = Dishes.query.get(entry.dish_id)
            order_data["dishes"].append({
                "dish_id": dish.id,
                "dish_name": dish.dish_name,
                "price_at_order_time": entry.price_at_order_time,
                "quantity": entry.quantity
            })
        
        result.append(order_data)

    return jsonify(result), 200







# @bp.route('/wipe-dishes-orders', methods=['DELETE'])
# def wipe_dishes_and_orders():
#     try:
#         # Clear the many-to-many relationship table first
#         db.session.execute(order_dishes.delete())

#         # Delete dependent entities
#         Orders.query.delete()
#         Dishes.query.delete()

#         db.session.commit()
#         return jsonify({"message": "All dishes, orders, and related entries deleted."}), 200

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500