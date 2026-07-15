// URL de l'API : surchargée par REACT_APP_API_URL (définie dans docker-compose.yaml).
// Fallback : appel direct au backend exposé sur le port 8080.
export const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8080/api/"
export const USER_API = API_URL + "users";
export const CARTE_API = API_URL + "cartes";
export const LOGIN_API = API_URL + "login_check";
