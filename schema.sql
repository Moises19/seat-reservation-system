-- 1. Crear extensiones necesarias (para UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumerados para estados
CREATE TYPE seat_status AS ENUM ('available', 'reserved', 'occupied');
CREATE TYPE hold_status AS ENUM ('active', 'expired', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- 3. Tabla de Funciones / Proyecciones
CREATE TABLE shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_title VARCHAR(255) NOT NULL,
    screen_name VARCHAR(100) NOT NULL, -- Ej: "Sala 1"
    show_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Asientos por Sala/Función
CREATE TABLE show_seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    seat_code VARCHAR(10) NOT NULL, -- Ej: "A-1", "B-5"
    row_label VARCHAR(5) NOT NULL,  -- Ej: "A"
    seat_number INT NOT NULL,       -- Ej: 1
    price NUMERIC(10, 2) NOT NULL,
    is_vip BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE, -- Pasillos / fuera de servicio
    UNIQUE(show_id, seat_code)
);

-- 5. Tabla de Bloqueos Temporales (Holds)
CREATE TABLE seat_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID NOT NULL REFERENCES shows(id),
    session_id VARCHAR(255) NOT NULL,
    status hold_status DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla Pivote: Asientos bloqueados por Hold
CREATE TABLE seat_hold_items (
    hold_id UUID NOT NULL REFERENCES seat_holds(id) ON DELETE CASCADE,
    show_seat_id UUID NOT NULL REFERENCES show_seats(id) ON DELETE CASCADE,
    PRIMARY KEY (hold_id, show_seat_id)
);

-- 7. Tabla de Reservas Confirmadas / Ventas
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hold_id UUID UNIQUE REFERENCES seat_holds(id),
    show_id UUID NOT NULL REFERENCES shows(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
    payment_status payment_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES DE RENDIMIENTO (Cruciales para concurrencia)
CREATE INDEX idx_show_seats_show_id ON show_seats(show_id);
CREATE INDEX idx_seat_holds_expires_at ON seat_holds(expires_at) WHERE status = 'active';