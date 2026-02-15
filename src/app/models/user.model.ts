export interface User {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  passwordHash?: string;
  password?: string;
}

