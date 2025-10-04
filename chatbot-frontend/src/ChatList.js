import React from 'react';
import ChatItem from './components/ChatItem';
import { theme } from './theme';

function ChatList({ chats, onSelectChat, onDeleteChat, currentChatId }) {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.colors.background.sidebar,
      overflowY: 'auto',
    }}>
      <div style={{
        padding: theme.spacing.lg,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
      }}>
        <h3 style={{
          margin: 0,
          fontSize: theme.fontSize.lg,
          fontWeight: '600',
          color: theme.colors.text.primary,
        }}>
          Chat History
        </h3>
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: `${theme.spacing.sm} 0`,
      }}>
        {chats.length === 0 ? (
          <div style={{
            padding: theme.spacing.xl,
            textAlign: 'center',
            color: theme.colors.text.tertiary,
            fontSize: theme.fontSize.sm,
          }}>
            No chats yet
          </div>
        ) : (
          chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === currentChatId}
              onSelect={() => onSelectChat(chat.id)}
              onDelete={onDeleteChat}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ChatList;
