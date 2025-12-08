INSERT INTO "PipelineStage" (id, name, "order", color, type, "createdAt", "updatedAt") VALUES
('NOVO', 'Novos Leads', 0, 'blue', 'OPEN', NOW(), NOW()),
('COTACAO', 'Em Cotação', 1, 'yellow', 'OPEN', NOW(), NOW()),
('FECHAMENTO', 'Fechamento', 2, 'purple', 'OPEN', NOW(), NOW()),
('GANHO', 'Ganho', 3, 'green', 'WON', NOW(), NOW()),
('PERDIDO', 'Perdido', 4, 'red', 'LOST', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
