const app = {
    // 1. Gestion de la navigation
    login: function() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('active');
        
        document.getElementById('admin-interface').classList.remove('hidden');
        document.getElementById('admin-interface').classList.add('active');
        
        // On affiche le dashboard par défaut
        this.showPage('dashboard');
    },

    showPage: function(pageId) {
        // Cacher toutes les pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('hidden');
            page.classList.remove('active');
        });

        // Afficher la page demandée
        const selectedPage = document.getElementById('page-' + pageId);
        if(selectedPage) {
            selectedPage.classList.remove('hidden');
            selectedPage.classList.add('active');
        }
    },

    // 2. Gestion de la Carte (Ajout de points)
    addPoint: function(event) {
        // On empêche d'ajouter un point si on clique sur un point existant
        if(event.target.closest('.map-point')) return;

        const mapContainer = document.getElementById('mapContainer');
        const rect = mapContainer.getBoundingClientRect();

        // Calcul de la position en % (C'est ce qui ira dans ta BDD : pos_x, pos_y)
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        console.log(`Ajout point en X: ${x.toFixed(2)}%, Y: ${y.toFixed(2)}%`);

        // Création visuelle du point
        const point = document.createElement('div');
        point.className = 'map-point';
        point.style.left = x + '%';
        point.style.top = y + '%';
        point.innerHTML = '<i class="fa fa-star" style="color: #c0392b;"></i>'; // Rouge par défaut
        
        // Ajout de l'événement clic pour ouvrir la config du point
        point.onclick = function(e) {
            e.stopPropagation(); // Empêche de créer un autre point par dessus
            app.openModal();
        };

        mapContainer.appendChild(point);

        // Optionnel : Ouvrir directement la modale après avoir posé le point
        this.openModal();
    },

    // 3. Gestion de la Modale
    openModal: function() {
        document.getElementById('modal-measure').classList.remove('hidden');
    },

    closeModal: function() {
        document.getElementById('modal-measure').classList.add('hidden');
    },

    saveMeasure: function() {
        alert("Mesure enregistrée (Simulation) ! C'est ici que tu ferais ta requête vers la BDD.");
        this.closeModal();
    }
};