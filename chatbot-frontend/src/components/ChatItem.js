import React, { useState } from 'react';
import { theme } from '../theme';

function ChatItem({ chat, isActive, onSelect, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        cursor: 'pointer',
        backgroundColor: isActive 
          ? theme.colors.background.hover 
          : isHovered 
            ? theme.colors.background.hover 
            : 'transparent',
        borderRadius: theme.borderRadius.md,
        margin: `0 ${theme.spacing.sm}`,
        marginBottom: theme.spacing.xs,
        transition: `all ${theme.transitions.fast}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
        border: isActive ? `1px solid ${theme.colors.border.active}` : '1px solid transparent',
      }}
    >
      <div style={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
      }}>
        <span style={{
          fontSize: theme.fontSize.lg,
          flexShrink: 0,
        }}>
          💬
        </span>
        <span style={{
          fontSize: theme.fontSize.md,
          color: theme.colors.text.primary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {chat.title}
        </span>
      </div>
      
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat.id);
          }}
          style={{
            padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
            backgroundColor: 'transparent',
            color: theme.colors.text.tertiary,
            border: 'none',
            borderRadius: theme.borderRadius.sm,
            cursor: 'pointer',
            fontSize: theme.fontSize.md,
            transition: `all ${theme.transitions.fast}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.accent.danger;
            e.currentTarget.style.color = theme.colors.text.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = theme.colors.text.tertiary;
          }}
        >
          🗑️
        </button>
      )}
    </div>
  );
}

export default ChatItem;
