CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK
      (role IN ('customer','delivery','restaurant','admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE restaurants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE food_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(80),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE restaurant_menu (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    restaurant_id BIGINT REFERENCES restaurants(id),
    food_id BIGINT REFERENCES food_items(id),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    is_available BOOLEAN DEFAULT TRUE,
    UNIQUE(restaurant_id, food_id)
);

CREATE TABLE orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT REFERENCES users(id),
    restaurant_id BIGINT REFERENCES restaurants(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'COD',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    food_id BIGINT REFERENCES food_items(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL
);

