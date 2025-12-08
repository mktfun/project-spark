CREATE TABLE IF NOT EXISTS "User" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) DEFAULT 'BROKER',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Contact" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(255) UNIQUE NOT NULL,
    document VARCHAR(255),
    type VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Deal" (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title VARCHAR(255) NOT NULL,
    value DECIMAL,
    stage VARCHAR(255) NOT NULL,
    priority VARCHAR(255) DEFAULT 'MEDIUM',
    "contactId" VARCHAR(255) NOT NULL,
    "insuranceType" VARCHAR(255) NOT NULL,
    "insuranceData" JSONB,
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    "renewalDate" TIMESTAMP,
    status VARCHAR(255) DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("contactId") REFERENCES "Contact"(id)
);

CREATE TABLE IF NOT EXISTS "PipelineStage" (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL,
    color VARCHAR(255) DEFAULT 'blue',
    type VARCHAR(255) DEFAULT 'OPEN',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed pipeline stages
INSERT INTO "PipelineStage" (id, name, "order", color, type) VALUES
('NOVO', 'Novos Leads', 0, 'blue', 'OPEN'),
('COTACAO', 'Em Cotação', 1, 'yellow', 'OPEN'),
('FECHAMENTO', 'Fechamento', 2, 'purple', 'OPEN'),
('GANHO', 'Ganho', 3, 'green', 'WON'),
('PERDIDO', 'Perdido', 4, 'red', 'LOST')
ON CONFLICT (id) DO NOTHING;
