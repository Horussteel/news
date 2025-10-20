import CryptoJS from 'crypto-js';

class SecureVaultService {
  constructor() {
    this.storageKey = 'secureVault';
    this.sessionKey = 'vaultSession';
    this.maxFailedAttempts = 5;
    this.lockoutDuration = 5 * 60 * 1000; // 5 minute
  }

  // Inițializează seiful cu un PIN master
  initializeVault(masterPin) {
    try {
      // Verifică dacă seiful există deja
      if (this.isVaultInitialized()) {
        throw new Error('Seiful este deja inițializat');
      }

      // Generează un salt unic pentru acest seif
      const salt = CryptoJS.lib.WordArray.random(256/8);
      
      // Crează un hash al PIN-ului pentru verificare
      const pinHash = CryptoJS.PBKDF2(masterPin, salt, {
        keySize: 256/32,
        iterations: 10000
      });

      // Salvează datele de inițializare
      const vaultData = {
        initialized: true,
        salt: salt.toString(),
        pinHash: pinHash.toString(),
        failedAttempts: 0,
        lockoutUntil: null,
        notes: [],
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(vaultData));
      return { success: true, message: 'Seif inițializat cu succes' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Verifică dacă seiful este inițializat
  isVaultInitialized() {
    try {
      const vaultData = localStorage.getItem(this.storageKey);
      if (!vaultData) return false;
      
      const parsed = JSON.parse(vaultData);
      return parsed.initialized === true;
    } catch (error) {
      return false;
    }
  }

  // Verifică dacă seiful este blocat
  isVaultLocked() {
    try {
      const vaultData = JSON.parse(localStorage.getItem(this.storageKey));
      if (!vaultData.lockoutUntil) return false;
      
      return new Date() < new Date(vaultData.lockoutUntil);
    } catch (error) {
      return false;
    }
  }

  // Timp rămas până la deblocare
  getLockoutTimeRemaining() {
    try {
      const vaultData = JSON.parse(localStorage.getItem(this.storageKey));
      if (!vaultData.lockoutUntil) return 0;
      
      const lockoutTime = new Date(vaultData.lockoutUntil);
      const now = new Date();
      const remaining = lockoutTime - now;
      
      return Math.max(0, Math.ceil(remaining / 1000));
    } catch (error) {
      return 0;
    }
  }

  // Deblochează seiful cu PIN-ul master
  unlockVault(masterPin) {
    try {
      console.log('🔐 [VaultService] Încercare deblocare cu PIN:', masterPin);
      
      // Verifică dacă seiful este inițializat
      if (!this.isVaultInitialized()) {
        console.log('🔐 [VaultService] Seiful nu este inițializat');
        return { success: false, message: 'Seiful nu este inițializat' };
      }

      // Verifică dacă seiful este blocat
      if (this.isVaultLocked()) {
        const remaining = this.getLockoutTimeRemaining();
        console.log('🔐 [VaultService] Seiful este blocat. Timp rămas:', remaining);
        return { 
          success: false, 
          message: `Seiful este blocat. Încercați din nou în ${remaining} secunde`,
          lockoutTimeRemaining: remaining
        };
      }

      const vaultData = JSON.parse(localStorage.getItem(this.storageKey));
      console.log('🔐 [VaultService] Date seif încărcate:', vaultData);
      
      // IMPORTANT: Convertim salt-ul stocat înapoi în WordArray pentru PBKDF2
      const salt = CryptoJS.enc.Hex.parse(vaultData.salt);
      
      // Verifică PIN-ul folosind salt-ul stocat
      const pinHash = CryptoJS.PBKDF2(masterPin, salt, {
        keySize: 256/32,
        iterations: 10000
      });
      
      console.log('🔐 [VaultService] Salt stocat:', vaultData.salt);
      console.log('🔐 [VaultService] Salt WordArray:', salt.toString());
      console.log('🔐 [VaultService] PIN hash calculat:', pinHash.toString());
      console.log('🔐 [VaultService] PIN hash stocat:', vaultData.pinHash);
      console.log('🔐 [VaultService] PIN hash se potrivesc?', pinHash.toString() === vaultData.pinHash);

      if (pinHash.toString() !== vaultData.pinHash) {
        // Incrementează numărul de încercări eșuate
        vaultData.failedAttempts = (vaultData.failedAttempts || 0) + 1;
        console.log('🔐 [VaultService] PIN incorect! Încercări eșuate:', vaultData.failedAttempts);
        
        // Blochează seiful dacă s-au depășit încercările
        if (vaultData.failedAttempts >= this.maxFailedAttempts) {
          vaultData.lockoutUntil = new Date(Date.now() + this.lockoutDuration).toISOString();
          localStorage.setItem(this.storageKey, JSON.stringify(vaultData));
          
          return { 
            success: false, 
            message: `Prea multe încercări eșuate. Seiful a fost blocat pentru ${this.lockoutDuration/60000} minute`,
            locked: true
          };
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(vaultData));
        const remaining = this.maxFailedAttempts - vaultData.failedAttempts;
        
        return { 
          success: false, 
          message: `PIN incorect. Mai aveți ${remaining} încercări`,
          failedAttempts: vaultData.failedAttempts
        };
      }

      // Resetează încercările eșuate la succes
      vaultData.failedAttempts = 0;
      vaultData.lockoutUntil = null;
      localStorage.setItem(this.storageKey, JSON.stringify(vaultData));
      console.log('🔐 [VaultService] Date seif actualizate după succes');

      // Creează sesiune temporară
      const sessionToken = this.generateSessionToken(masterPin);
      sessionStorage.setItem(this.sessionKey, sessionToken);
      console.log('🔐 [VaultService] Sesiune creată:', sessionToken);

      return { 
        success: true, 
        message: 'Seif deblocat cu succes',
        sessionToken
      };
    } catch (error) {
      console.log('🔐 [VaultService] Eroare la deblocare:', error);
      return { success: false, message: 'Eroare la deblocarea seifului' };
    }
  }

  // Generează un token de sesiune
  generateSessionToken(masterPin) {
    const tokenData = {
      timestamp: Date.now(),
      pin: masterPin,
      random: Math.random().toString(36)
    };
    return CryptoJS.AES.encrypt(JSON.stringify(tokenData), 'vault-session-key').toString();
  }

  // Verifică dacă sesiunea este activă
  isSessionActive() {
    try {
      const sessionToken = sessionStorage.getItem(this.sessionKey);
      if (!sessionToken) return false;

      const decrypted = CryptoJS.AES.decrypt(sessionToken, 'vault-session-key');
      const tokenData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      
      // Verifică dacă sesiunea nu a expirat (30 minute)
      const sessionAge = Date.now() - tokenData.timestamp;
      return sessionAge < 30 * 60 * 1000;
    } catch (error) {
      return false;
    }
  }

  // Obține PIN-ul din sesiunea activă
  getCurrentPin() {
    try {
      const sessionToken = sessionStorage.getItem(this.sessionKey);
      if (!sessionToken) return null;

      const decrypted = CryptoJS.AES.decrypt(sessionToken, 'vault-session-key');
      const tokenData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      
      // Verifică dacă sesiunea este încă validă
      const sessionAge = Date.now() - tokenData.timestamp;
      if (sessionAge >= 30 * 60 * 1000) {
        this.lockVault();
        return null;
      }
      
      return tokenData.pin;
    } catch (error) {
      return null;
    }
  }

  // Blochează seiful (șterge sesiunea)
  lockVault() {
    sessionStorage.removeItem(this.sessionKey);
    return { success: true, message: 'Seif blocat' };
  }

  // Criptează datele cu PIN-ul curent
  encryptData(data, masterPin) {
    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), masterPin).toString();
      return encrypted;
    } catch (error) {
      throw new Error('Eroare la criptarea datelor');
    }
  }

  // Decriptează datele cu PIN-ul curent
  decryptData(encryptedData, masterPin) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, masterPin);
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        throw new Error('Date criptate invalide');
      }
      
      return JSON.parse(decryptedText);
    } catch (error) {
      throw new Error('Eroare la decriptarea datelor');
    }
  }

  // Adaugă o notiță securizată
  addSecureNote(title, content, category = 'General') {
    try {
      const masterPin = this.getCurrentPin();
      if (!masterPin) {
        return { success: false, message: 'Seiful nu este deblocat' };
      }

      const vaultData = JSON.parse(localStorage.getItem(this.storageKey));
      
      const note = {
        id: Date.now().toString(),
        title,
        content,
        category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Criptează notița
      const encryptedNote = this.encryptData(note, masterPin);
      vaultData.notes.push(encryptedNote);
      
      localStorage.setItem(this.storageKey, JSON.stringify(vaultData));
      
      return { success: true, message: 'Notiță adăugată cu succes', noteId: note.id };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Obține toate notițele decriptate
  getAllSecureNotes() {
    try {
      const masterPin = this.getCurrentPin();
      if (!masterPin) {
        return { success: false, message: 'Seiful nu este deblocat' };
      }

      const vaultData = JSON.parse(localStorage.getItem(this.storageKey));
      const decryptedNotes = [];

      for (const encryptedNote of vaultData.notes) {
        try {
          const note = this.decryptData(encryptedNote, masterPin);
          decryptedNotes.push(note);
        } catch (error) {
          // Ignoră notițele care nu pot fi decriptate
          console.warn('Notiță coruptă sau invalidă:', error);
        }
      }

      // Sortează după data actualizării
      decryptedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      return { success: true, notes: decryptedNotes };
    } catch (error) {
      return { success: false, message: 'Eroare la încărcarea notițelor' };
    }
  }

  // Actualizează o notiță existentă
  updateSecureNote(noteId, title, content, category) {
    try {
      const masterPin = this.getCurrentPin();
      if (!masterPin) {
        return { success: false, message: 'Seiful nu este deblocat' };
      }

      const vaultData = JSON.parse(localStorage.getItem(this.storageKey));
      
      for (let i = 0; i < vaultData.notes.length; i++) {
        try {
          const note = this.decryptData(vaultData.notes[i], masterPin);
          
          if (note.id === noteId) {
            // Actualizează notița
            const updatedNote = {
              ...note,
              title,
              content,
              category,
              updatedAt: new Date().toISOString()
            };

            // Criptează din nou și înlocuiește
            vaultData.notes[i] = this.encryptData(updatedNote, masterPin);
            localStorage.setItem(this.storageKey, JSON.stringify(vaultData));
            
            return { success: true, message: 'Notiță actualizată cu succes' };
          }
        } catch (error) {
          continue; // Ignoră notițele corupte
        }
      }

      return { success: false, message: 'Notiță nu a fost găsită' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Șterge o notiță
  deleteSecureNote(noteId) {
    try {
      const masterPin = this.getCurrentPin();
      if (!masterPin) {
        return { success: false, message: 'Seiful nu este deblocat' };
      }

      const vaultData = JSON.parse(localStorage.getItem(this.storageKey));
      
      for (let i = 0; i < vaultData.notes.length; i++) {
        try {
          const note = this.decryptData(vaultData.notes[i], masterPin);
          
          if (note.id === noteId) {
            // Șterge notița
            vaultData.notes.splice(i, 1);
            localStorage.setItem(this.storageKey, JSON.stringify(vaultData));
            
            return { success: true, message: 'Notiță ștearsă cu succes' };
          }
        } catch (error) {
          continue; // Ignoră notițele corupte
        }
      }

      return { success: false, message: 'Notiță nu a fost găsită' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Obține statistici despre seif
  getVaultStats() {
    try {
      if (!this.isVaultInitialized()) {
        return { success: false, message: 'Seiful nu este inițializat' };
      }

      const vaultData = JSON.parse(localStorage.getItem(this.storageKey));
      const notesResult = this.getAllSecureNotes();
      
      if (!notesResult.success) {
        return notesResult;
      }

      const stats = {
        totalNotes: notesResult.notes.length,
        categories: {},
        createdAt: vaultData.createdAt,
        lastAccessed: new Date().toISOString()
      };

      // Calculează statistici pe categorii
      notesResult.notes.forEach(note => {
        stats.categories[note.category] = (stats.categories[note.category] || 0) + 1;
      });

      return { success: true, stats };
    } catch (error) {
      return { success: false, message: 'Eroare la obținerea statisticilor' };
    }
  }

  // Exportă toate datele (backup criptat)
  exportVaultData() {
    try {
      const vaultData = localStorage.getItem(this.storageKey);
      if (!vaultData) {
        return { success: false, message: 'Nu există date de exportat' };
      }

      return { 
        success: true, 
        data: vaultData,
        filename: `vault-backup-${new Date().toISOString().split('T')[0]}.json`,
        message: 'Date exportate cu succes'
      };
    } catch (error) {
      return { success: false, message: 'Eroare la exportul datelor' };
    }
  }

  // Importă date din backup
  importVaultData(backupData) {
    try {
      const parsedData = JSON.parse(backupData);
      
      // Validează structura datelor
      if (!parsedData.initialized || !parsedData.salt || !parsedData.pinHash) {
        return { success: false, message: 'Backup invalid' };
      }

      // Verifică dacă seiful există deja
      if (this.isVaultInitialized()) {
        return { success: false, message: 'Seiful există deja. Ștergeți-l mai întâi' };
      }

      localStorage.setItem(this.storageKey, JSON.stringify(parsedData));
      
      return { success: true, message: 'Date importate cu succes' };
    } catch (error) {
      return { success: false, message: 'Eroare la importul datelor' };
    }
  }

  // Șterge complet seiful (periculos!)
  resetVault() {
    try {
      // Blochează mai întâi seifulul dacă e deschis
      this.lockVault();
      
      // Șterge toate datele din localStorage
      localStorage.removeItem(this.storageKey);
      
      return { success: true, message: 'Seif a fost resetat complet. Toate datele au fost șterse permanent.' };
    } catch (error) {
      return { success: false, message: 'Eroare la resetarea seifului: ' + error.message };
    }
  }
}

export default new SecureVaultService();
