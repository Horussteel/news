import { useState, useEffect } from 'react';
import dataExportService from '../lib/dataExportService';

const DataExportManager = () => {
  const [activeTab, setActiveTab] = useState('export');
  const [exportHistory, setExportHistory] = useState([]);
  const [importHistory, setImportHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [customFilename, setCustomFilename] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [importMessage_type, setImportMessage_type] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setExportHistory(dataExportService.getExportHistory());
    setImportHistory(dataExportService.getImportHistory());
    setStatistics(dataExportService.getStatistics());
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = dataExportService.exportData(
        selectedFormat,
        customFilename || null
      );
      
      if (result.success) {
        setImportMessage(`✅ Exportat cu succes: ${result.filename} (${dataExportService.formatFileSize(result.size)})`);
        setImportMessage_type('success');
        loadData();
      } else {
        setImportMessage(`❌ Eroare la export: ${result.error}`);
        setImportMessage_type('error');
      }
    } catch (error) {
      setImportMessage(`❌ Eroare la export: ${error.message}`);
      setImportMessage_type('error');
    } finally {
      setIsExporting(false);
      setTimeout(() => setImportMessage(''), 5000);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage('');

    try {
      const result = await dataExportService.importData(file);
      
      if (result.success) {
        const importedItems = Object.entries(result.imported)
          .map(([key, count]) => `${key}: ${count}`)
          .join(', ');
        
        setImportMessage(`✅ Importat cu succes: ${importedItems}`);
        setImportMessage_type('success');
        loadData();
        
        // Refresh page data after successful import
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setImportMessage(`❌ Eroare la import: ${result.error}`);
        setImportMessage_type('error');
      }
    } catch (error) {
      setImportMessage(`❌ Eroare la import: ${error.message}`);
      setImportMessage_type('error');
    } finally {
      setIsImporting(false);
      setTimeout(() => setImportMessage(''), 5000);
      // Reset file input
      event.target.value = '';
    }
  };

  const clearExportHistory = () => {
    if (confirm('Ești sigur că vrei să ștergi istoricul de exporturi?')) {
      dataExportService.clearExportHistory();
      loadData();
    }
  };

  const clearImportHistory = () => {
    if (confirm('Ești sigur că vrei să ștergi istoricul de importuri?')) {
      dataExportService.clearImportHistory();
      loadData();
    }
  };

  const getDataTypesCount = (dataTypes) => {
    return dataTypes.length;
  };

  const formatDataTypes = (dataTypes) => {
    const typeMap = {
      bookmarks: 'Semne de carte',
      history: 'Istoric',
      preferences: 'Preferințe',
      todos: ' sarcini',
      todoCategories: 'Categorii sarcini',
      todoTags: 'Tag-uri sarcini',
      books: 'Cărți',
      readingSessions: 'Sesiuni citit',
      readingNotes: 'Note citit',
      readingGoals: 'Obiective citit',
      habits: 'Obiceiuri',
      habitCompletions: 'Completări obiceiuri',
      pomodoroSettings: 'Setări Pomodoro',
      pomodoroStats: 'Statistici Pomodoro'
    };

    return dataTypes.map(type => typeMap[type] || type).join(', ');
  };

  return (
    <div className="data-export-manager">
      <div className="export-header">
        <h2>📦 Export/Import Date</h2>
        <p>Salvează-ți toate datele aplicației și importă-le când vrei</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <div className="stat-icon">📤</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.totalExports}</div>
              <div className="stat-label">Exporturi Totale</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📥</div>
            <div className="stat-content">
              <div className="stat-value">{statistics.totalImports}</div>
              <div className="stat-label">Importuri Totale</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💾</div>
            <div className="stat-content">
              <div className="stat-value">{dataExportService.formatFileSize(statistics.currentDataSize)}</div>
              <div className="stat-label">Dimensiune Date Curente</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{getDataTypesCount(statistics.dataTypes)}</div>
              <div className="stat-label">Tipuri de Date</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          📤 Export
        </button>
        <button 
          className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          📥 Import
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 Istoric
        </button>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="tab-content">
          <div className="export-section">
            <h3>📤 Exportă Datele</h3>
            <p>Alege formatul și numele fișierului pentru export</p>
            
            <div className="export-options">
              <div className="form-group">
                <label>Format Fișier:</label>
                <div className="format-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="json"
                      checked={selectedFormat === 'json'}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                    />
                    <span>JSON (Recomandat)</span>
                    <small>Format complet cu toate datele</small>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="csv"
                      checked={selectedFormat === 'csv'}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                    />
                    <span>CSV</span>
                    <small>Format compatibil Excel/Google Sheets</small>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Nume Fișier (opțional):</label>
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="lasă gol pentru nume automat"
                  className="filename-input"
                />
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="export-button"
              >
                {isExporting ? '⏳ Se exportează...' : '📤 Exportă Datele'}
              </button>
            </div>

            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="advanced-toggle"
            >
              {showAdvancedOptions ? '🔽 Ascunde' : '🔶'} Opțiuni Avansate
            </button>

            {showAdvancedOptions && (
              <div className="advanced-options">
                <h4>Informații Export</h4>
                {statistics && (
                  <div className="export-info">
                    <p><strong>Tipuri de date incluse:</strong></p>
                    <p>{formatDataTypes(statistics.dataTypes)}</p>
                    <p><strong>Dimensiune estimată:</strong> {dataExportService.formatFileSize(statistics.currentDataSize)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="tab-content">
          <div className="import-section">
            <h3>📥 Importă Date</h3>
            <p>Încarcă un fișier de backup pentru a-ți restaura datele</p>
            
            <div className="import-options">
              <div className="file-upload">
                <label htmlFor="file-input" className="file-input-label">
                  📁 Alege Fișierul
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept=".json,.csv"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="file-input"
                />
                <small>Formate suportate: JSON, CSV</small>
              </div>

              <div className="import-warnings">
                <div className="warning-box">
                  <strong>⚠️ Atenție:</strong>
                  <ul>
                    <li>Importul va suprascrie datele existente</li>
                    <li>Recomand să faci un backup înainte de import</li>
                    <li>Verifică fișierul pentru a te asigura că este corect</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="tab-content">
          <div className="history-section">
            <div className="history-header">
              <h3>📋 Istoric Export/Import</h3>
              <div className="history-actions">
                <button onClick={clearExportHistory} className="clear-button">
                  🗑️ Șterge Istoric Export
                </button>
                <button onClick={clearImportHistory} className="clear-button">
                  🗑️ Șterge Istoric Import
                </button>
              </div>
            </div>

            <div className="history-grid">
              {/* Export History */}
              <div className="history-column">
                <h4>📤 Istoric Exporturi</h4>
                {exportHistory.length === 0 ? (
                  <p className="no-history">Nu există exporturi înregistrate</p>
                ) : (
                  <div className="history-list">
                    {exportHistory.map((item) => (
                      <div key={item.id} className="history-item export-item">
                        <div className="history-icon">📤</div>
                        <div className="history-content">
                          <div className="history-filename">{item.filename}</div>
                          <div className="history-details">
                            <span className="history-format">{item.format.toUpperCase()}</span>
                            <span className="history-size">{dataExportService.formatFileSize(item.size)}</span>
                            <span className="history-date">{dataExportService.formatDate(item.timestamp)}</span>
                          </div>
                          <div className="history-types">
                            {formatDataTypes(item.dataTypes)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Import History */}
              <div className="history-column">
                <h4>📥 Istoric Importuri</h4>
                {importHistory.length === 0 ? (
                  <p className="no-history">Nu există importuri înregistrate</p>
                ) : (
                  <div className="history-list">
                    {importHistory.map((item) => (
                      <div key={item.id} className="history-item import-item">
                        <div className="history-icon">📥</div>
                        <div className="history-content">
                          <div className="history-filename">{item.filename}</div>
                          <div className="history-details">
                            <span className="history-size">{dataExportService.formatFileSize(item.size)}</span>
                            <span className="history-date">{dataExportService.formatDate(item.timestamp)}</span>
                          </div>
                          <div className="history-result">
                            Importat: {Object.entries(item.result || {})
                              .map(([key, count]) => `${key}: ${count}`)
                              .join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {importMessage && (
        <div className={`message ${importMessage_type}`}>
          {importMessage}
        </div>
      )}

      <style jsx>{`
        .data-export-manager {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .export-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .export-header h2 {
          margin: 0 0 10px 0;
          color: var(--text-primary);
          font-size: 2rem;
        }

        .export-header p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .statistics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667EEA, #4C51BF);
          color: white;
          border-radius: 10px;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 5px;
        }

        .tab-navigation {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 10px;
        }

        .tab-button {
          background: transparent;
          border: none;
          padding: 12px 24px;
          border-radius: 8px 8px 0 0;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          background: var(--bg-secondary);
        }

        .tab-button.active {
          background: linear-gradient(135deg, #667EEA, #4C51BF);
          color: white;
        }

        .tab-content {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 30px;
        }

        .export-section h3,
        .import-section h3,
        .history-section h3 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
          font-size: 1.3rem;
        }

        .export-section p,
        .import-section p {
          margin: 0 0 25px 0;
          color: var(--text-secondary);
        }

        .export-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-group label {
          font-weight: 500;
          color: var(--text-primary);
        }

        .format-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .radio-option {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          padding: 15px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .radio-option:hover {
          border-color: #667EEA;
          background: var(--bg-primary);
        }

        .radio-option input[type="radio"] {
          margin: 0;
        }

        .radio-option span {
          font-weight: 500;
          color: var(--text-primary);
        }

        .radio-option small {
          display: block;
          color: var(--text-secondary);
          margin-top: 5px;
          font-size: 0.85rem;
        }

        .filename-input {
          padding: 12px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          font-size: 1rem;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .filename-input:focus {
          outline: none;
          border-color: #667EEA;
        }

        .export-button,
        .clear-button {
          background: linear-gradient(135deg, #667EEA, #4C51BF);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .export-button:hover:not(:disabled),
        .clear-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .export-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .clear-button {
          background: linear-gradient(135deg, #EF4444, #DC2626);
          font-size: 0.9rem;
          padding: 10px 20px;
        }

        .advanced-toggle {
          background: transparent;
          border: 2px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-secondary);
          margin-top: 20px;
          transition: all 0.3s ease;
        }

        .advanced-toggle:hover {
          border-color: #667EEA;
          color: #667EEA;
        }

        .advanced-options {
          margin-top: 20px;
          padding: 20px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }

        .advanced-options h4 {
          margin: 0 0 15px 0;
          color: var(--text-primary);
        }

        .export-info p {
          margin: 5px 0;
          color: var(--text-secondary);
        }

        .file-upload {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          padding: 40px;
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          background: var(--bg-primary);
        }

        .file-input-label {
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          padding: 15px 30px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .file-input-label:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .file-input {
          display: none;
        }

        .import-warnings {
          margin-top: 20px;
        }

        .warning-box {
          background: #FEF3C7;
          border: 1px solid #F59E0B;
          border-radius: 8px;
          padding: 20px;
          color: #92400E;
        }

        .warning-box strong {
          display: block;
          margin-bottom: 10px;
        }

        .warning-box ul {
          margin: 0;
          padding-left: 20px;
        }

        .warning-box li {
          margin-bottom: 5px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .history-actions {
          display: flex;
          gap: 10px;
        }

        .history-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }

        .history-column h4 {
          margin: 0 0 20px 0;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .no-history {
          color: var(--text-secondary);
          font-style: italic;
          text-align: center;
          padding: 40px;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-height: 400px;
          overflow-y: auto;
        }

        .history-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .history-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .history-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .export-item .history-icon {
          background: #10B981;
          color: white;
        }

        .import-item .history-icon {
          background: #3B82F6;
          color: white;
        }

        .history-content {
          flex: 1;
        }

        .history-filename {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 5px;
        }

        .history-details {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }

        .history-format,
        .history-size,
        .history-date {
          font-size: 0.8rem;
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
        }

        .history-types,
        .history-result {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.3;
        }

        .message {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          font-weight: 500;
          z-index: 1000;
          animation: slideIn 0.3s ease;
        }

        .message.success {
          background: #10B981;
          color: white;
        }

        .message.error {
          background: #EF4444;
          color: white;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .data-export-manager {
            padding: 15px;
          }

          .statistics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }

          .tab-navigation {
            flex-wrap: wrap;
          }

          .tab-button {
            flex: 1;
            min-width: 100px;
          }

          .history-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .history-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .history-actions {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .statistics-grid {
            grid-template-columns: 1fr;
          }

          .export-section,
          .import-section {
            padding: 20px;
          }

          .history-details {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default DataExportManager;
