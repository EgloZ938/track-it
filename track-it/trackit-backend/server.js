const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const { format } = require('date-fns');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB en utilisant le fichier .env
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Schéma User
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Schéma Signalement
const ticketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Proprete', 'Equipement', 'Surcharge', 'Retard', 'Securite', 'Autre'],
    },
    transportLine: { // <-- Ce champ doit être un objet
    id_line: { type: String, required: true },
    shortname_line: { type: String }, // Peut-être optionnel
    name_line: { type: String, required: true },
    transportmode: { type: String, required: true },
    operatorname: { type: String },
    colourweb_hexa: { type: String }, 
    textcolourweb_hexa: { type: String }, 
    },
    description: {type: String, required: true},
    location: {
        latitude: {
        type: Number,
        required: true 
    },
    longitude: {
        type: Number,
        required: true 
    },
        
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    
});

// Nouveau Schéma pour les Tickets de Retard
const delayTicketSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transportLine: {
        id_line: { type: String, required: true },
        shortname_line: { type: String },
        name_line: { type: String, required: true },
        transportmode: { type: String, required: true },
        operatorname: { type: String },
        colourweb_hexa: { type: String },
        textcolourweb_hexa: { type: String },
    },
    stopPoint: {
        id_stop_point: { type: String, required: true },
        name_stop_point: { type: String, required: true },
        coord_x: { type: Number, required: true },
        coord_y: { type: Number, required: true },
    },
    description: {
        type: String,
        required: true,
    },
    location: { // Lieu où l'utilisateur a déclaré le retard
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    distanceFromStop: { // La distance calculée depuis l'arrêt (pour information)
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});


const DelayTicket = mongoose.model('DelayTicket', delayTicketSchema);
const User = mongoose.model('User', userSchema);
const Ticket = mongoose.model('Ticket', ticketSchema);

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token d\'accès requis' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide' });
        }
        req.user = user;
        next();
    });
};



// const NAVITIA_BASE_URL = "https://prim.iledefrance-mobilites.fr/marketplace/v2/navitia";
const NAVITIA_DISRUPTIONS_BULK_URL = "https://prim.iledefrance-mobilites.fr/marketplace/disruptions_bulk"; 


// async function fetchNavitiaLineReports(params = {}) {
//     // L'endpoint pour les line_reports est directement sous la base_url pour la marketplace IDFM
//     const queryParams = new URLSearchParams(params).toString(); 
//     const url = `${NAVITIA_BASE_URL}/line_reports/line_reports${queryParams ? `?${queryParams}` : ''}`; // <-- URL CORRECTE AVEC VOTRE BASE_URL

//     const navitiaApiKey = process.env.NAVITIA_API_KEY;

//     if (!navitiaApiKey) {
//         console.error("Erreur: NAVITIA_API_KEY n'est pas défini dans les variables d'environnement.");
//         throw new Error("Clé API Navitia manquante.");
//     }

//     try {
//         console.log(`Appel à Navitia URL (Line Reports) avec votre base URL: ${url}`); 
//         const response = await axios.get(url, {
//             headers: {
//                 // Pour la marketplace IDFM, le header est généralement "apikey"
//                 "apikey": navitiaApiKey, // <-- Utilisez "apikey" comme vous le faisiez
//                 "Accept": "application/json"
//             }
//         });
//         console.log(`Réponse Navitia Line Reports reçue (nombre): ${response.data.line_reports?.length || 0}`);
//         return response.data; 
//     } catch (error) {
//         if (axios.isAxiosError(error)) {
//             console.error(`Erreur Navitia Line Reports : ${error.response?.status || 'N/A'} - ${error.response?.data?.message || error.message}`);
//             if (error.response?.data) {
//                 console.error("Détails de la réponse d'erreur Navitia (Line Reports):", error.response.data);
//             }
//             throw new Error(error.response?.data?.message || `Erreur lors de la connexion à l'API Navitia Line Reports (${error.response?.status || 'Inconnu'})`);
//         } else {
//             console.error("Erreur inattendue lors de l'appel Navitia Line Reports :", error);
//             throw new Error("Erreur inattendue lors de la récupération des données Navitia Line Reports");
//         }
//     }
// }

// // MODIFICATION DE VOTRE ROUTE EXISTANTE
// // app.get('/api/navitia/disruptions', ... )
// // Nous allons garder le même nom de route pour ne pas avoir à modifier le frontend
// app.get('/api/navitia/line_reports/line_reports', async (req, res) => { 
//     try {
//         // fromDateTime et untilDateTime ne sont plus pertinents pour l'API line_reports,
//         // donc nous les ignorons si elles sont présentes dans la requête.
//         const { count } = req.query; 

//         const navitiaParams = {};
//         if (count) {
//             navitiaParams.count = parseInt(count, 10);
//         } else {
//             navitiaParams.count = 200; // Valeur par défaut pour récupérer un bon nombre de rapports
//         }

//         // Appeler la nouvelle fonction fetchNavitiaLineReports
//         const data = await fetchNavitiaLineReports(navitiaParams);
        
//         // La structure de 'data' sera { 'line_reports': [...] }
//         // Le frontend devra s'attendre à cette structure.
//         res.json(data); 
//     } catch (error) {
//         console.error("Erreur dans la route /api/navitia/disruptions:", error);
//         res.status(500).json({ message: error.message || "Erreur interne du serveur" });
//     }
// });



async function fetchRealTimeTrafficMessages() { // Renommez la fonction pour plus de clarté
    const navitiaApiKey = process.env.NAVITIA_API_KEY;

    if (!navitiaApiKey) {
        console.error("[BACKEND] Erreur: NAVITIA_API_KEY n'est pas défini dans les variables d'environnement.");
        throw new Error("Clé API Navitia manquante.");
    }

    // --- Construction de l'URL pour l'endpoint /disruptions/v2 ---
    // L'URL complète sera : https://prim.iledefrance-mobilites.fr/marketplace/disruptions_bulk/disruptions/v2
    const url = `${NAVITIA_DISRUPTIONS_BULK_URL}/disruptions/v2`; 
    
    try {
        console.log(`[BACKEND] Appel à Navitia URL (Messages Trafic - Disruptions Bulk V2) : ${url}`); 
        const response = await axios.get(url, {
            headers: {
                "apikey": navitiaApiKey, 
                "Accept": "application/json"
            }
        });
        
        // La réponse de cette API contient une propriété 'disruptions'
        console.log(`[BACKEND] Réponse Navitia Messages Trafic reçue (nombre de disruptions): ${response.data.disruptions?.length || 0}`);
        
        return response.data; // Retourne l'objet complet { disruptions: [...] }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`[BACKEND] Erreur Navitia Messages Trafic (Disruptions Bulk V2) - Statut: ${error.response?.status || 'N/A'}`);
            console.error(`[BACKEND] Message d'erreur: ${error.response?.data?.message || error.message}`);
            if (error.response?.data) {
                console.error("[BACKEND] Détails de la réponse d'erreur Navitia :", JSON.stringify(error.response.data, null, 2));
            }
            throw new Error(error.response?.data?.message || `Erreur lors de la connexion à l'API Navitia Messages Trafic (${error.response?.status || 'Inconnu'})`);
        } else {
            console.error("[BACKEND] Erreur inattendue lors de l'appel Navitia Messages Trafic :", error);
            throw new Error("Erreur inattendue lors de la récupération des données Navitia Messages Trafic");
        }
    }
}


app.get('/api/navitia/traffic-messages', async (req, res) => {
    try {
        const navitiaResponse = await fetchRealTimeTrafficMessages(); 
        
        // --- C'EST CETTE PARTIE QUI EST NOUVELLE ET QUI DOIT ÊTRE TESTÉE ---
        if (navitiaResponse && navitiaResponse.disruptions) {
            console.log("[BACKEND] Données de disruptions envoyées au frontend (nombre):", navitiaResponse.disruptions.length);
            // Envoyez l'objet complet qui contient le tableau 'disruptions'
            res.json(navitiaResponse); 
        } else {
            // Si disruptions n'est pas présent ou si la réponse Navitia est vide
            console.warn("[BACKEND] La réponse Navitia ne contient pas de disruptions ou est vide.");
            res.status(200).json({ disruptions: [] }); // Renvoyer un tableau vide mais format correct
        }

        // Gardez ces logs pour confirmation finale
        console.log("[BACKEND] Type des données envoyées au frontend:", typeof navitiaResponse); 
        console.log("[BACKEND] Contenu envoyé au frontend (JSON.stringify):", JSON.stringify(navitiaResponse, null, 2));

    } catch (error) {
        console.error("[BACKEND] Erreur dans la route /api/navitia/traffic-messages:", error.message);
        res.status(500).json({ message: error.message || "Erreur interne du serveur lors de la récupération des messages de trafic." });
    }
});


// Routes d'authentification

// Inscription
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hasher le mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Créer le nouvel utilisateur
        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });

        await user.save();

        // Créer le token JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Créer le token JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Profil utilisateur
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Routes pour les signalements

// Créer un signalement
app.post('/api/tickets', authenticateToken, async (req, res) => {
    try {
        const { type, transportLine, description, location } = req.body;

        const ticket = new Ticket({
            userId: req.user.userId,
            type,
            transportLine,
            description,
            location,
        });

        await ticket.save();

        res.status(201).json({
            message: 'Signalement créé avec succès',
            ticket,
        });
    } catch (error) {
        console.error('Erreur lors de la création du signalement:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer les signalements de l'utilisateur
app.get('/api/tickets', authenticateToken, async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        console.error('Erreur lors de la récupération des signalements:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer tous les signalements (pour la carte)
app.get('/api/tickets/all', authenticateToken, async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('userId', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        console.error('Erreur lors de la récupération de tous les signalements:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});


// Mettre à jour le statut d'un signalement (pour les administrateurs)
app.patch('/api/tickets/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        const ticket = await Ticket.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({ message: 'Signalement non trouvé' });
        }

        res.json({
            message: 'Statut mis à jour avec succès',
            ticket,
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/tickets/stats', authenticateToken, async (req, res) => {
   try {
        const userId = req.user.userId; 

      
        const totalSent = await Ticket.countDocuments({ userId: userId });

      
        const totalResolved = await Ticket.countDocuments({
            userId: userId,
            status: 'resolved' 
        });

       
        res.status(200).json({
            totalSent: totalSent,
            totalResolved: totalResolved,
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques de signalements:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des statistiques.' });
    }

});

app.get('/api/tickets/:id', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('transportLine'); 
        if (!ticket) {
            return res.status(404).json({ message: 'Signalement non trouvé' });
        }
        res.status(200).json(ticket); 
    } catch (error) {
        console.error("Erreur lors de la récupération du signalement :", error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
});


// --- Routes pour les Tickets de Retard ---

// Créer un nouveau ticket de retard
app.post('/api/delaytickets', authenticateToken, async (req, res) => {
    try {
        const { transportLine, stopPoint, description, location, distanceFromStop } = req.body;

        // Validation simple des données reçues
        if (!transportLine || !stopPoint || !description || !location || distanceFromStop === undefined) {
            return res.status(400).json({ message: 'Tous les champs du ticket de retard sont requis.' });
        }

        const delayTicket = new DelayTicket({
            userId: req.user.userId,
            transportLine,
            stopPoint,
            description,
            location,
            distanceFromStop,
        });

        await delayTicket.save();

        res.status(201).json({
            message: 'Ticket de retard créé avec succès',
            delayTicket,
        });
    } catch (error) {
        console.error('Erreur lors de la création du ticket de retard:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la création du ticket de retard.' });
    }
});

// Récupérer tous les tickets de retard de l'utilisateur authentifié
app.get('/api/delaytickets', authenticateToken, async (req, res) => {
    try {
        const delayTickets = await DelayTicket.find({ userId: req.user.userId })
            .sort({ createdAt: -1 }); // Tri par le plus récent

        res.json(delayTickets);
    } catch (error) {
        console.error('Erreur lors de la récupération des tickets de retard de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des tickets de retard.' });
    }
});

// Récupérer un ticket de retard spécifique par son ID
app.get('/api/delaytickets/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const delayTicket = await DelayTicket.findById(id);

        if (!delayTicket) {
            return res.status(404).json({ message: 'Ticket de retard non trouvé' });
        }

        // Optionnel : Vérifier que l'utilisateur est le propriétaire du ticket si vous voulez restreindre l'accès
        if (delayTicket.userId.toString() !== req.user.userId) {
             return res.status(403).json({ message: 'Accès non autorisé à ce ticket de retard' });
        }

        res.status(200).json(delayTicket);
    } catch (error) {
        console.error('Erreur lors de la récupération du ticket de retard:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération du ticket de retard.' });
    }
});



// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📱 Track'IT Backend API prêt !`);
    console.log(`🔗 MongoDB connecté à: ${process.env.MONGODB_URI ? 'Atlas Cloud' : 'Local'}`);
    console.log(`Navitia API Endpoint: http://localhost:${PORT}/api/navitia/disruptions`); 
    console.log(`Tous les signalements (authentifiés): http://localhost:${PORT}/api/tickets/all`); 
});

// Gestion des erreurs MongoDB
mongoose.connection.on('connected', () => {
    console.log('✅ Connecté à MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Erreur MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Déconnecté de MongoDB');
});