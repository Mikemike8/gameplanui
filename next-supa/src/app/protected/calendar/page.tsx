"use client";

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Check, 
  X,
  
} from 'lucide-react';
import { format, isSameDay, } from 'date-fns';

// 🗄️ DATABASE: This would come from MySQL
// Table: events
// - id, name, start_date, end_date, location, created_at
// Table: event_attendees  
// - id, event_id, user_id, rsvp_status (attending/declined/pending)
// Table: users
// - id, name, avatar, email

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: 'attending' | 'declined' | 'pending';
}

interface Event {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  location: string;
  attendees: TeamMember[];
  totalAttending: number;
  currentUserStatus: 'attending' | 'declined' | 'pending';
}

const TeamCalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  
  // 🗄️ Mock data - would be fetched from MySQL via API
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'Tech Innovators Summit 2025',
      startDate: new Date(2025, 9, 25, 10, 0),
      endDate: new Date(2025, 9, 25, 17, 0),
      location: 'San Francisco, CA',
      totalAttending: 12,
      currentUserStatus: 'pending',
      attendees: [
        { id: '1', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah', status: 'attending' },
        { id: '2', name: 'Mike Chen', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Mike', status: 'attending' },
        { id: '3', name: 'Emily Rodriguez', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Emily', status: 'attending' },
      ]
    },
    {
      id: '2',
      name: 'Team Sprint Planning',
      startDate: new Date(2025, 9, 28, 9, 0),
      endDate: new Date(2025, 9, 28, 11, 0),
      location: 'Virtual - Zoom',
      totalAttending: 8,
      currentUserStatus: 'attending',
      attendees: [
        { id: '1', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah', status: 'attending' },
        { id: '4', name: 'Alex Kim', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex', status: 'attending' },
      ]
    },
    {
      id: '3',
      name: 'Q4 Review Meeting',
      startDate: new Date(2025, 9, 30, 14, 0),
      endDate: new Date(2025, 9, 30, 16, 0),
      location: 'Conference Room B',
      totalAttending: 15,
      currentUserStatus: 'declined',
      attendees: [
        { id: '2', name: 'Mike Chen', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Mike', status: 'attending' },
        { id: '3', name: 'Emily Rodriguez', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Emily', status: 'attending' },
        { id: '5', name: 'David Park', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=David', status: 'attending' },
      ]
    },
    {
      id: '4',
      name: 'Workshop: Design Thinking',
      startDate: new Date(2025, 10, 5, 13, 0),
      endDate: new Date(2025, 10, 6, 17, 0),
      location: 'Innovation Lab',
      totalAttending: 20,
      currentUserStatus: 'pending',
      attendees: [
        { id: '1', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sarah', status: 'attending' },
        { id: '3', name: 'Emily Rodriguez', avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Emily', status: 'attending' },
      ]
    }
  ]);

  // 🗄️ API call to update RSVP status
  const handleRSVP = (eventId: string, status: 'attending' | 'declined') => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            currentUserStatus: status,
            totalAttending: status === 'attending' 
              ? event.totalAttending + (event.currentUserStatus === 'attending' ? 0 : 1)
              : event.totalAttending - (event.currentUserStatus === 'attending' ? 1 : 0)
          }
        : event
    ));

    // API call would be:
    // await fetch('/api/events/rsvp', {
    //   method: 'POST',
    //   body: JSON.stringify({ event_id: eventId, status })
    // });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(event.startDate, date) || 
      (date >= event.startDate && date <= event.endDate)
    );
  };

  const upcomingEvents = events
    .filter(event => event.startDate >= new Date())
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const eventsWithDates = events.map(event => event.startDate);

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{event.name}</CardTitle>
            <CardDescription className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {format(event.startDate, 'MMM dd, yyyy')}
                  {!isSameDay(event.startDate, event.endDate) && 
                    ` - ${format(event.endDate, 'MMM dd, yyyy')}`}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  {format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                <span>{event.totalAttending} attending</span>
              </div>
            </CardDescription>
          </div>
          
          {event.currentUserStatus === 'attending' && (
            <Badge className="bg-green-100 text-green-700">Attending</Badge>
          )}
          {event.currentUserStatus === 'declined' && (
            <Badge variant="secondary">Declined</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Team Members Attending:</p>
            <div className="flex -space-x-2">
              {event.attendees.slice(0, 5).map((member) => (
                <Avatar key={member.id} className="border-2 border-white">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {event.attendees.length > 5 && (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stone-200 border-2 border-white text-xs font-medium">
                  +{event.attendees.length - 5}
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-stone-500">
              {event.attendees.slice(0, 3).map(a => a.name).join(', ')}
              {event.attendees.length > 3 && ` and ${event.attendees.length - 3} more`}
            </div>
          </div>

          {event.currentUserStatus === 'pending' && (
            <div className="flex gap-2">
              <Button 
                onClick={() => handleRSVP(event.id, 'attending')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button 
                onClick={() => handleRSVP(event.id, 'declined')}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Decline
              </Button>
            </div>
          )}

          {event.currentUserStatus === 'attending' && (
            <Button 
              onClick={() => handleRSVP(event.id, 'declined')}
              variant="outline"
              className="w-full"
            >
              Cancel RSVP
            </Button>
          )}

          {event.currentUserStatus === 'declined' && (
            <Button 
              onClick={() => handleRSVP(event.id, 'attending')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Change to Attending
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Team Calendar</h1>
        <p className="text-stone-600">View and manage team events and schedule</p>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list')}>
        <TabsList className="mb-6">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  modifiers={{
                    hasEvent: eventsWithDates
                  }}
                  modifiersStyles={{
                    hasEvent: {
                      fontWeight: 'bold',
                      textDecoration: 'underline'
                    }
                  }}
                />
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Events for {format(selectedDate, 'MMMM dd, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="text-center text-stone-500 py-8">
                      No events scheduled for this date
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {getEventsForDate(selectedDate).map(event => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                All scheduled team events ({upcomingEvents.length} upcoming)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-stone-500 py-8">
                  No upcoming events scheduled
                </p>
              ) : (
                <div>
                  {upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamCalendarPage;