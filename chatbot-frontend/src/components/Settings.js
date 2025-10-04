import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

function Settings({ isOpen, onClose }) {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [useOpenAI, setUseOpenAI] = useState(false);

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.lg,
      width: '90%',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: theme.shadows.lg,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottom: `1px solid ${theme.colors.border.primary}`,
    },
    title: {
      margin: 0,
      fontSize: '1.5rem',
      color: theme.colors.text.primary,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '2rem',
      color: theme.colors.text.secondary,
      cursor: 'pointer',
      padding: 0,
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: '1.1rem',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      cursor: 'pointer',
    },
    checkbox: {
      marginRight: theme.spacing.sm,
      width: '18px',
      height: '18px',
      cursor: 'pointer',
    },
    checkboxText: {
      color: theme.colors.text.primary,
      fontSize: '0.95rem',
    },
    inputGroup: {
      marginBottom: theme.spacing.md,
    },
    label: {
      display: 'block',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.background.primary,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: theme.borderRadius.md,
      color: theme.colors.text.primary,
      fontSize: '0.95rem',
    },
    select: {
      width: '100%',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.background.primary,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: theme.borderRadius.md,
      color: theme.colors.text.primary,
      fontSize: '0.95rem',
      cursor: 'pointer',
    },
    hint: {
      marginTop: theme.spacing.xs,
      fontSize: '0.85rem',
      color: theme.colors.text.secondary,
    },
    link: {
      color: theme.colors.accent.primary,
      textDecoration: 'none',
    },
    info: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.md,
      color: theme.colors.text.secondary,
      fontSize: '0.9rem',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    clearButton: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      backgroundColor: 'transparent',
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: theme.borderRadius.md,
      color: theme.colors.text.primary,
      cursor: 'pointer',
      fontSize: '0.95rem',
      transition: theme.transitions.fast,
    },
    saveButton: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      backgroundColor: theme.colors.accent.primary,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      color: '#FFFFFF',
      cursor: 'pointer',
      fontSize: '0.95rem',
      flex: 1,
      transition: theme.transitions.fast,
    },
  };

  useEffect(() => {
    // Load settings from localStorage
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    const savedModel = localStorage.getItem('openai_model') || 'gpt-3.5-turbo';
    const savedUseOpenAI = localStorage.getItem('use_openai') === 'true';
    
    setApiKey(savedApiKey);
    setModel(savedModel);
    setUseOpenAI(savedUseOpenAI);
  }, []);

  const handleSave = () => {
    if (useOpenAI) {
      localStorage.setItem('openai_api_key', apiKey);
      localStorage.setItem('openai_model', model);
      localStorage.setItem('use_openai', 'true');
    } else {
      localStorage.setItem('use_openai', 'false');
    }
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    localStorage.removeItem('openai_model');
    localStorage.removeItem('use_openai');
    setApiKey('');
    setModel('gpt-3.5-turbo');
    setUseOpenAI(false);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Settings</h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div style={styles.content}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>AI Model</h3>
            
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={useOpenAI}
                onChange={(e) => setUseOpenAI(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>Use OpenAI (requires API key)</span>
            </label>

            {useOpenAI ? (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>OpenAI API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    style={styles.input}
                  />
                  <p style={styles.hint}>
                    Get your API key from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.link}
                    >
                      platform.openai.com
                    </a>
                  </p>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={styles.select}
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast, $0.002/req)</option>
                    <option value="gpt-4">GPT-4 (Best quality, $0.03/req)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo (Balanced, $0.01/req)</option>
                  </select>
                </div>
              </>
            ) : (
              <p style={styles.info}>
                Using free DialoGPT model. Enable OpenAI for better responses.
              </p>
            )}
          </div>

          <div style={styles.footer}>
            <button style={styles.clearButton} onClick={handleClear}>
              Clear Settings
            </button>
            <button style={styles.saveButton} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
