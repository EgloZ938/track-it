// // Utilisé pour la localisation (MapScreen, EcranSignalement, AppNavigator)
// export interface LocationObjectCoords {
//   latitude: number;
//   longitude: number;
//   accuracy: number | null;
//   altitude: number | null;
//   heading: number | null;
//   speed: number | null;
// }

// // Utilisé pour la localisation (EcranSignalement)
// export interface LocationObject {
//   coords: LocationObjectCoords;
//   timestamp: number;
// }

// // Utilisé pour l'authentification (AuthService, LoginScreen, RegisterScreen, ProfileScreen)
// export interface User {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
// }

// export interface LoginData {
//   email: string;
//   password: string;
// }

// export interface RegisterData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
// }

// export interface AuthResponse {
//   message: string;
//   token: string;
//   user: User;
// }

// // ==================== TYPES SPÉCIFIQUES AUX SIGNALEMENTS ====================

// // Utilisé pour les données statiques des types de problèmes (EcranSignalement)
// export interface TypeProbleme {
//   id: string;
//   libelle: string;
//   icone: string;
//   couleur: string;
// }

// // Utilisé pour les données statiques des types de transport (EcranSignalement)
// export interface TypeTransport {
//   id: string;
//   libelle: string;
//   icone: string;
//   filtre: string;
// }

// // Utilisé pour les lignes de transport de l'API IDF Mobilités (EcranSignalement, Ticket)
// export interface LigneTransport {
//   id_line: string;
//   shortname_line: string;
//   name_line: string;
//   colourweb_hexa: string;
//   textcolourweb_hexa: string;
//   transportmode: string;
//   operatorname: string;
// }

// // Type pour un ticket de signalement (EcranSignalement, MapScreen, Backend)
// export interface Ticket {
//   _id?: string;
//   user?: string;
//   type: string;
//   description: string;
//   transportLine: {
//     id_line: string;
//     name_line: string;
//     transportmode: string;
//     shortname_line?: string;
//     picto_transportmode?: string;
//     picto_line?: string;
//   };
//   location: {
//     latitude: number;
//     longitude: number;
//     accuracy?: number | null;
//   };
//   status?: 'open' | 'in_progress' | 'resolved' | 'closed';
//   createdAt?: string;
//   updatedAt?: string;
// }

// // ==================== TYPES SPÉCIFIQUES À NAVITIA (pour les perturbations) ====================

// // DÉFINIR D'ABORD NavitiaMessage POUR POUVOIR L'UTILISER DANS NavitiaDisruption
// export interface NavitiaMessage {
//   text: string;
//   // CORRECTION CLÉ ICI : channel est une string, pas un tableau d'objets
//   channel?: string; 
//   // Ajoutez d'autres propriétés de message si elles existent dans la réponse API
//   // par exemple: last_update?: string; type?: string;
// }


// // Type pour les données de disruption de Navitia (MapScreen, Backend)
// export interface NavitiaDisruption {
//   id: string;
//   status: string; // Ex: 'active', 'future', 'past'
//   severity: {
//     effect: string; // Ex: 'NO_SERVICE', 'REDUCED_SERVICE', 'SIGNIFICANT_DELAY'
//     priority: number;
//     name: string; 
//     id: string; // Ajouté 'id' car vous l'utilisez dans 'severity.id' (e.g., 'severe', 'major')
//   };
//   application_periods: {
//     begin: string; 
//     end?: string; 
//   }[];
//   // Utiliser l'interface NavitiaMessage définie au-dessus
//   messages: NavitiaMessage[]; 
//   affected_objects: {
//     pt_object: {
//       line?: {
//         id: string; 
//         name: string;
//         code: string;
//         color: string;
//         text_color: string;
//         commercial_modes: { name: string; id: string }[];
//         routes: { id: string }[];
//         coord?: { lat: number; lon: number };
//         short_name?: string; // Ajouté car vous l'utilisez dans TrafficInfoScreen
//       };
//       stop_point?: {
//         id: string; 
//         name: string;
//         coord: { lat: number; lon: number };
//       };
//     };
//     impacts: {
//       criticality: string;
//       infras_blocked: boolean;
//       peak_hours: boolean;
//       // Ajoutez d'autres propriétés d'impact si nécessaire
//     };
//   }[];
//   updated_at: string;
  
// }

// // Type pour la réponse de l'API Navitia (MapScreen)
// export interface NavitiaApiResponse {
//   disruptions: NavitiaDisruption[];
//   // Ajoutez d'autres propriétés si l'API Navitia les renvoie (ex: pagination, context)
// }

// // Types pour les requêtes de l'API Navitia (Backend, potentiellement MapScreen si vous passez des params)
// export interface GetDisruptionsParams {
//   latitude?: number;
//   longitude?: number;
//   distance?: number; 
//   fromDateTime?: string; 
//   untilDateTime?: string; 
//   count?: number;
// }






/* ---------- Types généraux déjà présents (inchangés) ---------- */
export interface LocationObjectCoords {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
}
export interface LocationObject {
  coords: LocationObjectCoords;
  timestamp: number;
}
export interface User { id: string; email: string; firstName: string; lastName: string; }
export interface LoginData { email: string; password: string; }
export interface RegisterData { firstName: string; lastName: string; email: string; password: string; }
export interface AuthResponse { message: string; token: string; user: User; }

/* ---------- Signalements (inchangés) ---------- */
export interface TypeProbleme { id: string; libelle: string; icone: string; couleur: string; }
export interface TypeTransport { id: string; libelle: string; icone: string; filtre: string; }
export interface LigneTransport {
  id_line: string; shortname_line: string; name_line: string;
  colourweb_hexa: string; textcolourweb_hexa: string;
  transportmode: string; operatorname: string;
}
export interface Ticket {
  _id?: string; user?: string; type: string; description: string;
  transportLine: {
    id_line: string; name_line: string; transportmode: string;
    shortname_line?: string; picto_transportmode?: string; picto_line?: string;
  };
  location: { latitude: number; longitude: number; accuracy?: number | null };
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt?: string; updatedAt?: string;
}

/* ================= IDFM – Disruptions ================= */

/** Période d’application */
export interface NavitiaApplicationPeriod {
  begin: string;              // "20250704T050000"
  end?: string | null;        // peut être absent
}

/** Sévérité */
export type NavitiaSeverityName = 'BLOCKING' | 'DISTURBED' | 'INFORMATION';
export interface NavitiaSeverity {
  name: NavitiaSeverityName;
  effect?: string;
  priority?: number;
}

/** Objet impacté */
export interface NavitiaImpactedObject {
  type: 'line' | 'network' | 'stop_point' | 'stop_area';
  id: string;
  name: string;
  mode?: string;              // ex : "Bus" (présent côté IDFM)
  line?: {
    id: string;
    shortName?: string;
    name: string;
    mode: string;
    color?: string;
    textColor?: string;
  };
  disruptionIds: string[];
}

/** Disruption */
export interface NavitiaDisruption {
  id: string;
  status: 'active' | 'future' | 'past';
  severity: NavitiaSeverity;
  applicationPeriods: NavitiaApplicationPeriod[];
  /* Texte */
  title?: string;
  message?: string;
  /* Objets impactés */
  impactedObjects: NavitiaImpactedObject[];
  /* Métadonnées */
  tags?: string[];
  cause?: string;
  lastUpdate?: string;
}

/** Réponse de l’API */
export interface NavitiaApiResponse {
  disruptions: NavitiaDisruption[];
}

/** Paramètres optionnels côté backend */
export interface GetDisruptionsParams {
  latitude?: number; longitude?: number; distance?: number;
  fromDateTime?: string; untilDateTime?: string; count?: number;
}
