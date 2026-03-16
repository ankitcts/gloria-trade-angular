db = db.getSiblingDB("gloria_trade_angular");

db.createCollection("users");
db.createCollection("user_sessions");
db.createCollection("countries");
db.createCollection("exchanges");
db.createCollection("securities");
db.createCollection("price_history_daily");
db.createCollection("portfolios");
db.createCollection("watchlists");
db.createCollection("orders");
db.createCollection("sentiment_records");
db.createCollection("ml_models");
db.createCollection("ml_predictions");
db.createCollection("notifications");

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.user_sessions.createIndex({ user_id: 1 });
db.user_sessions.createIndex({ refresh_token_hash: 1 });
db.securities.createIndex({ symbol: 1 });
db.securities.createIndex({ security_type: 1 });
db.price_history_daily.createIndex({ security_id: 1, date: -1 });
db.orders.createIndex({ user_id: 1 });
db.orders.createIndex({ status: 1 });
db.portfolios.createIndex({ user_id: 1 });
db.watchlists.createIndex({ user_id: 1 });
db.notifications.createIndex({ user_id: 1, is_read: 1 });

print("Gloria Trade Angular database initialized successfully.");
