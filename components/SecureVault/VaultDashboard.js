import { useState, useEffect } from 'react';
import secureVaultService from '../../lib/secureVaultService';
import SecureNote from './SecureNote';

const VaultDashboard = ({ onLock, onLogout }) => {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toate');
  const [showNewNote, setShowNewNote] = useState(false);
  const [stats, setStats] = useState(null);
  const [sortBy, setSortBy] = useState('updatedAt'); // 'updatedAt' | 'title' | 'category'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const categories = ['Toate', 'General', 'Parole', 'Carduri', 'Notițe', 'Conturi', 'Coduri'];

  useEffect(() => {
    loadNotes();
    loadStats();
    
    // Auto-lock after 2 minutes of inactivity
    const inactivityTimer = setTimeout(() => {
      handleLock();
    }, 2 * 60 * 1000);

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = secureVaultService.getAllSecureNotes();
      if (result.success) {
        setNotes(result.notes);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Eroare la încărcarea notițelor');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = secureVaultService.getVaultStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Eroare la încărcarea statisticilor:', error);
    }
  };

  const handleSaveNote = async (noteData) => {
    try {
      let result;
      if (noteData.id) {
        result = secureVaultService.updateSecureNote(noteData.id, noteData.title, noteData.content, noteData.category);
      } else {
        result = secureVaultService.addSecureNote(noteData.title, noteData.content, noteData.category);
      }

      if (result.success) {
        await loadNotes();
        await loadStats();
        setShowNewNote(false);
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert('Eroare la salvarea notiței: ' + error.message);
      throw error;
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const result = secureVaultService.deleteSecureNote(noteId);
      if (result.success) {
        await loadNotes();
        await loadStats();
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert('Eroare la ștergerea notiței: ' + error.message);
      throw error;
    }
  };

  const handleLock = () => {
    secureVaultService.lockVault();
    onLock?.();
  };

  const handleExport = async () => {
    try {
      const result = secureVaultService.exportVaultData();
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Backup exportat cu succes!');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert('Eroare la export: ' + error.message);
    }
  };

  const filteredAndSortedNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Toate' || note.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'updatedAt':
        default:
          comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Ieri';
    if (diffDays === 0) return 'Azi';
    if (diffDays < 7) return `Acum ${diffDays} zile`;
    
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="vault-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Se încarcă seiful...</p>
      </div>
    );
  }

  return (
    <div className="vault-dashboard">
      <div className="vault-header">
        <div className="header-left">
          <h1 className="vault-title">
            🔐 Seif Securizat
          </h1>
          {stats && (
            <div className="vault-stats">
              <span className="stat-item">
                📝 {stats.totalNotes} notițe
              </span>
              <span className="stat-item">
                📅 Creat: {formatDate(stats.createdAt)}
              </span>
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <button className="btn-export" onClick={handleExport}>
            📤 Export Backup
          </button>
          <button className="btn-lock" onClick={handleLock}>
            🔒 Blochează Seiful
          </button>
        </div>
      </div>

      <div className="vault-controls">
        <div className="search-filter-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Caută notițe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'Toate' ? '📋 Toate categoriile' : cat}
              </option>
            ))}
          </select>

          <button
            className="btn-add-note"
            onClick={() => setShowNewNote(true)}
          >
            ➕ Notiță Nouă
          </button>
        </div>

        <div className="sort-controls">
          <span className="sort-label">Sortează după:</span>
          {['updatedAt', 'title', 'category'].map(field => (
            <button
              key={field}
              className={`sort-button ${sortBy === field ? 'active' : ''}`}
              onClick={() => toggleSort(field)}
            >
              {field === 'updatedAt' ? 'Data' : field === 'title' ? 'Titlu' : 'Categorie'}
              {sortBy === field && (
                <span className="sort-direction">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="notes-container">
        {showNewNote && (
          <SecureNote
            isNew={true}
            onSave={handleSaveNote}
            onCancel={() => setShowNewNote(false)}
          />
        )}

        {filteredAndSortedNotes.length === 0 && !showNewNote ? (
          <div className="empty-state">
            <div className="empty-icon">🔐</div>
            <h3>Nicio notiță găsită</h3>
            <p>
              {searchTerm || selectedCategory !== 'Toate'
                ? 'Încercați să modificați criteriile de căutare sau filtrare.'
                : 'Creați prima notiță securizată pentru a începe.'}
            </p>
            {!searchTerm && selectedCategory === 'Toate' && (
              <button
                className="btn-add-note-primary"
                onClick={() => setShowNewNote(true)}
              >
                ➕ Creați Prima Notiță
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedNotes.map(note => (
            <SecureNote
              key={note.id}
              note={note}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
          ))
        )}
      </div>

      <div className="vault-footer">
        <div className="security-info">
          <span className="security-item">🔒 Criptare AES-256</span>
          <span className="security-item">💾 Stocare 100% locală</span>
          <span className="security-item">🛡️ Fără acces terță parte</span>
        </div>
        <div className="auto-lock-info">
          ⏰ Auto-lock după 2 minute inactivitate
        </div>
      </div>

      <style jsx>{`
        .vault-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
          padding: 2rem;
          position: relative;
        }

        .vault-dashboard::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.05) 0%, transparent 50%);
          pointer-events: none;
          z-index: -1;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.2);
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .vault-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-left {
          flex: 1;
        }

        .vault-title {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .vault-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat-item {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-export, .btn-lock {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-export {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }

        .btn-export:hover {
          background: rgba(16, 185, 129, 0.3);
          transform: translateY(-1px);
        }

        .btn-lock {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .btn-lock:hover {
          background: rgba(239, 68, 68, 0.3);
          transform: translateY(-1px);
        }

        .vault-controls {
          margin-bottom: 2rem;
        }

        .search-filter-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 200px;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.15);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.5);
        }

        .category-filter {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          font-size: 0.9rem;
          outline: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-filter:focus {
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.15);
        }

        .category-filter option {
          background: #1a1a2e;
          color: white;
        }

        .btn-add-note {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-add-note:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .sort-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
        }

        .sort-button {
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .sort-button:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .sort-button.active {
          background: rgba(102, 126, 234, 0.3);
          border-color: rgba(102, 126, 234, 0.5);
          color: #667eea;
        }

        .sort-direction {
          font-weight: bold;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #fca5a5;
        }

        .notes-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          color: white;
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .empty-state p {
          margin: 0 0 2rem 0;
          line-height: 1.6;
        }

        .btn-add-note-primary {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-add-note-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .vault-footer {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .security-info {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .security-item {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .auto-lock-info {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
          font-style: italic;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .vault-dashboard {
            padding: 1rem;
          }

          .vault-header {
            flex-direction: column;
            align-items: stretch;
          }

          .vault-title {
            font-size: 1.5rem;
          }

          .header-actions {
            justify-content: stretch;
          }

          .btn-export, .btn-lock {
            flex: 1;
          }

          .search-filter-row {
            flex-direction: column;
          }

          .search-box {
            max-width: none;
          }

          .sort-controls {
            justify-content: center;
          }

          .vault-footer {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default VaultDashboard;
