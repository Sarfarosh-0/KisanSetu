-- ===========================================================================
-- KisanSetu — Neon PostgreSQL Schema
-- SIH26033: Direct Farmer-to-Consumer Digital Agri-Marketplace
-- ===========================================================================
-- HOW TO USE:
--   1. Open https://neon.tech → your project → SQL Editor
--   2. Paste this entire file and click "Run"
--   3. All tables will be created (safe to run multiple times — uses IF NOT EXISTS)
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Table: users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100)    NOT NULL,
    phone               VARCHAR(20)     NOT NULL UNIQUE,
    email               VARCHAR(100),
    role                VARCHAR(30)     NOT NULL DEFAULT 'FARMER',
    fpo_name            VARCHAR(150),
    district            VARCHAR(100)    NOT NULL,
    state               VARCHAR(100)    NOT NULL,
    lat                 FLOAT,
    lng                 FLOAT,
    trust_score         FLOAT           NOT NULL DEFAULT 4.8,
    verified            BOOLEAN         NOT NULL DEFAULT TRUE,
    kyc_status          VARCHAR(50)     NOT NULL DEFAULT 'KYC_VERIFIED',
    total_trades        INTEGER         NOT NULL DEFAULT 12,
    rating_count        INTEGER         NOT NULL DEFAULT 10,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_phone ON users (phone);

-- ---------------------------------------------------------------------------
-- Table: crop_listings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crop_listings (
    id                          SERIAL PRIMARY KEY,
    farmer_id                   INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name                   VARCHAR(100)    NOT NULL,
    variety                     VARCHAR(100)    NOT NULL,
    quantity_quintals           FLOAT           NOT NULL,
    quality_grade               VARCHAR(20)     NOT NULL DEFAULT 'Grade A',
    harvest_date                VARCHAR(50)     NOT NULL,
    district                    VARCHAR(100)    NOT NULL,
    state                       VARCHAR(100)    NOT NULL,
    pincode                     VARCHAR(20)     NOT NULL,
    lat                         FLOAT           NOT NULL,
    lng                         FLOAT           NOT NULL,
    is_organic                  BOOLEAN         NOT NULL DEFAULT FALSE,
    expected_price_per_quintal  FLOAT           NOT NULL,
    mandi_benchmark_price       FLOAT           NOT NULL,
    ai_recommended_min          FLOAT           NOT NULL,
    ai_recommended_max          FLOAT           NOT NULL,
    ai_recommended_target       FLOAT           NOT NULL,
    status                      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    notes                       TEXT,
    image_url                   VARCHAR(255),
    images                      TEXT,
    created_at                  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_crop_listings_crop_name ON crop_listings (crop_name);
CREATE INDEX IF NOT EXISTS ix_crop_listings_farmer_id  ON crop_listings (farmer_id);
CREATE INDEX IF NOT EXISTS ix_crop_listings_status     ON crop_listings (status);

-- ---------------------------------------------------------------------------
-- Table: orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                      SERIAL PRIMARY KEY,
    order_number            VARCHAR(50)     NOT NULL UNIQUE,
    listing_id              INTEGER         NOT NULL REFERENCES crop_listings(id),
    buyer_id                INTEGER         NOT NULL REFERENCES users(id),
    farmer_id               INTEGER         NOT NULL REFERENCES users(id),
    quantity_ordered        FLOAT           NOT NULL,
    price_per_quintal       FLOAT           NOT NULL,
    total_produce_amount    FLOAT           NOT NULL,
    logistics_fee           FLOAT           NOT NULL DEFAULT 0.0,
    platform_fee            FLOAT           NOT NULL DEFAULT 0.0,
    total_amount            FLOAT           NOT NULL,
    status                  VARCHAR(30)     NOT NULL DEFAULT 'PLACED',
    payment_status          VARCHAR(30)     NOT NULL DEFAULT 'PENDING',
    payment_ref             VARCHAR(100),
    delivery_address        TEXT            NOT NULL,
    delivery_pincode        VARCHAR(20)     NOT NULL,
    delivery_lat            FLOAT,
    delivery_lng            FLOAT,
    delivery_otp            VARCHAR(10)     NOT NULL DEFAULT '4829',
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_orders_order_number ON orders (order_number);
CREATE INDEX IF NOT EXISTS ix_orders_buyer_id     ON orders (buyer_id);
CREATE INDEX IF NOT EXISTS ix_orders_farmer_id    ON orders (farmer_id);

-- ---------------------------------------------------------------------------
-- Table: mandi_prices
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mandi_prices (
    id              SERIAL PRIMARY KEY,
    crop_name       VARCHAR(100)    NOT NULL,
    market_name     VARCHAR(150)    NOT NULL,
    district        VARCHAR(100)    NOT NULL,
    state           VARCHAR(100)    NOT NULL,
    min_price       FLOAT           NOT NULL,
    max_price       FLOAT           NOT NULL,
    modal_price     FLOAT           NOT NULL,
    arrival_date    VARCHAR(50)     NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_mandi_prices_crop_name ON mandi_prices (crop_name);

-- ---------------------------------------------------------------------------
-- Table: logistics_batches
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logistics_batches (
    id                      SERIAL PRIMARY KEY,
    batch_code              VARCHAR(50)     NOT NULL UNIQUE,
    driver_name             VARCHAR(100)    NOT NULL,
    vehicle_number          VARCHAR(50)     NOT NULL,
    total_distance_km       FLOAT           NOT NULL,
    naive_distance_km       FLOAT           NOT NULL,
    distance_saved_pct      FLOAT           NOT NULL,
    transit_time_saved_hrs  FLOAT           NOT NULL,
    status                  VARCHAR(30)     NOT NULL DEFAULT 'SCHEDULED',
    route_data_json         TEXT,
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_logistics_batches_batch_code ON logistics_batches (batch_code);

-- ---------------------------------------------------------------------------
-- Table: crop_rfqs  (Requests for Quotation)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crop_rfqs (
    id                          VARCHAR(50)     PRIMARY KEY,
    listing_id                  INTEGER         NOT NULL REFERENCES crop_listings(id),
    buyer_id                    INTEGER         NOT NULL REFERENCES users(id),
    farmer_id                   INTEGER         NOT NULL REFERENCES users(id),
    crop_name                   VARCHAR(100)    NOT NULL,
    variety                     VARCHAR(100)    NOT NULL,
    farmer_name                 VARCHAR(100),
    fpo_name                    VARCHAR(150),
    buyer_name                  VARCHAR(100),
    buyer_company               VARCHAR(150),
    buyer_phone                 VARCHAR(30),
    required_quantity_quintals  FLOAT           NOT NULL,
    expected_price_per_quintal  FLOAT           NOT NULL,
    delivery_location           VARCHAR(255)    NOT NULL,
    delivery_pincode            VARCHAR(20)     NOT NULL,
    delivery_timeline           VARCHAR(100)    NOT NULL,
    message                     TEXT,
    status                      VARCHAR(30)     NOT NULL DEFAULT 'SUBMITTED',
    created_at                  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_crop_rfqs_buyer_id   ON crop_rfqs (buyer_id);
CREATE INDEX IF NOT EXISTS ix_crop_rfqs_farmer_id  ON crop_rfqs (farmer_id);
CREATE INDEX IF NOT EXISTS ix_crop_rfqs_listing_id ON crop_rfqs (listing_id);

-- ===========================================================================
-- Verify: list all created tables
-- ===========================================================================
SELECT table_name
FROM   information_schema.tables
WHERE  table_schema = 'public'
ORDER  BY table_name;
