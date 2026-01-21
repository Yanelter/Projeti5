const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration de la Base de Données
const dbConfig = {
    host: 'db', // Nom du service dans docker-compose
    user: 'user',
    password: 'password',
    database: 'healthcheck_db'
};

let connection;

function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);

    connection.connect(err => {
        if (err) {
            console.error('Erreur de connexion BDD, nouvelle tentative dans 2 secondes...', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('Connecté à la Base de Données !');
        }
    });

    connection.on('error', err => {
        console.error('Erreur BDD', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

// --- ROUTES ---

// 1. Route de test (Accueil)
app.get('/', (req, res) => {
    res.send('API HealthCheck360 fonctionnelle !');
});

// 2. LOGIN : Vérifier email et mot de passe
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // CORRECTION 1 : On cherche 'password' et non 'password_hash'
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    
    connection.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error(err); // Ajout pour voir l'erreur dans le terminal
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length > 0) {
            const user = results[0];
            res.json({ 
                success: true, 
                // CORRECTION 2 : On récupère 'firstname' (sans underscore) comme tu l'as créé
                user: { 
                    id: user.id, 
                    name: user.firstname || user.first_name, // Sécurité : on tente les deux
                    role: user.role 
                } 
            });
        } else {
            res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
        }
    });
});

// 3. GESTION UTILISATEURS (Liste)
app.get('/api/users', (req, res) => {
    // CORRECTION : On demande 'firstname' et 'lastname' (sans underscore)
    connection.query("SELECT id, firstname, lastname, email, role FROM users", (err, results) => {
        if (err) {
            console.error("Erreur lecture users:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// 4. CRÉER UTILISATEUR (CORRIGÉ)
app.post('/api/users', (req, res) => {
    // Le frontend envoie ces noms de variables (avec underscores)
    const { first_name, last_name, email, password, role } = req.body;
    
    // CORRECTION : On insère dans les colonnes EXACTES de TA base de données
    // (firstname, lastname, password => sans underscores ni suffixe _hash)
    const sql = "INSERT INTO users (firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, ?)";
    
    connection.query(sql, [first_name, last_name, email, password, role], (err, result) => {
        if (err) {
            console.error("Erreur création user:", err); // Affiche l'erreur dans le terminal
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: result.insertId });
    });
});

// 5. CHANGER RÔLE
app.put('/api/users/:id/role', (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;
    const sql = "UPDATE users SET role = ? WHERE id = ?";
    connection.query(sql, [role, userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Lancement du serveur
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur Backend démarré sur le port ${PORT}`);
});