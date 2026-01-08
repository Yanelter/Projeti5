-- ============================================================
-- 1. CRÉATION DES TABLES (STRUCTURE)
-- ============================================================

-- Table des UTILISATEURS
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Dans un vrai projet, le MDP doit être crypté
    role ENUM('ADMIN', 'OPERATOR') NOT NULL DEFAULT 'OPERATOR',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des TYPES DE RONDES (Les boutons Checklists)
CREATE TABLE IF NOT EXISTS round_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,      -- Ex: "Hebdomadaire"
    code VARCHAR(20) NOT NULL UNIQUE, -- Ex: "WEEKLY"
    description VARCHAR(255)
);

-- Table de LA LÉGENDE (Types d'équipements)
CREATE TABLE IF NOT EXISTS equipment_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,      -- Ex: "Extincteur"
    icon_class VARCHAR(50),          -- Ex: "fa-fire-extinguisher" (FontAwesome)
    default_color VARCHAR(20)        -- Ex: "#e74c3c"
);

-- Table des ZONES (Les Plans / Images)
CREATE TABLE IF NOT EXISTS zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL, -- Chemin de l'image
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des POINTS DE CONTRÔLE (Les icônes placées sur le plan)
CREATE TABLE IF NOT EXISTS check_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT NOT NULL,
    equipment_type_id INT NOT NULL,
    label VARCHAR(100),              -- Nom du point (ex: "Extincteur Couloir")
    pos_x FLOAT NOT NULL,            -- Position en % (Horizontal)
    pos_y FLOAT NOT NULL,            -- Position en % (Vertical)
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id)
);

-- Table des DÉFINITIONS DE MESURES (Les Questions configurées)
CREATE TABLE IF NOT EXISTS measure_definitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    check_point_id INT NOT NULL,
    round_type_id INT NOT NULL,      -- Pour quelle ronde cette question apparait ?
    question_text VARCHAR(255) NOT NULL,
    input_type ENUM('BOOL', 'NUMERIC', 'TEXT') NOT NULL,
    unit VARCHAR(20),                -- Ex: "°C", "Bar"
    min_val FLOAT,                   -- Seuil Min
    max_val FLOAT,                   -- Seuil Max
    FOREIGN KEY (check_point_id) REFERENCES check_points(id) ON DELETE CASCADE,
    FOREIGN KEY (round_type_id) REFERENCES round_types(id)
);

-- Table des INSPECTIONS (Les sessions de rondes lancées)
CREATE TABLE IF NOT EXISTS inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    zone_id INT NOT NULL,
    round_type_id INT NOT NULL,
    status ENUM('IN_PROGRESS', 'COMPLETED') DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (round_type_id) REFERENCES round_types(id)
);

-- Table des RÉSULTATS (Les réponses des opérateurs)
CREATE TABLE IF NOT EXISTS inspection_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inspection_id INT NOT NULL,
    measure_def_id INT NOT NULL,
    value_bool BOOLEAN,              -- Réponse Oui/Non
    value_num FLOAT,                 -- Réponse Chiffre
    value_text TEXT,                 -- Réponse Texte
    is_compliant BOOLEAN,            -- Calculé (OK/NOK)
    comment TEXT,                    -- Commentaire opérateur
    photo_url VARCHAR(255),          -- Photo prise
    priority ENUM('LOW', 'MEDIUM', 'HIGH'), -- Priorité si problème
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE,
    FOREIGN KEY (measure_def_id) REFERENCES measure_definitions(id)
);


-- ============================================================
-- 2. INSERTION DE DONNÉES DE TEST (SEED)
-- ============================================================


-- Création de TON compte Admin unique
INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES 
('admin@healthcheck.com', '1234', 'ADMIN', 'Super', 'Admin');
-- Création des types de rondes
INSERT INTO round_types (name, code, description) VALUES 
('Journalière', 'DAILY', 'Vérifications rapides du matin'),
('Hebdomadaire', 'WEEKLY', 'Vérifications techniques standard'),
('Mensuelle', 'MONTHLY', 'Audit complet et maintenance'),
('Sécurité Incendie', 'FIRE', 'Vérification extincteurs et issues');

-- Création de la légende (Icônes)
INSERT INTO equipment_types (name, icon_class, default_color) VALUES 
('Extincteur', 'fa-fire-extinguisher', '#e74c3c'), -- Rouge
('Éclairage', 'fa-lightbulb', '#f1c40f'),         -- Jaune
('Porte / Issue', 'fa-door-open', '#2ecc71'),      -- Vert
('Climatisation', 'fa-fan', '#3498db');            -- Bleu

-- Création d'une zone (Plan)
INSERT INTO zones (name, image_url) VALUES 
('Entrepôt A - Rez-de-chaussée', 'https://placehold.co/800x600/EEE/31343C?text=Plan+Entrepôt');

-- Création de points sur la carte (CHECK POINTS)
-- Point 1 : Extincteur (à 20% gauche, 40% haut)
INSERT INTO check_points (zone_id, equipment_type_id, label, pos_x, pos_y) VALUES 
(1, 1, 'Extincteur Entrée', 20.0, 40.0);

-- Point 2 : Lampe (à 60% gauche, 20% haut)
INSERT INTO check_points (zone_id, equipment_type_id, label, pos_x, pos_y) VALUES 
(1, 2, 'Néon Allée Centrale', 60.0, 20.0);

-- Création des questions (MEASURE DEFINITIONS)
-- Pour l'Extincteur (Point 1) -> Ronde Mensuelle (ID 3)
INSERT INTO measure_definitions (check_point_id, round_type_id, question_text, input_type, unit, min_val, max_val) VALUES 
(1, 3, 'Pression du manomètre', 'NUMERIC', 'Bar', 10, 18),
(1, 3, 'Goupille présente ?', 'BOOL', NULL, NULL, NULL);

-- Pour la Lampe (Point 2) -> Ronde Hebdomadaire (ID 2)
INSERT INTO measure_definitions (check_point_id, round_type_id, question_text, input_type, unit) VALUES 
(2, 2, 'Ampoule fonctionnelle ?', 'BOOL', NULL);