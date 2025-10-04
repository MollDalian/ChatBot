import React, { forwardRef, useState } from 'react';
import { useTheme } from './ThemeContext';

const MessageInput = forwardRef(({ onSend }, ref) => {
  const { theme } = useTheme();
  const [value, setValue] = useState('');

  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      padding: theme.spacing.lg,
      borderTop: `1px solid ${theme.colors.border.primary}`,
      backgroundColor: theme.colors.background.secondary,
    }}>
      <div style={{
        display: 'flex',
        gap: theme.spacing.md,
        alignItems: 'flex-end',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          rows="1"
          style={{
            flex: 1,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            backgroundColor: theme.colors.background.input,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.secondary}`,
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.fontSize.base,
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            minHeight: '48px',
            maxHeight: '200px',
            lineHeight: '1.5',
            transition: `all ${theme.transitions.fast}`,
          }}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.accent.primary;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.border.secondary;
          }}
        />
        
        <button
          onClick={handleSend}
          disabled={!value.trim()}
          style={{
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            backgroundColor: value.trim() 
              ? theme.colors.accent.primary 
              : theme.colors.background.hover,
            color: value.trim() 
              ? theme.colors.text.primary 
              : theme.colors.text.tertiary,
            border: 'none',
            borderRadius: theme.borderRadius.lg,
            cursor: value.trim() ? 'pointer' : 'not-allowed',
            fontSize: theme.fontSize.lg,
            fontWeight: '600',
            height: '48px',
            minWidth: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `all ${theme.transitions.fast}`,
          }}
          onMouseEnter={(e) => {
            if (value.trim()) {
              e.currentTarget.style.backgroundColor = theme.colors.accent.hover;
            }
          }}
          onMouseLeave={(e) => {
            if (value.trim()) {
              e.currentTarget.style.backgroundColor = theme.colors.accent.primary;
            }
          }}
        >
          ➤
        </button>
      </div>
      
      <div style={{
        marginTop: theme.spacing.xs,
        fontSize: theme.fontSize.xs,
        color: theme.colors.text.muted,
        textAlign: 'center',
      }}>
        Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
});

export default MessageInput;
