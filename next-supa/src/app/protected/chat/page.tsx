"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Hash, Smile, Paperclip, MoreVertical, Search, Users, Pin, Reply, Plus, X, Settings, PinOff, Menu } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen?: Date;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Message {
  id: string;
  user: User;
  content: string;
  timestamp: Date;
  reactions: Reaction[];
  threadCount?: number;
  isPinned?: boolean;
  pinnedBy?: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  unreadCount?: number;
  isPrivate?: boolean;
}

interface TeamChannelInterfaceProps {
  userEmail: string;
  userName: string;
  userAvatar?: string;
}

const API_URL = 'http://localhost:8000';

const TeamChannelInterface: React.FC<TeamChannelInterfaceProps> = ({ userEmail, userName, userAvatar }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [isPrivateChannel, setIsPrivateChannel] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (currentChannel) {
      pollingIntervalRef.current = setInterval(() => {
        loadMessages();
      }, 2000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [currentChannel]);

  useEffect(() => {
    loadChannels();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentChannel) {
      loadMessages();
    }
  }, [currentChannel]);

  const loadCurrentUser = async () => {
    try {
      const avatar = userAvatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${userEmail}`;

      const response = await fetch(`${API_URL}/users`);
      const users = await response.json();
      
      let user = users.find((u: any) => u.email === userEmail);
      
      if (!user) {
        const createResponse = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userName,
            email: userEmail,
            avatar: avatar
          })
        });
        user = await createResponse.json();
      }
      
      setCurrentUser({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        status: 'online'
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      setIsLoading(false);
    }
  };

  const loadChannels = async () => {
    try {
      const response = await fetch(`${API_URL}/channels`);
      const data = await response.json();
      
      if (data.length === 0) {
        await createDefaultChannel();
      } else {
        setChannels(data.map((ch: any) => ({
          id: ch.id,
          name: ch.name,
          description: ch.description || '',
          memberCount: 0,
          unreadCount: 0,
          isPrivate: ch.is_private
        })));
        setCurrentChannel(data[0]);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const loadMessages = async () => {
    if (!currentChannel) return;
    
    try {
      const response = await fetch(`${API_URL}/messages?channel_id=${currentChannel.id}`);
      const data = await response.json();
      
      setMessages(data.map((msg: any) => ({
        id: msg.id,
        user: msg.user,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || [],
        isPinned: msg.isPinned,
        pinnedBy: msg.pinnedBy
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createDefaultChannel = async () => {
    try {
      const response = await fetch(`${API_URL}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'general',
          description: 'Team-wide announcements',
          is_private: false
        })
      });
      const channel = await response.json();
      const newChannel = {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        memberCount: 0,
        unreadCount: 0,
        isPrivate: false
      };
      setChannels([newChannel]);
      setCurrentChannel(newChannel);
    } catch (error) {
      console.error('Error creating default channel:', error);
    }
  };

  const handleSendMessage = async () => {
    const messageContent = currentMessage.trim();
    if (!messageContent || !currentUser || !currentChannel) return;

    const tempId = uuidv4();
    const optimisticMessage: Message = {
      id: tempId,
      user: currentUser,
      content: messageContent,
      timestamp: new Date(),
      reactions: []
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setCurrentMessage('');

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          channel_id: currentChannel.id,
          user_id: currentUser.id
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const savedMessage = await response.json();
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId ? { ...msg, id: savedMessage.id } : msg
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
          description: newChannelDescription,
          is_private: isPrivateChannel
        })
      });

      if (!response.ok) throw new Error('Failed to create channel');

      const channel = await response.json();
      const newChannel: Channel = {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        memberCount: 1,
        unreadCount: 0,
        isPrivate: channel.is_private
      };

      setChannels(prev => [...prev, newChannel]);
      setIsCreateChannelOpen(false);
      setNewChannelName('');
      setNewChannelDescription('');
      setIsPrivateChannel(false);
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel');
    }
  };

  const togglePinMessage = async (messageId: string) => {
    if (!currentUser) return;
    
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const newPinStatus = !message.isPinned;

    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, isPinned: newPinStatus, pinnedBy: newPinStatus ? currentUser.name : undefined }
        : msg
    ));

    try {
      await fetch(`${API_URL}/messages/${messageId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_pinned: newPinStatus,
          user_id: currentUser.id
        })
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isPinned: !newPinStatus }
          : msg
      ));
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;

    try {
      await fetch(`${API_URL}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          user_id: currentUser.id,
          emoji
        })
      });

      loadMessages();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
    
    setShowEmojiPicker(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const emojis = ['👍', '❤️', '😂', '🎉', '🚀', '👀', '✅', '🔥'];
  const pinnedMessages = messages.filter(m => m.isPinned);

  if (isLoading || !currentUser || !currentChannel) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-stone-50 text-stone-800 flex-col md:flex-row overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden p-3 bg-white border-b border-stone-200 text-stone-800 flex items-center justify-between shrink-0"
      >
        <Menu className="w-5 h-5" />
        <span className="text-sm font-semibold ml-2 truncate">{currentChannel.name}</span>
      </button>

      {/* Sidebar */}
      <div className={`fixed md:relative z-50 md:z-0 inset-0 md:inset-auto w-64 bg-white border-r border-stone-300 flex flex-col h-full transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-3 md:p-4 border-b border-stone-200 flex items-center justify-between shrink-0">
          <h1 className="text-lg md:text-xl font-bold text-stone-800">Team Workspace</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-stone-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto min-w-0">
          <div className="p-2 md:p-3">
            <div className="flex items-center justify-between px-2 py-1 text-xs md:text-sm text-stone-500 mb-2">
              <span className="font-semibold">Channels</span>
              <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                <DialogTrigger asChild>
                  <button className="hover:text-stone-800 p-1">
                    <Plus className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] sm:w-full">
                  <DialogHeader>
                    <DialogTitle>Create New Channel</DialogTitle>
                    <DialogDescription>Create a new channel for your team</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="channel-name">Channel Name</Label>
                      <Input
                        id="channel-name"
                        placeholder="e.g. project-alpha"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channel-description">Description</Label>
                      <Input
                        id="channel-description"
                        placeholder="What's this channel about?"
                        value={newChannelDescription}
                        onChange={(e) => setNewChannelDescription(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private-channel"
                        checked={isPrivateChannel}
                        onChange={(e) => setIsPrivateChannel(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="private-channel" className="text-sm">Make private</Label>
                    </div>
                  </div>
                  <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setIsCreateChannelOpen(false)} className="text-sm">Cancel</Button>
                    <Button onClick={handleCreateChannel} className="bg-green-600 hover:bg-green-700 text-sm">Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-0.5">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => {
                    setCurrentChannel(channel);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center justify-between px-2 py-2 md:py-1.5 rounded cursor-pointer text-xs md:text-sm transition-colors ${
                    currentChannel.id === channel.id ? 'bg-green-100 text-green-700' : 'hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <Hash className="w-3 h-3 md:w-4 md:h-4 mr-2 shrink-0" />
                    <span className="truncate">{channel.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed md:hidden inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="hidden md:flex h-12 md:h-16 border-b border-stone-200 items-center justify-between px-3 md:px-4 bg-white shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <Hash className="w-4 h-4 md:w-5 md:h-5 text-stone-500 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-bold text-sm md:text-lg text-stone-800 truncate">{currentChannel.name}</h2>
              <p className="text-xs text-stone-500 truncate">{currentChannel.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-3 shrink-0">
            <button 
              onClick={() => setShowPinnedMessages(!showPinnedMessages)}
              className="p-1 md:p-2 hover:bg-stone-100 rounded text-stone-600 relative"
            >
              <Pin className="w-4 h-4 md:w-5 md:h-5" />
              {pinnedMessages.length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-xs h-4 min-w-4 px-1 flex items-center justify-center">
                  {pinnedMessages.length}
                </Badge>
              )}
            </button>
            <button className="p-1 md:p-2 hover:bg-stone-100 rounded text-stone-600">
              <Users className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button className="p-1 md:p-2 hover:bg-stone-100 rounded text-stone-600">
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button className="p-1 md:p-2 hover:bg-stone-100 rounded text-stone-600">
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Pinned Messages Panel */}
        {showPinnedMessages && pinnedMessages.length > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-2 md:p-3 shrink-0">
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="text-xs md:text-sm font-semibold text-yellow-800 flex items-center gap-1 shrink-0">
                <Pin className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Pinned Messages</span>
                <span className="sm:hidden">Pinned</span>
              </h3>
              <button onClick={() => setShowPinnedMessages(false)} className="text-yellow-600 hover:text-yellow-800 shrink-0">
                <X className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
            <div className="space-y-1 overflow-x-auto">
              {pinnedMessages.map(msg => (
                <div key={msg.id} className="text-xs md:text-sm text-yellow-900 bg-white rounded p-1.5 md:p-2 whitespace-nowrap md:whitespace-normal">
                  <span className="font-medium">{msg.user.name}:</span> <span className="truncate inline">{msg.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-stone-50 min-w-0">
          {messages.length === 0 ? (
            <div className="text-center text-stone-500 mt-4 md:mt-8 text-sm md:text-base">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`group hover:bg-white -mx-2 md:-mx-4 px-2 md:px-4 py-1.5 md:py-2 border-l-4 transition-colors ${
                  message.isPinned ? 'border-yellow-500 bg-yellow-50/50' : 'border-transparent'
                }`}
              >
                <div className="flex items-start space-x-2 md:space-x-3 min-w-0">
                  <div className="shrink-0 relative">
                    <img 
                      src={message.user.avatar} 
                      alt={message.user.name}
                      className="w-7 h-7 md:w-10 md:h-10 rounded"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-stone-50 bg-green-500"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-1 md:space-x-2 flex-wrap gap-1">
                      <span className="font-semibold text-stone-800 text-xs md:text-base">{message.user.name}</span>
                      <span className="text-xs text-stone-500">{formatTime(message.timestamp)}</span>
                      {message.isPinned && (
                        <span className="flex items-center text-xs text-yellow-600">
                          <Pin className="w-2 h-2 md:w-3 md:h-3 mr-1" />
                          Pinned
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5 md:mt-1 text-stone-700 text-xs md:text-base break-words">{message.content}</div>

                    {message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 md:mt-2">
                        {message.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            onClick={() => addReaction(message.id, reaction.emoji)}
                            className={`inline-flex items-center space-x-0.5 md:space-x-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs border transition-colors ${
                              reaction.users.includes(currentUser.id)
                                ? 'bg-green-100 border-green-500 text-green-700'
                                : 'bg-stone-100 border-stone-300 hover:border-stone-400'
                            }`}
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-xs">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-0.5 md:space-x-1 shrink-0">
                    <div className="relative">
                      <button
                        onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                        className="p-0.5 md:p-1 hover:bg-stone-100 rounded text-stone-600"
                      >
                        <Smile className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                      {showEmojiPicker === message.id && (
                        <div className="absolute right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg p-1 md:p-2 flex flex-wrap gap-1 z-10 w-32 md:w-auto">
                          {emojis.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => addReaction(message.id, emoji)}
                              className="hover:bg-stone-100 rounded p-1 text-base md:text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => togglePinMessage(message.id)}
                      className="p-0.5 md:p-1 hover:bg-stone-100 rounded text-stone-600"
                      title={message.isPinned ? "Unpin message" : "Pin message"}
                    >
                      {message.isPinned ? <PinOff className="w-3 h-3 md:w-4 md:h-4" /> : <Pin className="w-3 h-3 md:w-4 md:h-4" />}
                    </button>
                    <button className="p-0.5 md:p-1 hover:bg-stone-100 rounded text-stone-600 hidden sm:block">
                      <Reply className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    <button className="p-0.5 md:p-1 hover:bg-stone-100 rounded text-stone-600">
                      <MoreVertical className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-2 md:p-4 border-t border-stone-200 bg-white shrink-0">
          <div className="bg-white rounded-lg border border-stone-300 focus-within:border-green-500">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${currentChannel.name}`}
              className="w-full bg-transparent px-2 md:px-4 py-2 md:py-3 text-xs md:text-base text-stone-800 placeholder-stone-400 resize-none focus:outline-none"
              rows={2}
            />
            <div className="flex items-center justify-between px-2 md:px-3 py-1.5 md:py-2 border-t border-stone-200 gap-2">
              <div className="flex items-center space-x-1 md:space-x-2">
                <button className="p-1 md:p-1.5 hover:bg-stone-100 rounded text-stone-500">
                  <Paperclip className="w-3 h-3 md:w-5 md:h-5" />
                </button>
                <button className="p-1 md:p-1.5 hover:bg-stone-100 rounded text-stone-500">
                  <Smile className="w-3 h-3 md:w-5 md:h-5" />
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white px-2 md:px-4 py-1 md:py-1.5 rounded flex items-center space-x-0.5 md:space-x-1 font-medium transition-colors text-xs md:text-base"
              >
                <Send className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamChannelInterface;