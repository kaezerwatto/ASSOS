// appwrite-service.ts - Version corrigée
import { account, databases, storage, ID, Query } from './appwrite';

// Types de base
export interface AppwriteUser {
  $id: string;
  name: string;
  email: string;
  labels?: string[]; // Pour stocker les rôles
}

interface Document {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

// Service d'authentification
export const authService = {
  // Vérifier si une session est déjà active AVANT de se connecter
  async checkExistingSession() {
    try {
      const user = await account.get() as AppwriteUser;
      return { user, hasSession: true };
    } catch (error) {
      return { user: null, hasSession: false };
    }
  },

  // Connexion
  async login(email: string, password: string) {
    try {
      // Vérifier d'abord si une session existe déjà
      const { hasSession, user } = await this.checkExistingSession();
      
      if (hasSession && user) {
        console.log('Session déjà active pour:', user.email);
        return { user, isNewSession: false };
      }

      // Créer une nouvelle session seulement si aucune n'existe
      const session = await account.createEmailPasswordSession(email, password);
      const currentUser = await account.get() as AppwriteUser;
      
      return { user: currentUser, isNewSession: true };
    } catch (error: any) {
      console.error('Erreur de connexion Appwrite:', error);
      
      // Gestion spécifique de l'erreur de session active
      if (error.message?.includes('session is active')) {
        throw new Error('Une session est déjà active. Veuillez vous déconnecter d\'abord.');
      }
      
      throw new Error(error.message || 'Erreur de connexion');
    }
  },

  // Nouvelle fonction pour déterminer le rôle
  async getUserRole(user: AppwriteUser): Promise<'admin' | 'tresorier'> {
    // Ici vous pouvez vérifier les labels ou d'autres attributs de l'utilisateur
    // Pour l'exemple, on va utiliser l'email pour déterminer le rôle
    if (user.email.includes('admin') || user.labels?.includes('admin')) {
      return 'admin';
    } else if (user.email.includes('tresorier') || user.labels?.includes('tresorier')) {
      return 'tresorier';
    }
    
    // Par défaut, on retourne trésorier
    return 'tresorier';
  },

  // Inscription
  async register(email: string, password: string, name: string) {
    return await account.create(ID.unique(), email, password, name);
  },

  // Déconnexion
  async logout() {
    return await account.deleteSession('current');
  },

  // Utilisateur actuel
  async getCurrentUser(): Promise<AppwriteUser | null> {
    try {
      return await account.get() as AppwriteUser;
    } catch (error) {
      return null;
    }
  },

  // Vérifier si connecté
  async isLoggedIn(): Promise<boolean> {
    try {
      await account.get();
      return true;
    } catch (error) {
      return false;
    }
  }
};

// Service de base de données
export const databaseService = {
  // Créer un document
  async createDocument(
    databaseId: string, 
    collectionId: string, 
    data: any
  ) {
    return await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      data
    );
  },

  // Lire des documents
  async listDocuments(
    databaseId: string, 
    collectionId: string, 
    queries: string[] = []
  ) {
    return await databases.listDocuments(databaseId, collectionId, queries);
  },

  // Récupérer un document spécifique
  async getDocument(
    databaseId: string, 
    collectionId: string, 
    documentId: string
  ) {
    return await databases.getDocument(databaseId, collectionId, documentId);
  },

  // Mettre à jour un document
  async updateDocument(
    databaseId: string, 
    collectionId: string, 
    documentId: string, 
    data: any
  ) {
    return await databases.updateDocument(databaseId, collectionId, documentId, data);
  },

  // Supprimer un document
  async deleteDocument(
    databaseId: string, 
    collectionId: string, 
    documentId: string
  ) {
    return await databases.deleteDocument(databaseId, collectionId, documentId);
  }
};

// Service de stockage
export const storageService = {
  // Uploader un fichier
  async uploadFile(bucketId: string, file: File) {
    return await storage.createFile(bucketId, ID.unique(), file);
  },

  // Récupérer l'URL d'un fichier
  getFileView(bucketId: string, fileId: string) {
    return storage.getFileView(bucketId, fileId);
  },

  // Supprimer un fichier
  async deleteFile(bucketId: string, fileId: string) {
    return await storage.deleteFile(bucketId, fileId);
  }
};