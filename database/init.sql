-- =============================================
-- EsperaRojo ULima - Sprint 1
-- Script de inicialización de base de datos
-- =============================================

CREATE DATABASE IF NOT EXISTS esperarojo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE esperarojo_db;

-- =============================================
-- TABLAS
-- =============================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('estudiante', 'trabajador', 'admin') DEFAULT 'estudiante',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  latitud DECIMAL(10,7) NOT NULL,
  longitud DECIMAL(10,7) NOT NULL,
  direccion_texto VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS routes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL,
  direccion ENUM('ida','vuelta') NOT NULL,
  paradero_inicial_id INT DEFAULT NULL,
  paradero_final_id INT DEFAULT NULL,
  cantidad_paraderos INT NOT NULL DEFAULT 0,
  tiempo_estimado_min INT DEFAULT NULL,
  FOREIGN KEY (paradero_inicial_id) REFERENCES stops(id),
  FOREIGN KEY (paradero_final_id)   REFERENCES stops(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS route_stops (
  route_id INT NOT NULL,
  stop_id  INT NOT NULL,
  orden    INT NOT NULL,
  PRIMARY KEY (route_id, stop_id, orden),
  FOREIGN KEY (route_id) REFERENCES routes(id),
  FOREIGN KEY (stop_id)  REFERENCES stops(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS buses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_id INT NOT NULL,
  aforo_porcentaje INT NOT NULL DEFAULT 0,
  estado ENUM('activo','inactivo','mantenimiento') DEFAULT 'activo',
  FOREIGN KEY (route_id) REFERENCES routes(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(8,2) NOT NULL,
  descripcion TEXT,
  duracion_dias INT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  estado ENUM('activa','expirada','cancelada') DEFAULT 'activa',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
) ENGINE=InnoDB;

-- =============================================
-- SEED: PARADEROS (stops)
-- Coordenadas aproximadas sobre los corredores reales de Lima
-- Fuente base: paraderos_corredor_rojo.csv + corredorrojo.pe
-- =============================================

INSERT INTO stops (id, nombre, latitud, longitud, direccion_texto) VALUES
-- === Callao / La Perla (extremo oeste Ruta 201) ===
(1,   'Calle 66',             -12.0610, -77.1300, 'Av. La Paz, Callao'),
(2,   'Venezuela',            -12.0620, -77.1250, 'Av. Venezuela, Callao'),
(3,   'Óvalo la Perla',       -12.0630, -77.1200, 'Óvalo La Perla, Callao'),
(4,   'Bomberos',             -12.0640, -77.1160, 'Av. La Paz cdra 8, Callao'),
(5,   'Haya de la Torre',     -12.0650, -77.1120, 'Av. Víctor R. Haya de la Torre, Callao'),
(6,   'Base Naval',           -12.0680, -77.0940, 'Av. Venezuela cdra 34, Bellavista'),
(7,   'Los Insurgentes',      -12.0660, -77.1060, 'Av. de los Insurgentes, Callao'),
(8,   'Canamelares',          -12.0670, -77.1000, 'Av. Canamelares, San Miguel'),
(9,   'Honda',                -12.0720, -77.0900, 'Av. La Marina cdra 32, San Miguel'),
(10,  'Rafael Escardó',       -12.0740, -77.0850, 'Av. Rafael Escardó, San Miguel'),
(11,  'Parque de las Leyendas',-12.0720,-77.0830, 'Av. La Marina cdra 24, San Miguel'),
(12,  'Universitaria',        -12.0770, -77.0810, 'Av. Universitaria cdra 1, San Miguel'),
(13,  'Faucett',              -12.0710, -77.1000, 'Av. Faucett, Callao'),
(14,  'José Marti',           -12.0660, -77.1040, 'Av. José Martí, Callao'),
(15,  'Lopez Albujar',        -12.0645, -77.1140, 'Av. López Albújar, Callao'),
(16,  'Contisuyo',            -12.0750, -77.0870, 'Av. Contisuyo, San Miguel'),

-- === San Miguel / Pueblo Libre ===
(17,  'San Marcos',           -12.0580, -77.0820, 'Av. Universitaria cdra 10, Cercado de Lima'),
(18,  'Católica',             -12.0690, -77.0790, 'Av. Universitaria cdra 18, San Miguel'),
(19,  'La Mar',               -12.0740, -77.0770, 'Av. La Mar, San Miguel'),
(20,  'La Marina',            -12.0760, -77.0750, 'Av. La Marina, San Miguel'),
(21,  'Bartolomé Herrera',    -12.0785, -77.0680, 'Av. Bartolomé Herrera, Pueblo Libre'),
(22,  'Sucre',                -12.0800, -77.0610, 'Av. Sucre, Pueblo Libre'),
(23,  'Hospital Militar',     -12.0820, -77.0540, 'Av. Pershing cdra 2, Jesús María'),
(24,  'Gregorio Escobedo',    -12.0845, -77.0470, 'Av. Gregorio Escobedo, Jesús María'),

-- === Jesús María / San Isidro (corredor central compartido) ===
(25,  'Salaverry',            -12.0880, -77.0400, 'Av. Salaverry / Av. Javier Prado, Jesús María'),
(26,  'Javier Prado',         -12.0900, -77.0350, 'Av. Javier Prado Oeste, San Isidro'),
(27,  'Las Flores',           -12.0895, -77.0280, 'Av. Javier Prado cdra 20, San Isidro'),
(28,  'Los Cedros',           -12.0890, -77.0220, 'Av. Javier Prado cdra 24, San Isidro'),
(29,  'Las Palmeras',         -12.0885, -77.0160, 'Av. Javier Prado cdra 30, San Isidro'),
(30,  'Basadre',              -12.0880, -77.0100, 'Av. Javier Prado / Basadre, San Isidro'),
(31,  'Parodi',               -12.0875, -77.0040, 'Av. Javier Prado / Parodi, San Isidro'),
(32,  'Orquídeas',            -12.0870, -76.9990, 'Av. Javier Prado cdra 42, Surquillo'),
(33,  'Masías',               -12.0865, -76.9940, 'Av. Javier Prado / Masías, Surquillo'),
(34,  'Nicolás Arriola',      -12.0860, -76.9890, 'Av. Nicolás Arriola, San Luis'),
(35,  'Guardia Civil',        -12.0855, -76.9840, 'Av. Guardia Civil, San Borja'),
(36,  'Aviación',             -12.0850, -76.9790, 'Av. Aviación, San Borja'),
(37,  'San Luis',             -12.0845, -76.9750, 'Av. San Luis, San Borja'),
(38,  'Rosa Toro',            -12.0840, -76.9710, 'Av. Rosa Toro, San Luis'),
(39,  'Circunvalación',       -12.0835, -76.9680, 'Av. Circunvalación, Santiago de Surco'),
(40,  'Jockey',               -12.0870, -76.9650, 'Jockey Plaza, Santiago de Surco'),
(41,  'U. de Lima',           -12.0847, -76.9710, 'Av. Javier Prado Este cdra 46, Santiago de Surco'),
(42,  'Camacho',              -12.0830, -76.9620, 'Av. Javier Prado Este / Camacho, La Molina'),
(43,  'Los Frutales',         -12.0810, -76.9560, 'Av. Los Frutales, La Molina'),
(44,  'La Molina',            -12.0780, -76.9490, 'Av. Javier Prado Este / La Molina'),

-- === Ida/Vuelta extras del corredor central ===
(45,  'Pershing',             -12.0895, -77.0300, 'Av. Pershing, Jesús María'),
(46,  'Los Nogales',          -12.0882, -77.0120, 'Av. Los Nogales, San Isidro'),
(47,  'Arenales',             -12.0878, -77.0050, 'Av. Arenales, San Isidro'),
(48,  'Petit Thouars',        -12.0872, -77.0010, 'Av. Petit Thouars, San Isidro'),
(49,  'Quiñones',             -12.0858, -76.9860, 'Av. Quiñones, San Borja'),
(50,  'J. Borja',             -12.0838, -76.9700, 'Av. Javier Prado / San Borja'),
(51,  'La Floresta',          -12.0843, -76.9660, 'Av. La Floresta, Santiago de Surco'),
(52,  'Evitamiento',          -12.0837, -76.9640, 'Vía de Evitamiento, Santiago de Surco'),
(53,  'Clínica San Felipe',   -12.0845, -76.9630, 'Clínica San Felipe, Santiago de Surco'),
(54,  'Palmera (Los Sauces)', -12.0883, -77.0150, 'Av. Los Sauces, San Isidro'),

-- === La Molina / Ingenieros (compartido 201, 204, 209) ===
(55,  'Ingenieros',           -12.0760, -76.9410, 'Av. Ingenieros, La Molina'),
(56,  'Flora Tristán',        -12.0740, -76.9340, 'Av. Flora Tristán, La Molina'),
(57,  'Óvalo Huarochirí',     -12.0700, -76.9280, 'Óvalo Huarochirí, La Molina'),
(58,  'Huarochirí',           -12.0680, -76.9260, 'Av. Huarochirí, Santa Anita'),

-- === Ate / Ceres (extremo este Ruta 201, 209) ===
(59,  'Monumental',           -12.0620, -76.9180, 'Av. Monumental, Ate'),
(60,  'París',                -12.0560, -76.9100, 'Av. París, Ate'),
(61,  'Vista Alegre',         -12.0500, -76.9020, 'Av. Vista Alegre, Ate'),
(62,  'Holanda',              -12.0440, -76.8940, 'Av. Holanda, Ate'),
(63,  'Berlín',               -12.0380, -76.8870, 'Av. Berlín, Ate'),
(64,  'Ceres',                -12.0320, -76.8800, 'Paradero Ceres, Ate'),
(65,  'Metro de La Molina',   -12.0770, -76.9470, 'Metro La Molina, La Molina'),
(66,  'Constructores',        -12.0750, -76.9380, 'Av. Constructores, La Molina'),
(67,  'Industriales',         -12.0730, -76.9330, 'Av. Industriales, La Molina'),
(68,  'Separadora Industrial',-12.0500, -76.8950, 'Av. Separadora Industrial, Ate'),
(69,  'Mayorazgo',            -12.0450, -76.8900, 'Av. Mayorazgo, Ate'),
(70,  'Backus',               -12.0410, -76.8860, 'Planta Backus, Ate'),
(71,  'Josfel',               -12.0380, -76.8830, 'Av. Josfel, Ate'),
(72,  'Puruchuco',            -12.0350, -76.8800, 'Puruchuco, Ate'),
(73,  'Pista Nueva',          -12.0330, -76.8770, 'Pista Nueva, Ate'),
(74,  'Soldadura',            -12.0310, -76.8740, 'Av. Soldadura, Ate'),
(75,  'Los Angeles',          -12.0290, -76.8710, 'Av. Los Ángeles, Ate'),
(76,  'Tagore',               -12.0270, -76.8680, 'Av. Tagore, Ate'),

-- === Pachacámac (extensión sur Ruta 204) ===
(77,  'San Juan Bautista',    -12.2200, -76.8600, 'San Juan Bautista, Pachacámac'),
(78,  'Paradero 1',           -12.2100, -76.8650, 'Paradero 1, Pachacámac'),
(79,  'Víctor Malásquez',     -12.2000, -76.8700, 'Av. Víctor Malásquez, Pachacámac'),
(80,  'Las Dunas',            -12.1900, -76.8750, 'Las Dunas, Cieneguilla'),
(81,  'Sauces',               -12.1800, -76.8800, 'Los Sauces, Cieneguilla'),
(82,  'Madreselvas',          -12.1700, -76.8850, 'Av. Madreselvas, Cieneguilla'),
(83,  'Naplo',                -12.1600, -76.8900, 'Naplo, Pachacámac'),
(84,  'La Punta',             -12.1500, -76.8950, 'La Punta, Pachacámac'),
(85,  'Mónaco',               -12.1400, -76.9000, 'Mónaco, La Molina'),
(86,  'El Sol',               -12.1300, -76.9050, 'El Sol, La Molina'),
(87,  'Rinconada del Lago',   -12.1200, -76.9100, 'Rinconada del Lago, La Molina'),
(88,  'Laguna Grande',        -12.1100, -76.9150, 'Laguna Grande, La Molina'),
(89,  'A. Quesada',           -12.1050, -76.9200, 'Asoc. Quesada, La Molina'),
(90,  'Molicentro',           -12.1000, -76.9250, 'Molicentro, La Molina'),
(91,  'Centenario',           -12.0900, -76.9300, 'Av. Centenario, La Molina'),
(92,  'Miami',                -12.1350, -76.9020, 'Miami, La Molina'),
(93,  'Aruba',                -12.0950, -76.9270, 'Aruba, La Molina'),
(94,  'Parque',               -12.1050, -76.9230, 'Parque, La Molina'),
(95,  'Asunción',             -12.0980, -76.9290, 'Asunción, La Molina'),

-- === La Molina profundo (extensión Ruta 206) ===
(96,  'Ministerio',           -12.0760, -76.9440, 'Ministerio, La Molina'),
(97,  'Escuela PNP',          -12.0755, -76.9400, 'Escuela PNP, La Molina'),
(98,  'Los Sauces',           -12.0750, -76.9360, 'Los Sauces, La Molina'),
(99,  'Secoyas',              -12.0745, -76.9320, 'Secoyas, La Molina'),
(100, 'Cordillera Blanca',    -12.0740, -76.9280, 'Cordillera Blanca, La Molina'),
(101, 'Derecho',              -12.0735, -76.9240, 'Derecho, La Molina'),
(102, 'Paseo de Aguas',       -12.0730, -76.9200, 'Paseo de Aguas, La Molina'),
(103, 'Castilla',             -12.0725, -76.9160, 'Castilla, La Molina'),
(104, 'Chan Chan',            -12.0720, -76.9120, 'Chan Chan, La Molina'),
(105, 'Corregidor',           -12.0715, -76.9080, 'Corregidor, La Molina'),
(106, 'Río Amarillo',         -12.0710, -76.9040, 'Río Amarillo, La Molina'),
(107, 'Santa María',          -12.0705, -76.9000, 'Santa María, La Molina'),
(108, 'Medicina',             -12.0738, -76.9220, 'Medicina, La Molina'),
(109, 'Los Bambúes',          -12.0748, -76.9340, 'Los Bambúes, La Molina'),
(110, 'CIAM',                 -12.0758, -76.9420, 'CIAM, La Molina');

-- =============================================
-- SEED: RUTAS
-- Fuente: corredorrojo.pe
-- Tarifa general S/2.43 | Estudiante S/1.21
-- Horario: Lun-Sáb 5:00am-11:00pm | Dom 5:00am-10:30pm
-- =============================================

INSERT INTO routes (id, numero, direccion, paradero_inicial_id, paradero_final_id, cantidad_paraderos, tiempo_estimado_min) VALUES
(1, 201, 'ida',    1,  64, 45, 75),   -- Calle 66 (Callao) → Ceres (Ate)
(2, 201, 'vuelta', 64, 3,  44, 75),   -- Ceres → Óvalo la Perla
(3, 204, 'ida',    77, 16, 46, 90),   -- San Juan Bautista (Pachacámac) → Contisuyo (San Miguel)
(4, 204, 'vuelta', 9,  77, 46, 90),   -- Honda (San Miguel) → San Juan Bautista
(5, 206, 'ida',    17, 106,34, 60),   -- San Marcos → Río Amarillo (La Molina)
(6, 206, 'vuelta', 107,17, 32, 60),   -- Santa María → San Marcos
(7, 209, 'ida',    17, 76, 45, 80),   -- San Marcos → Tagore (Ate)
(8, 209, 'vuelta', 76, 17, 42, 80);   -- Tagore → San Marcos

-- =============================================
-- SEED: ROUTE_STOPS (paraderos por ruta con orden)
-- Fuente: paraderos_corredor_rojo.csv
-- =============================================

-- Ruta 201 IDA: Calle 66 → Ceres (45 paraderos)
INSERT INTO route_stops (route_id, stop_id, orden) VALUES
(1, 1,  1),  -- Calle 66
(1, 2,  2),  -- Venezuela
(1, 3,  3),  -- Óvalo la Perla
(1, 4,  4),  -- Bomberos
(1, 5,  5),  -- Haya de la Torre
(1, 6,  6),  -- Base Naval
(1, 7,  7),  -- Los Insurgentes
(1, 8,  8),  -- Canamelares
(1, 9,  9),  -- Honda
(1, 10, 10), -- Rafael Escardó
(1, 11, 11), -- Parque de las Leyendas
(1, 12, 12), -- Universitaria
(1, 21, 13), -- Bartolomé Herrera
(1, 22, 14), -- Sucre
(1, 23, 15), -- Hospital Militar
(1, 24, 16), -- Gregorio Escobedo
(1, 25, 17), -- Salaverry
(1, 26, 18), -- Javier Prado
(1, 27, 19), -- Las Flores
(1, 28, 20), -- Los Cedros
(1, 29, 21), -- Las Palmeras
(1, 30, 22), -- Basadre
(1, 31, 23), -- Parodi
(1, 32, 24), -- Orquídeas
(1, 33, 25), -- Masías
(1, 34, 26), -- Nicolás Arriola
(1, 35, 27), -- Guardia Civil
(1, 36, 28), -- Aviación
(1, 37, 29), -- San Luis
(1, 38, 30), -- Rosa Toro
(1, 39, 31), -- Circunvalación
(1, 40, 32), -- Jockey
(1, 41, 33), -- U. de Lima
(1, 42, 34), -- Camacho
(1, 43, 35), -- Los Frutales
(1, 44, 36), -- La Molina
(1, 55, 37), -- Ingenieros
(1, 56, 38), -- Flora Tristán
(1, 57, 39), -- Óvalo Huarochirí
(1, 59, 40), -- Monumental
(1, 60, 41), -- París
(1, 61, 42), -- Vista Alegre
(1, 62, 43), -- Holanda
(1, 63, 44), -- Berlín
(1, 64, 45); -- Ceres

-- Ruta 201 VUELTA: Ceres → Óvalo la Perla (44 paraderos)
INSERT INTO route_stops (route_id, stop_id, orden) VALUES
(2, 64, 1),  -- Ceres
(2, 63, 2),  -- Berlín
(2, 62, 3),  -- Holanda
(2, 61, 4),  -- Vista Alegre
(2, 60, 5),  -- París
(2, 59, 6),  -- Monumental
(2, 57, 7),  -- Óvalo Huarochirí
(2, 56, 8),  -- Flora Tristán
(2, 55, 9),  -- Ingenieros
(2, 44, 10), -- La Molina
(2, 42, 11), -- Camacho
(2, 53, 12), -- Clínica San Felipe
(2, 51, 13), -- La Floresta
(2, 52, 14), -- Evitamiento
(2, 39, 15), -- Circunvalación
(2, 50, 16), -- J. Borja
(2, 38, 17), -- Rosa Toro
(2, 37, 18), -- San Luis
(2, 36, 19), -- Aviación
(2, 35, 20), -- Guardia Civil
(2, 49, 21), -- Quiñones
(2, 33, 22), -- Masías
(2, 32, 23), -- Orquídeas
(2, 48, 24), -- Petit Thouars
(2, 47, 25), -- Arenales
(2, 29, 26), -- Las Palmeras
(2, 46, 27), -- Los Nogales
(2, 45, 28), -- Pershing
(2, 25, 29), -- Salaverry
(2, 24, 30), -- Gregorio Escobedo
(2, 23, 31), -- Hospital Militar
(2, 22, 32), -- Sucre
(2, 21, 33), -- Bartolomé Herrera
(2, 12, 34), -- Universitaria
(2, 11, 35), -- Parque de las Leyendas
(2, 10, 36), -- Rafael Escardó
(2, 13, 37), -- Faucett
(2, 14, 38), -- José Marti
(2, 7,  39), -- Los Insurgentes
(2, 5,  40), -- Haya de la Torre
(2, 15, 41), -- Lopez Albujar
(2, 4,  42), -- Bomberos
(2, 3,  43), -- Óvalo la Perla
(2, 2,  44); -- Venezuela

-- Ruta 204 IDA: San Juan Bautista → Contisuyo (46 paraderos)
INSERT INTO route_stops (route_id, stop_id, orden) VALUES
(3, 77, 1),  -- San Juan Bautista
(3, 78, 2),  -- Paradero 1
(3, 79, 3),  -- Víctor Malásquez
(3, 80, 4),  -- Las Dunas
(3, 81, 5),  -- Sauces
(3, 82, 6),  -- Madreselvas
(3, 83, 7),  -- Naplo
(3, 84, 8),  -- La Punta
(3, 85, 9),  -- Mónaco
(3, 86, 10), -- El Sol
(3, 87, 11), -- Rinconada del Lago
(3, 88, 12), -- Laguna Grande
(3, 89, 13), -- A. Quesada
(3, 90, 14), -- Molicentro
(3, 91, 15), -- Centenario
(3, 58, 16), -- Huarochirí
(3, 56, 17), -- Flora Tristán
(3, 55, 18), -- Ingenieros
(3, 44, 19), -- La Molina
(3, 42, 20), -- Camacho
(3, 53, 21), -- Clínica San Felipe
(3, 51, 22), -- La Floresta
(3, 52, 23), -- Evitamiento
(3, 39, 24), -- Circunvalación
(3, 50, 25), -- J. Borja
(3, 38, 26), -- Rosa Toro
(3, 37, 27), -- San Luis
(3, 36, 28), -- Aviación
(3, 35, 29), -- Guardia Civil
(3, 49, 30), -- Quiñones
(3, 33, 31), -- Masías
(3, 32, 32), -- Orquídeas
(3, 48, 33), -- Petit Thouars
(3, 47, 34), -- Arenales
(3, 29, 35), -- Las Palmeras
(3, 46, 36), -- Los Nogales
(3, 45, 37), -- Pershing
(3, 25, 38), -- Salaverry
(3, 24, 39), -- Gregorio Escobedo
(3, 23, 40), -- Hospital Militar
(3, 22, 41), -- Sucre
(3, 21, 42), -- Bartolomé Herrera
(3, 12, 43), -- Universitaria
(3, 11, 44), -- Parque de las Leyendas
(3, 10, 45), -- Rafael Escardó
(3, 16, 46); -- Contisuyo

-- Ruta 204 VUELTA: Honda → San Juan Bautista (46 paraderos)
INSERT INTO route_stops (route_id, stop_id, orden) VALUES
(4, 9,  1),  -- Honda
(4, 10, 2),  -- Rafael Escardó
(4, 11, 3),  -- Parque de las Leyendas
(4, 12, 4),  -- Universitaria
(4, 21, 5),  -- Bartolomé Herrera
(4, 22, 6),  -- Sucre
(4, 23, 7),  -- Hospital Militar
(4, 24, 8),  -- Gregorio Escobedo
(4, 25, 9),  -- Salaverry
(4, 26, 10), -- Javier Prado
(4, 27, 11), -- Las Flores
(4, 28, 12), -- Los Cedros
(4, 54, 13), -- Palmera (Los Sauces)
(4, 30, 14), -- Basadre
(4, 31, 15), -- Parodi
(4, 32, 16), -- Orquídeas
(4, 33, 17), -- Masías
(4, 34, 18), -- Nicolás Arriola
(4, 35, 19), -- Guardia Civil
(4, 36, 20), -- Aviación
(4, 37, 21), -- San Luis
(4, 38, 22), -- Rosa Toro
(4, 39, 23), -- Circunvalación
(4, 40, 24), -- Jockey
(4, 41, 25), -- U. de Lima
(4, 42, 26), -- Camacho
(4, 43, 27), -- Los Frutales
(4, 44, 28), -- La Molina
(4, 55, 29), -- Ingenieros
(4, 56, 30), -- Flora Tristán
(4, 95, 31), -- Asunción
(4, 93, 32), -- Aruba
(4, 90, 33), -- Molicentro
(4, 94, 34), -- Parque
(4, 88, 35), -- Laguna Grande
(4, 87, 36), -- Rinconada del Lago
(4, 86, 37), -- El Sol
(4, 92, 38), -- Miami
(4, 84, 39), -- La Punta
(4, 83, 40), -- Naplo
(4, 82, 41), -- Madreselvas
(4, 81, 42), -- Sauces
(4, 80, 43), -- Las Dunas
(4, 79, 44), -- Víctor Malásquez
(4, 78, 45), -- Paradero 1
(4, 77, 46); -- San Juan Bautista

-- Ruta 206 IDA: San Marcos → Río Amarillo (34 paraderos)
INSERT INTO route_stops (route_id, stop_id, orden) VALUES
(5, 17, 1),  -- San Marcos
(5, 18, 2),  -- Católica
(5, 19, 3),  -- La Mar
(5, 20, 4),  -- La Marina
(5, 21, 5),  -- Bartolomé Herrera
(5, 22, 6),  -- Sucre
(5, 23, 7),  -- Hospital Militar
(5, 24, 8),  -- Gregorio Escobedo
(5, 25, 9),  -- Salaverry
(5, 26, 10), -- Javier Prado
(5, 27, 11), -- Las Flores
(5, 28, 12), -- Los Cedros
(5, 29, 13), -- Las Palmeras
(5, 30, 14), -- Basadre
(5, 31, 15), -- Parodi
(5, 33, 16), -- Masías
(5, 34, 17), -- Nicolás Arriola
(5, 36, 18), -- Aviación
(5, 37, 19), -- San Luis
(5, 39, 20), -- Circunvalación
(5, 40, 21), -- Jockey
(5, 41, 22), -- U. de Lima
(5, 44, 23), -- La Molina
(5, 96, 24), -- Ministerio
(5, 97, 25), -- Escuela PNP
(5, 98, 26), -- Los Sauces
(5, 99, 27), -- Secoyas
(5, 100,28), -- Cordillera Blanca
(5, 101,29), -- Derecho
(5, 102,30), -- Paseo de Aguas
(5, 103,31), -- Castilla
(5, 104,32), -- Chan Chan
(5, 105,33), -- Corregidor
(5, 106,34); -- Río Amarillo

-- Ruta 206 VUELTA: Santa María → San Marcos (32 paraderos)
INSERT INTO route_stops (route_id, stop_id, orden) VALUES
(6, 107, 1), -- Santa María
(6, 104, 2), -- Chan Chan
(6, 103, 3), -- Castilla
(6, 102, 4), -- Paseo de Aguas
(6, 101, 5), -- Derecho
(6, 108, 6), -- Medicina
(6, 109, 7), -- Los Bambúes
(6, 98,  8), -- Los Sauces
(6, 110, 9), -- CIAM
(6, 96, 10), -- Ministerio
(6, 44, 11), -- La Molina
(6, 51, 12), -- La Floresta
(6, 52, 13), -- Evitamiento
(6, 39, 14), -- Circunvalación
(6, 37, 15), -- San Luis
(6, 36, 16), -- Aviación
(6, 49, 17), -- Quiñones
(6, 33, 18), -- Masías
(6, 48, 19), -- Petit Thouars
(6, 47, 20), -- Arenales
(6, 29, 21), -- Las Palmeras
(6, 46, 22), -- Los Nogales
(6, 45, 23), -- Pershing
(6, 25, 24), -- Salaverry
(6, 24, 25), -- Gregorio Escobedo
(6, 23, 26), -- Hospital Militar
(6, 22, 27), -- Sucre
(6, 21, 28), -- Bartolomé Herrera
(6, 12, 29), -- Universitaria
(6, 19, 30), -- La Mar
(6, 18, 31), -- Católica
(6, 17, 32); -- San Marcos

-- Ruta 209 IDA: San Marcos → Tagore (45 paraderos)
INSERT INTO route_stops (route_id, stop_id, orden) VALUES
(7, 17, 1),  -- San Marcos
(7, 18, 2),  -- Católica
(7, 19, 3),  -- La Mar
(7, 20, 4),  -- La Marina
(7, 21, 5),  -- Bartolomé Herrera
(7, 22, 6),  -- Sucre
(7, 23, 7),  -- Hospital Militar
(7, 24, 8),  -- Gregorio Escobedo
(7, 25, 9),  -- Salaverry
(7, 26, 10), -- Javier Prado
(7, 27, 11), -- Las Flores
(7, 28, 12), -- Los Cedros
(7, 29, 13), -- Las Palmeras
(7, 30, 14), -- Basadre
(7, 48, 15), -- Petit Thouars
(7, 31, 16), -- Parodi
(7, 32, 17), -- Orquídeas
(7, 33, 18), -- Masías
(7, 34, 19), -- Nicolás Arriola
(7, 35, 20), -- Guardia Civil
(7, 36, 21), -- Aviación
(7, 37, 22), -- San Luis
(7, 38, 23), -- Rosa Toro
(7, 39, 24), -- Circunvalación
(7, 40, 25), -- Jockey
(7, 41, 26), -- U. de Lima
(7, 42, 27), -- Camacho
(7, 43, 28), -- Los Frutales
(7, 44, 29), -- La Molina
(7, 65, 30), -- Metro de La Molina
(7, 66, 31), -- Constructores
(7, 67, 32), -- Industriales
(7, 55, 33), -- Ingenieros
(7, 56, 34), -- Flora Tristán
(7, 58, 35), -- Huarochirí
(7, 68, 36), -- Separadora Industrial
(7, 69, 37), -- Mayorazgo
(7, 70, 38), -- Backus
(7, 71, 39), -- Josfel
(7, 72, 40), -- Puruchuco
(7, 73, 41), -- Pista Nueva
(7, 74, 42), -- Soldadura
(7, 75, 43), -- Los Angeles
(7, 64, 44), -- Ceres
(7, 76, 45); -- Tagore

-- Ruta 209 VUELTA: Tagore → San Marcos (42 paraderos)
INSERT INTO route_stops (route_id, stop_id, orden) VALUES
(8, 76, 1),  -- Tagore
(8, 75, 2),  -- Los Angeles
(8, 74, 3),  -- Soldadura
(8, 73, 4),  -- Pista Nueva
(8, 71, 5),  -- Josfel
(8, 70, 6),  -- Backus
(8, 69, 7),  -- Mayorazgo
(8, 58, 8),  -- Huarochirí
(8, 66, 9),  -- Constructores
(8, 56, 10), -- Flora Tristán
(8, 55, 11), -- Ingenieros
(8, 67, 12), -- Industriales
(8, 44, 13), -- La Molina
(8, 26, 14), -- Javier Prado (Metro)
(8, 43, 15), -- Los Frutales
(8, 42, 16), -- Camacho
(8, 53, 17), -- Clínica San Felipe
(8, 41, 18), -- U. de Lima (Floresta)
(8, 52, 19), -- Evitamiento
(8, 39, 20), -- Circunvalación
(8, 50, 21), -- J. Borja
(8, 38, 22), -- Rosa Toro
(8, 37, 23), -- San Luis
(8, 36, 24), -- Aviación
(8, 35, 25), -- Guardia Civil
(8, 49, 26), -- Quiñones
(8, 33, 27), -- Masías
(8, 32, 28), -- Orquídeas
(8, 48, 29), -- Petit Thouars
(8, 47, 30), -- Arenales
(8, 29, 31), -- Las Palmeras
(8, 46, 32), -- Los Nogales
(8, 45, 33), -- Pershing
(8, 25, 34), -- Salaverry
(8, 24, 35), -- Gregorio Escobedo
(8, 23, 36), -- Hospital Militar
(8, 22, 37), -- Sucre
(8, 21, 38), -- Bartolomé Herrera
(8, 12, 39), -- Universitaria
(8, 19, 40), -- La Mar
(8, 18, 41), -- Católica
(8, 17, 42); -- San Marcos

-- =============================================
-- SEED: BUSES (con aforo simulado)
-- =============================================

INSERT INTO buses (id, route_id, aforo_porcentaje, estado) VALUES
(1, 1, 72, 'activo'),
(2, 1, 45, 'activo'),
(3, 2, 88, 'activo'),
(4, 3, 35, 'activo'),
(5, 4, 60, 'activo'),
(6, 5, 50, 'activo'),
(7, 6, 92, 'activo'),
(8, 7, 67, 'activo'),
(9, 7, 40, 'activo'),
(10, 8, 55, 'activo'),
(11, 3, 15, 'mantenimiento'),
(12, 5, 78, 'activo');

-- =============================================
-- SEED: PLANES DE SUSCRIPCIÓN
-- =============================================

INSERT INTO subscription_plans (id, nombre, precio, descripcion, duracion_dias) VALUES
(1, 'Básico',   0.00,  'Acceso a información de rutas y paraderos. Consulta de aforo general. Mapa interactivo básico.', 30),
(2, 'Premium',  9.90,  'Todo lo del plan Básico más: alertas de aforo en tiempo real, paraderos favoritos, historial de viajes, soporte prioritario.', 30),
(3, 'VIP',      19.90, 'Todo lo del plan Premium más: predicción de tiempos de espera, rutas personalizadas, sin publicidad, acceso anticipado a nuevas funciones.', 30);

-- =============================================
-- SEED: USUARIO DE PRUEBA
-- password: Demo1234 (hash bcrypt 12 rounds)
-- =============================================

INSERT INTO users (nombre, email, password_hash, rol) VALUES
('Usuario Demo', 'demo@ulima.edu.pe', '$2b$12$EFELhfTP9I0XoTQ4ruExneNMVMpEF3XkWhGMvk2iNQZ28jekwGltu', 'estudiante');
