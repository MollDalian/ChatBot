import React from 'react';
import { theme } from '../theme';

function Message({ user, message, timestamp }) {
  const isBot = user === 'bot';
  
  const formatTimestamp = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getAvatar = () => {
    return isBot ? '🤖' : '👤';
  };

  return (
    <div style={{
      display: 'flex',
      gap: theme.spacing.md,
      padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      maxWidth: '100%',
      backgroundColor: isBot ? theme.colors.background.messageBot : 'transparent',
    }}>
      <div style={{
        fontSize: theme.fontSize.xl,
        flexShrink: 0,
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isBot ? theme.colors.background.secondary : theme.colors.accent.primary,
        borderRadius: theme.borderRadius.md,
      }}>
        {getAvatar()}
      </div>
      
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xs,
        minWidth: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}>
          <span style={{
            fontSize: theme.fontSize.md,
            fontWeight: '600',
            color: theme.colors.text.primary,
          }}>
            {isBot ? 'AI Assistant' : 'You'}
          </span>
          {timestamp && (
            <span style={{
              fontSize: theme.fontSize.xs,
              color: theme.colors.text.tertiary,
            }}>
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>
        
        <div style={{
          fontSize: theme.fontSize.base,
          lineHeight: '1.6',
          color: theme.colors.text.primary,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {message}
        </div>
      </div>
    </div>
  );
}

export default Message;
