import { db } from './firebase-config.js';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class DatabaseManager {
  constructor() {
    this.collections = {
      clubs: 'clubs',
      books: 'books',
      votes: 'votes',
      members: 'members',
    };
  }

  // Club management
  async createClub(clubData, userId) {
    try {
      const club = {
        ...clubData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        members: [userId],
        currentBook: null,
        booksRead: [],
        activeVoting: null,
      };

      const docRef = await addDoc(collection(db, this.collections.clubs), club);
      return { id: docRef.id, ...club };
    } catch (error) {
      console.error('Error creating club:', error);
      throw error;
    }
  }

  async getUserClubs(userId) {
    try {
      const q = query(
        collection(db, this.collections.clubs),
        where('members', 'array-contains', userId)
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting user clubs:', error);
      return [];
    }
  }

  async getClub(clubId) {
    try {
      const docRef = doc(db, this.collections.clubs, clubId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting club:', error);
      return null;
    }
  }

  async updateClub(clubId, updateData) {
    try {
      const docRef = doc(db, this.collections.clubs, clubId);
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating club:', error);
      return false;
    }
  }

  async joinClub(clubId, userId) {
    try {
      const docRef = doc(db, this.collections.clubs, clubId);
      await updateDoc(docRef, {
        members: arrayUnion(userId),
      });
      return true;
    } catch (error) {
      console.error('Error joining club:', error);
      return false;
    }
  }

  async leaveClub(clubId, userId) {
    try {
      const docRef = doc(db, this.collections.clubs, clubId);
      await updateDoc(docRef, {
        members: arrayRemove(userId),
      });
      return true;
    } catch (error) {
      console.error('Error leaving club:', error);
      return false;
    }
  }

  // Book management
  async setWeeklyBook(clubId, bookData) {
    try {
      const docRef = doc(db, this.collections.clubs, clubId);
      await updateDoc(docRef, {
        currentBook: {
          ...bookData,
          setAt: serverTimestamp(),
        },
      });
      return true;
    } catch (error) {
      console.error('Error setting weekly book:', error);
      return false;
    }
  }

  async addFinishedBook(clubId, bookData) {
    try {
      const docRef = doc(db, this.collections.clubs, clubId);
      await updateDoc(docRef, {
        booksRead: arrayUnion({
          ...bookData,
          finishedAt: serverTimestamp(),
        }),
        currentBook: null,
      });
      return true;
    } catch (error) {
      console.error('Error adding finished book:', error);
      return false;
    }
  }

  // Voting management
  async createVoting(clubId, votingData, userId) {
    try {
      const voting = {
        ...votingData,
        clubId,
        createdBy: userId,
        createdAt: serverTimestamp(),
        votes: {},
        isActive: true,
      };

      const docRef = await addDoc(
        collection(db, this.collections.votes),
        voting
      );

      // Update club with active voting
      await this.updateClub(clubId, { activeVoting: docRef.id });

      return { id: docRef.id, ...voting };
    } catch (error) {
      console.error('Error creating voting:', error);
      throw error;
    }
  }

  async vote(votingId, userId, bookIndex) {
    try {
      const docRef = doc(db, this.collections.votes, votingId);
      await updateDoc(docRef, {
        [`votes.${userId}`]: bookIndex,
      });
      return true;
    } catch (error) {
      console.error('Error voting:', error);
      return false;
    }
  }

  async getVoting(votingId) {
    try {
      const docRef = doc(db, this.collections.votes, votingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting voting:', error);
      return null;
    }
  }

  async getClubVotings(clubId) {
    try {
      const q = query(
        collection(db, this.collections.votes),
        where('clubId', '==', clubId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting club votings:', error);
      return [];
    }
  }

  async endVoting(votingId, clubId) {
    try {
      const docRef = doc(db, this.collections.votes, votingId);
      await updateDoc(docRef, { isActive: false });

      // Remove active voting from club
      await this.updateClub(clubId, { activeVoting: null });

      return true;
    } catch (error) {
      console.error('Error ending voting:', error);
      return false;
    }
  }

  // Utility functions
  generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async findClubByInviteCode(inviteCode) {
    try {
      const q = query(
        collection(db, this.collections.clubs),
        where('inviteCode', '==', inviteCode)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error finding club by invite code:', error);
      return null;
    }
  }

  // Local storage for offline support
  saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  }

  removeFromLocalStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
}

// Export instance
export const dbManager = new DatabaseManager();
