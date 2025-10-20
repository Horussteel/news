import { useState, useEffect, useRef } from 'react';

const SecureNote = ({ 
  note, 
  onSave, 
  onDelete, 
  onCancel, 
  isNew = false,
  categories = ['General', 'Parole', 'Carduri', 'Notițe', 'Conturi', 'Coduri']
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState(note?.category || 'General');
  const [showContent, setShowContent] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const contentRef = useRef(null);
  const originalTitle = note?.title || '';
  const originalContent = note?.content || '';
  const originalCategory = note?.category || 'General';

  useEffect(() => {
    const changed = title !== originalTitle || 
                   content !== originalContent || 
                   category !== originalCategory;
    setHasChanges(changed);
  }, [title, content, category, originalTitle, originalContent, originalCategory]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Titlul este obligatoriu');
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.({
        id: note?.id,
        title: title.trim(),
        content: content.trim(),
        category
      });
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      alert('Eroare la salvarea notiței: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete?.(note?.id);
    } catch (error) {
      alert('Eroare la ștergerea notiței: ' + error.message);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges && !confirm('Aveți modificări nesalvate. Sigur doriți să anulați?')) {
      return;
    }
    
    setTitle(originalTitle);
    setContent(originalContent);
    setCategory(originalCategory);
    setIsEditing(false);
    setHasChanges(false);
    setShowDeleteConfirm(false);
  };

  const startEditing = () => {
    setIsEditing(true);
    setShowContent(true);
    setTimeout(() => {
      contentRef.current?.focus();
    }, 100);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'General': '📝',
      'Parole': '🔑',
      'Carduri': '💳',
      'Notițe': '📋',
      'Conturi': '👤',
      'Coduri': '🔢'
    };
    return icons[category] || '📝';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'General': '#667eea',
      'Parole': '#ef4444',
      'Carduri': '#10b981',
      'Notițe': '#f59e0b',
      'Conturi': '#8b5cf6',
      'Coduri': '#06b6d4'
    };
    return colors[category] || '#667eea';
  };

  if (isEditing) {
    return (
      <div className="secure-note editing">
        <div className="note-header">
          <input
            type="text"
            className="note-title-input"
            placeholder="Titlul notiței..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <select
            className="note-category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="note-content-editor">
          <textarea
            ref={contentRef}
            className="note-content-input"
            placeholder="Conținutul notiței..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            maxLength={10000}
          />
          <div className="content-info">
            <span className="char-count">{content.length}/10000</span>
          </div>
        </div>

        <div className="note-actions">
          <button
            className="btn-cancel"
            onClick={handleCancel}
            disabled={isSaving || isDeleting}
          >
            Anulează
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={isSaving || isDeleting || !title.trim()}
          >
            {isSaving ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>

        <style jsx>{`
          .secure-note.editing {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            padding: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          }

          .note-header {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
          }

          .note-title-input {
            flex: 1;
            min-width: 200px;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            outline: none;
            transition: all 0.3s ease;
          }

          .note-title-input:focus {
            border-color: #667eea;
            background: rgba(255, 255, 255, 0.15);
          }

          .note-title-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

          .note-category-select {
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            font-size: 0.9rem;
            outline: none;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .note-category-select:focus {
            border-color: #667eea;
            background: rgba(255, 255, 255, 0.15);
          }

          .note-category-select option {
            background: #1a1a2e;
            color: white;
          }

          .note-content-editor {
            position: relative;
            margin-bottom: 1rem;
          }

          .note-content-input {
            width: 100%;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            font-size: 1rem;
            line-height: 1.5;
            resize: vertical;
            outline: none;
            transition: all 0.3s ease;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          }

          .note-content-input:focus {
            border-color: #667eea;
            background: rgba(255, 255, 255, 0.1);
          }

          .note-content-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
          }

          .content-info {
            position: absolute;
            bottom: 0.5rem;
            right: 0.5rem;
            pointer-events: none;
          }

          .char-count {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.5);
            background: rgba(0, 0, 0, 0.3);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
          }

          .note-actions {
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
          }

          .btn-cancel, .btn-save {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-cancel {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .btn-cancel:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
          }

          .btn-save {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .btn-save:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .btn-cancel:disabled, .btn-save:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="secure-note">
      <div className="note-preview" onClick={() => setShowContent(!showContent)}>
        <div className="note-header">
          <div className="note-title-row">
            <span className="note-category" style={{ color: getCategoryColor(category) }}>
              {getCategoryIcon(category)} {category}
            </span>
            <span className="note-date">{formatDate(note.updatedAt)}</span>
          </div>
          <h3 className="note-title">{title}</h3>
        </div>

        <div className="note-preview-content">
          {content.length > 100 ? `${content.substring(0, 100)}...` : content}
        </div>

        <div className="note-status">
          {showContent ? '👁️ Ascunde' : '👁️ Afișează'} conținutul
        </div>
      </div>

      {showContent && (
        <div className="note-full-content">
          <div className="content-text">
            {content.split('\n').map((line, index) => (
              <div key={index} className="content-line">
                {line || <br />}
              </div>
            ))}
          </div>
          
          <div className="note-actions">
            <button
              className="btn-edit"
              onClick={startEditing}
            >
              ✏️ Editează
            </button>
            <button
              className="btn-delete"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Se șterge...' : showDeleteConfirm ? '🗑️ Confirmă ștergerea' : '🗑️ Șterge'}
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="delete-warning">
              <span>⚠️ Sunteți sigur? Această acțiune este ireversibilă.</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .secure-note {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .secure-note:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .note-preview {
          padding: 1.5rem;
          cursor: pointer;
          user-select: none;
        }

        .note-header {
          margin-bottom: 1rem;
        }

        .note-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .note-category {
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .note-date {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .note-title {
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
          line-height: 1.4;
        }

        .note-preview-content {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }

        .note-status {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          font-style: italic;
          text-align: center;
        }

        .note-full-content {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.2);
        }

        .content-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .content-line {
          min-height: 1.2em;
        }

        .note-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-edit, .btn-delete {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-edit {
          background: rgba(102, 126, 234, 0.2);
          color: #667eea;
          border: 1px solid rgba(102, 126, 234, 0.4);
        }

        .btn-edit:hover {
          background: rgba(102, 126, 234, 0.3);
          transform: translateY(-1px);
        }

        .btn-delete {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        .btn-delete:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.3);
          transform: translateY(-1px);
        }

        .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-warning {
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #fca5a5;
          font-size: 0.85rem;
          text-align: center;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .secure-note {
            margin-bottom: 0.75rem;
          }

          .note-preview, .note-full-content {
            padding: 1rem;
          }

          .note-title {
            font-size: 1.1rem;
          }

          .note-actions {
            flex-direction: column;
            gap: 0.5rem;
          }

          .btn-edit, .btn-delete {
            width: 100%;
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SecureNote;
