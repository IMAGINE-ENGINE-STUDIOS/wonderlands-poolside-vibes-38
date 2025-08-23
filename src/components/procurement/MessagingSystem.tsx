import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  MessageSquare,
  Clock,
  CheckCheck,
  FileImage,
  FileText
} from 'lucide-react';
import JoinVideoChat from '../JoinVideoChat';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  is_read: boolean;
  attachment_url?: string;
  attachment_name?: string;
}

interface Contact {
  id: string;
  name: string;
  company: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

interface MessagingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  initialContactId?: string;
  jobId?: string;
}

const MessagingSystem = ({ isOpen, onClose, initialContactId, jobId }: MessagingSystemProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showVideoChat, setShowVideoChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'John Smith',
        company: 'Luxury Homes Development',
        status: 'online',
        last_message: 'Thanks for the detailed proposal. Can we schedule a call?',
        last_message_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        unread_count: 2
      },
      {
        id: '2',
        name: 'Maria Rodriguez',
        company: 'Oceanview Restaurant Group',
        status: 'away',
        last_message: 'I have some additional questions about the timeline',
        last_message_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        unread_count: 0
      },
      {
        id: '3',
        name: 'Sarah Williams',
        company: 'Elite Property Management',
        status: 'offline',
        last_message: 'The proposal looks great! When can we start?',
        last_message_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        unread_count: 1
      }
    ];

    setContacts(mockContacts);

    if (initialContactId) {
      const contact = mockContacts.find(c => c.id === initialContactId);
      if (contact) {
        setSelectedContact(contact);
        loadMessages(initialContactId);
      }
    }
  }, [initialContactId]);

  const loadMessages = (contactId: string) => {
    // Mock messages for demonstration
    const mockMessages: Message[] = [
      {
        id: '1',
        sender_id: contactId,
        content: 'Hi! I saw your proposal for our pool installation project. Very impressive work!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_read: true
      },
      {
        id: '2',
        sender_id: 'current_user',
        content: 'Thank you! I have 15+ years of experience with luxury pool installations. Would you like to discuss the project details?',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        is_read: true
      },
      {
        id: '3',
        sender_id: contactId,
        content: 'Absolutely! I have a few questions about the timeline and materials. Can we schedule a call this week?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        is_read: false
      },
      {
        id: '4',
        sender_id: contactId,
        content: 'Also, I attached our property plans for reference.',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        is_read: false,
        attachment_url: '/documents/property-plans.pdf',
        attachment_name: 'Property Plans.pdf'
      }
    ];

    setMessages(mockMessages);
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    loadMessages(contact.id);
    // Mark messages as read
    setContacts(prev => prev.map(c => 
      c.id === contact.id ? { ...c, unread_count: 0 } : c
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      sender_id: 'current_user',
      content: newMessage,
      timestamp: new Date().toISOString(),
      is_read: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Update contact's last message
    setContacts(prev => prev.map(c => 
      c.id === selectedContact.id 
        ? { ...c, last_message: newMessage, last_message_time: new Date().toISOString() }
        : c
    ));

    toast.success('Message sent!');
  };

  const getInitials = (name: string, company: string) => {
    if (company) {
      return company.substring(0, 2).toUpperCase();
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex h-[80vh]">
          {/* Contacts Sidebar */}
          <div className="w-80 border-r bg-muted/30">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Join - Video Chat & Messages
              </DialogTitle>
            </DialogHeader>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2">
                {filteredContacts.map((contact) => (
                  <Card 
                    key={contact.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedContact?.id === contact.id ? 'bg-primary/10 border-primary/20' : ''
                    }`}
                    onClick={() => handleContactSelect(contact)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="text-xs">
                              {getInitials(contact.name, contact.company)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-background ${getStatusColor(contact.status)}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{contact.name}</h4>
                            {contact.unread_count > 0 && (
                              <Badge className="h-5 min-w-5 text-xs px-1">
                                {contact.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{contact.company}</p>
                          {contact.last_message && (
                            <>
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {contact.last_message}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(contact.last_message_time!), { addSuffix: true })}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getInitials(selectedContact.name, selectedContact.company)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-background ${getStatusColor(selectedContact.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedContact.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedContact.company}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Audio call functionality - placeholder for future implementation
                          toast.success('Starting audio call...');
                        }}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowVideoChat(true)}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === 'current_user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === 'current_user'
                            ? 'bg-primary text-white ml-4'
                            : 'bg-muted mr-4'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          
                          {message.attachment_url && (
                            <div className="mt-2 p-2 bg-background/10 rounded border">
                              <div className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                <span className="text-xs">{message.attachment_name}</span>
                                <Button variant="ghost" size="sm" className="text-xs">
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <div className={`flex items-center justify-between mt-1 ${
                            message.sender_id === 'current_user' ? 'text-white/70' : 'text-muted-foreground'
                          }`}>
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </span>
                            {message.sender_id === 'current_user' && (
                              <CheckCheck className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-background">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // File attachment functionality - placeholder for future implementation
                        toast.success('Attachment feature coming soon!');
                      }}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Image attachment functionality - placeholder for future implementation
                        toast.success('Image upload coming soon!');
                      }}
                    >
                      <FileImage className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Document attachment functionality - placeholder for future implementation
                        toast.success('Document upload coming soon!');
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-primary text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a contact to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Join Video Chat Component */}
        <JoinVideoChat 
          isOpen={showVideoChat}
          onClose={() => setShowVideoChat(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MessagingSystem;