// ==================== TYPES GÉNÉRAUX ET COMMUNS ====================

// Utilisé pour la localisation (MapScreen, EcranSignalement, AppNavigator)
export interface LocationObjectCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
}

// Utilisé pour la localisation (EcranSignalement)
export interface LocationObject {
  coords: LocationObjectCoords;
  timestamp: number;
}

// Utilisé pour l'authentification (AuthService, LoginScreen, RegisterScreen, ProfileScreen)
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ==================== TYPES SPÉCIFIQUES AUX SIGNALEMENTS ====================

// Utilisé pour les données statiques des types de problèmes (EcranSignalement)
export interface TypeProbleme {
  id: string;
  libelle: string;
  icone: string;
  couleur: string;
}

// Utilisé pour les données statiques des types de transport (EcranSignalement)
export interface TypeTransport {
  id: string;
  libelle: string;
  icone: string;
  filtre: string;
}

// Utilisé pour les lignes de transport de l'API IDF Mobilités (EcranSignalement, Ticket)
export interface LigneTransport {
  id_line: string;
  shortname_line: string;
  name_line: string;
  colourweb_hexa: string;
  textcolourweb_hexa: string;
  transportmode: string;
  operatorname: string;
}

// Type pour un ticket de signalement (EcranSignalement, MapScreen, Backend)
export interface Ticket {
  _id?: string; // Ajouté car le backend générera un ID
  user?: string; // ID de l'utilisateur qui a créé le ticket (optionnel, le backend le déduira du token)
  type: string; // Ex: 'Propreté', 'Équipement'
  description: string;
  transportLine: {
    id_line: string;
    name_line: string;
    transportmode: string;
    shortname_line?: string; // Ajouté pour faciliter l'affichage
  };
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  };
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'; // Statut du ticket
  createdAt?: string; // Date de création
  updatedAt?: string; // Date de dernière mise à jour
}

// ==================== TYPES SPÉCIFIQUES À NAVITIA (pour les perturbations) ====================

// Type pour les données de disruption de Navitia (MapScreen, Backend)
export interface NavitiaDisruption {
  id: string;
  status: string; // Ex: 'active', 'future', 'past'
  severity: {
    effect: string; // Ex: 'NO_SERVICE', 'REDUCED_SERVICE', 'SIGNIFICANT_DELAY'
    priority: number;
    name: string; // Ex: 'Interruption de service'
  };
  application_periods: {
    begin: string; // Date et heure de début (ISO string)
    end?: string; // Date et heure de fin (ISO string, peut être absente si en cours)
  }[];
  messages: {
    text: string;
    channel?: {
      content_type: string;
      name: string;
    }[];
  }[];
  affected_objects: {
    pt_object: {
      line?: {
        id: string; // ID Navitia de la ligne
        name: string;
        code: string;
        color: string;
        text_color: string;
        commercial_modes: { name: string; id: string }[];
        routes: { id: string }[];
        coord?: { lat: number; lon: number };
      };
      stop_point?: {
        id: string; // ID Navitia du point d'arrêt
        name: string;
        coord: { lat: number; lon: number };
      };
    };
    impacts: {
      criticality: string;
      infras_blocked: boolean;
      peak_hours: boolean;
      // Ajoutez d'autres propriétés d'impact si nécessaire
    };
  }[];
  updated_at: string;
  // ... autres champs pertinents de l'API Navitia si vous en avez besoin
}

// Type pour la réponse de l'API Navitia (MapScreen)
export interface NavitiaApiResponse {
  disruptions: NavitiaDisruption[];
  // ... autres champs comme pagination, context, etc.
}

// Types pour les requêtes de l'API Navitia (Backend, potentiellement MapScreen si vous passez des params)
export interface GetDisruptionsParams {
  latitude?: number;
  longitude?: number;
  distance?: number; // en mètres
  fromDateTime?: string; // ISO string
  untilDateTime?: string; // ISO string
  count?: number;
}