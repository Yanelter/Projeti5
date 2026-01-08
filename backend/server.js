const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors()); // Autorise le frontend à parler au backend
app.use(bodyParser.json());

// Configuration de la connexion BDD
const dbConfig = {
    host: process.env.DB_HOST || 'db', // 'db' est le nom du service dans docker-compose
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'healthcheck_db'
};

let connection;

// Fonction pour se connecter avec reconnexion automatique (car la BDD met du temps à démarrer)
function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);

    connection.connect(function(err) {
        if(err) {
            console.log('Erreur de connexion BDD, nouvelle tentative dans 2 secondes...', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('Connecté à la Base de Données !');
        }
    });

    connection.on('error', function(err) {
        console.log('Erreur BDD', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();

// --- ROUTES (C'est ici que ton site va appeler) ---

// 1. Route de test
app.get('/', (req, res) => {
    res.send('API HealthCheck360 fonctionnelle !');
});

// 2. Sauvegarder une mesure (Pour ton bouton "Créer")
app.post('/api/measures', (req, res) => {
    const data = req.body;
    // data contient : { name, type, min, max, frequency... }
    
    // Exemple simplifié d'insertion (à adapter selon tes besoins exacts)
    // Ici on simule, car il faudrait gérer les ID des check_points, etc.
    console.log("Reçu nouvelle mesure :", data);
    
    // Requête SQL réelle (Exemple)
    const sql = "INSERT INTO measure_definitions (question_text, input_type) VALUES (?, ?)";
    connection.query(sql, [data.name, data.type], (err, result) => {
        if (err) {
            res.status(500).send("Erreur lors de l'enregistrement");
        } else {
            res.status(200).send({ message: "Mesure créée !", id: result.insertId });
        }
    });
});

// Lancer le serveur
app.listen(3000, () => {
    console.log('Serveur Backend démarré sur le port 3000');
});