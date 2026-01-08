# On part d'une version légère de Node
FROM node:18-alpine

# On crée un dossier de travail
WORKDIR /app

# On copie le fichier des dépendances
COPY package.json .

# On installe les dépendances
RUN npm install

# On copie tout le reste du code
COPY . .

# On ouvre le port 3000
EXPOSE 3000

# On lance le serveur
CMD ["node", "server.js"]