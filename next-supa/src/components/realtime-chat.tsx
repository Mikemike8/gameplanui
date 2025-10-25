'use client'

import { useState, useMemo, useCallback } from 'react'
import { ChatMessageItem } from './chat-message'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useChatScroll } from '@/hooks/use-chat-scroll'
import { useRealtimeChat, ChatMessage } from '@/hooks/use-realtime-chat'

interface RealtimeChatProps {
  roomName: string
  username: string
}

export const RealtimeChat = ({ roomName, username }: RealtimeChatProps) => {
  const { messages, sendMessage, isConnected } = useRealtimeChat({ roomName, username })
  const { containerRef, scrollToBottom } = useChatScroll()
  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!newMessage.trim() || !isConnected) return
      sendMessage(newMessage)
      setNewMessage('')
    },
    [newMessage, sendMessage, isConnected]
  )

  const allMessages = useMemo(() => messages, [messages])

  return (
    <div className="flex flex-col h-full w-full">
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.map((msg, idx) => {
          const prevMsg = idx > 0 ? allMessages[idx - 1] : null
          const showHeader = !prevMsg || prevMsg.user.name !== msg.user.name
          return (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              isOwnMessage={msg.user.name === username}
              showHeader={showHeader}
            />
          )
        })}
      </div>

      <form onSubmit={handleSendMessage} className="flex w-full gap-2 border-t border-border p-4">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <Button type="submit" disabled={!isConnected || !newMessage.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}
