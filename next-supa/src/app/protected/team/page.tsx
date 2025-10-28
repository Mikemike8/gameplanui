"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Bell,
  Check,
  X,
  Clock,
  MapPin,
  Users,
  MessageSquare,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Info,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';

// Helper functions
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const formatDistanceToNow = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

// 🗄️ DATABASE SCHEMA for MySQL:
/*
CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('event_invite', 'event_update', 'event_reminder', 'team_invite', 'message_mention', 'rsvp_update') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_id VARCHAR(36),
  related_type VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  action_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read),
  INDEX idx_created_at (created_at)
);
*/

interface Notification {
  id: string;
  type: 'event_invite' | 'event_update' | 'event_reminder' | 'team_invite' | 'message_mention' | 'rsvp_update';
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: 'event' | 'team' | 'message';
  isRead: boolean;
  actionRequired: boolean;
  createdAt: Date;
  metadata?: {
    eventName?: string;
    eventDate?: Date;
    teamName?: string;
    userName?: string;
    userAvatar?: string;
  };
}

interface EventSummary {
  total: number;
  attending: number;
  pending: number;
  declined: number;
  upcomingToday: number;
  upcomingWeek: number;
}

const NotificationsDashboard = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'events'>('all');
  
  // 🗄️ Mock data - would be fetched from MySQL via API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'event_invite',
      title: 'New Event Invitation',
      message: 'You\'ve been invited to Tech Innovators Summit 2025',
      relatedId: 'event1',
      relatedType: 'event',
      isRead: false,
      actionRequired: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      metadata: {
        eventName: 'Tech Innovators Summit 2025',
        eventDate: new Date(2025, 9, 25, 10, 0),
        userName: 'Sarah Johnson',
        userAvatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah'
      }
    },
    {
      id: '2',
      type: 'event_reminder',
      title: 'Event Starting Soon',
      message: 'Team Sprint Planning starts in 1 hour',
      relatedId: 'event2',
      relatedType: 'event',
      isRead: false,
      actionRequired: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      metadata: {
        eventName: 'Team Sprint Planning',
        eventDate: new Date(2025, 9, 28, 9, 0)
      }
    },
    {
      id: '3',
      type: 'rsvp_update',
      title: 'RSVP Update',
      message: 'Mike Chen is now attending Q4 Review Meeting',
      relatedId: 'event3',
      relatedType: 'event',
      isRead: true,
      actionRequired: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      metadata: {
        eventName: 'Q4 Review Meeting',
        userName: 'Mike Chen',
        userAvatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Mike'
      }
    },
    {
      id: '4',
      type: 'event_update',
      title: 'Event Updated',
      message: 'The location for Workshop: Design Thinking has been changed',
      relatedId: 'event4',
      relatedType: 'event',
      isRead: true,
      actionRequired: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      metadata: {
        eventName: 'Workshop: Design Thinking'
      }
    }
  ]);

  const [eventSummary] = useState<EventSummary>({
    total: 12,
    attending: 8,
    pending: 3,
    declined: 1,
    upcomingToday: 2,
    upcomingWeek: 5
  });

  // 🗄️ API: Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    ));
  };

  // 🗄️ API: Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  // 🗄️ API: Delete notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(notif => notif.id !== notificationId));
  };

  // 🗄️ API: Handle RSVP action
  const handleRSVP = (notificationId: string, eventId: string, status: 'attending' | 'declined') => {
    markAsRead(notificationId);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'event_invite':
        return <Calendar className={`${iconClass} text-blue-600`} />;
      case 'event_reminder':
        return <Clock className={`${iconClass} text-orange-500`} />;
      case 'event_update':
        return <Info className={`${iconClass} text-purple-600`} />;
      case 'team_invite':
        return <UserPlus className={`${iconClass} text-green-600`} />;
      case 'rsvp_update':
        return <CheckCircle className={`${iconClass} text-teal-600`} />;
      case 'message_mention':
        return <MessageSquare className={`${iconClass} text-indigo-600`} />;
      default:
        return <Bell className={`${iconClass} text-gray-600`} />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread') return !notif.isRead;
    if (activeTab === 'events') return notif.relatedType === 'event';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Zoho-style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">Stay updated with your team activities</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="text-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="text-gray-600">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Zoho-style Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unread</p>
                <p className="text-2xl font-semibold text-gray-800 mt-2">{unreadCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Action Required</p>
                <p className="text-2xl font-semibold text-gray-800 mt-2">{actionRequiredCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Week</p>
                <p className="text-2xl font-semibold text-gray-800 mt-2">{eventSummary.upcomingWeek}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending RSVPs</p>
                <p className="text-2xl font-semibold text-gray-800 mt-2">{eventSummary.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Zoho-style Event Summary */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Your Events Overview</h2>
                <p className="text-sm text-gray-500 mt-1">Summary of your event participation</p>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                View Calendar
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-gray-700">{eventSummary.total}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">Total Events</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-green-700">{eventSummary.attending}</span>
                </div>
                <p className="text-xs text-green-600 font-medium">Attending</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-yellow-700">{eventSummary.pending}</span>
                </div>
                <p className="text-xs text-yellow-600 font-medium">Pending</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-red-700">{eventSummary.declined}</span>
                </div>
                <p className="text-xs text-red-600 font-medium">Declined</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <span className="text-xl font-bold text-blue-700">{eventSummary.upcomingToday}</span>
                </div>
                <p className="text-xs text-blue-600 font-medium">Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Zoho-style Notifications Panel */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Activity Feed</h2>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-blue-600 hover:text-blue-700">
                  <Check className="w-4 h-4 mr-2" />
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          {/* Zoho-style Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex px-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'unread'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'events'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                Events Only
              </button>
            </div>
          </div>

          {/* Notifications List - Zoho Style */}
          <div className="divide-y divide-gray-100">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">No notifications to display</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon Circle - Zoho Style */}
                    <div className="shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Avatar if available */}
                    {notification.metadata?.userAvatar && (
                      <Avatar className="w-9 h-9 border border-gray-200">
                        <AvatarImage src={notification.metadata.userAvatar} />
                        <AvatarFallback className="text-xs">
                          {notification.metadata.userName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm text-gray-800">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {/* Event metadata - Zoho compact style */}
                          {notification.metadata?.eventDate && (
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatDate(notification.metadata.eventDate)} • {formatTime(notification.metadata.eventDate)}
                              </span>
                            </div>
                          )}

                          {/* Action buttons - Zoho style */}
                          {notification.actionRequired && notification.type === 'event_invite' && (
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleRSVP(notification.id, notification.relatedId!, 'attending')}
                                className="bg-green-600 hover:bg-green-700 text-white h-8 px-4 text-xs"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRSVP(notification.id, notification.relatedId!, 'declined')}
                                className="h-8 px-4 text-xs"
                              >
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Time and actions */}
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {formatDistanceToNow(notification.createdAt)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsDashboard;