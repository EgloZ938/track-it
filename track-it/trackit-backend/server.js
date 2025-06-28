const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

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



const NAVITIA_BASE_URL = "https://prim.iledefrance-mobilites.fr/marketplace/v2/navitia";

// Fonction pour récupérer les perturbations Navitia
async function fetchNavitiaDisruptions() {
    const url = `${NAVITIA_BASE_URL}/disruptions`;
    const navitiaApiKey = process.env.NAVITIA_API_KEY;

    if (!navitiaApiKey) {
        console.error("Erreur: NAVITIA_API_KEY n'est pas défini dans les variables d'environnement.");
        throw new Error("Clé API Navitia manquante.");
    }

    try {
        const response = await axios.get(url, {
            headers: {
                "apikey": navitiaApiKey,
                "Accept": "application/json"
            }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Erreur Navitia : ${error.response?.status || 'N/A'} - ${error.response?.data?.message || error.message}`);
            throw new Error(error.response?.data?.message || "Erreur lors de la connexion à l'API Navitia");
        } else {
            console.error("Erreur inattendue lors de l'appel Navitia :", error);
            throw new Error("Erreur inattendue lors de la récupération des données Navitia");
        }
    }
}

// Nouvelle route publique pour les perturbations Navitia
app.get('/api/navitia/disruptions', async (req, res) => {
    try {
        const data = await fetchNavitiaDisruptions();
        res.json(data);
    } catch (error) {
        // Gérer les erreurs de la fonction fetchNavitiaDisruptions
        res.status(500).json({ message: error.message });
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