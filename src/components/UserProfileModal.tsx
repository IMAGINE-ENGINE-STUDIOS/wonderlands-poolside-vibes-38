import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MessageSquare, 
  Video, 
  Star,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  ExternalLink,
  Award,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MessagingSystem from '@/components/procurement/MessagingSystem';
import JoinVideoChat from '@/components/JoinVideoChat';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  company_logo_url?: string;
  role: string;
  is_active: boolean;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  isOwnProfile?: boolean;
}

const UserProfileModal = ({ isOpen, onClose, userId, isOwnProfile = false }: UserProfileModalProps) => {
  const { user, profile, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showVideoChat, setShowVideoChat] = useState(false);
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    company_logo_url: '',
    bio: '',
    phone: '',
    website: '',
    location: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (isOwnProfile && profile) {
        setProfileData(profile);
        setEditForm({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          company_name: profile.company_name || '',
          company_logo_url: profile.company_logo_url || '',
          bio: '',
          phone: '',
          website: '',
          location: ''
        });
      } else if (userId) {
        fetchUserProfile(userId);
      }
    }
  }, [isOpen, userId, isOwnProfile, profile]);

  const fetchUserProfile = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData || !isOwnProfile) return;

    setLoading(true);
    try {
      await updateProfile({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        company_name: editForm.company_name,
        company_logo_url: editForm.company_logo_url
      });

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string, companyName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (companyName) {
      return companyName.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'consumer': 'Consumer',
      'supplier': 'Supplier',
      'installer': 'Installer',
      'main_admin': 'Administrator'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'consumer': 'bg-blue-100 text-blue-800',
      'supplier': 'bg-green-100 text-green-800',
      'installer': 'bg-purple-100 text-purple-800',
      'main_admin': 'bg-red-100 text-red-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  if (!profileData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {isOwnProfile ? 'My Profile' : 'User Profile'}
              </span>
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      handleSaveProfile();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  disabled={loading}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-primary/10 to-teal/10 rounded-lg">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profileData.company_logo_url} />
                  <AvatarFallback className="text-xl font-bold">
                    {getInitials(
                      profileData.first_name, 
                      profileData.last_name, 
                      profileData.company_name
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="First Name"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                        />
                        <Input
                          placeholder="Last Name"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                        />
                      </div>
                    ) : (
                      <h3 className="text-2xl font-bold">
                        {profileData.company_name || 
                         `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() ||
                         'Anonymous User'}
                      </h3>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(profileData.role)}>
                      {getRoleDisplayName(profileData.role)}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      Joined {new Date().getFullYear()}
                    </Badge>
                  </div>

                  {isEditing ? (
                    <Input
                      placeholder="Company Name"
                      value={editForm.company_name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, company_name: e.target.value }))}
                    />
                  ) : profileData.company_name ? (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      {profileData.company_name}
                    </p>
                  ) : null}

                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {profileData.email}
                  </p>

                  {/* Contact Actions */}
                  {!isOwnProfile && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => setShowMessaging(true)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowVideoChat(true)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Tabs */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Professional Info
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Role:</span>
                          <span>{getRoleDisplayName(profileData.role)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={profileData.is_active ? "default" : "secondary"}>
                            {profileData.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Member Since:</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Projects:</span>
                          <span>12 completed</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>4.8 (24 reviews)</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Response Time:</span>
                          <span>&lt; 2 hours</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        Project history will be available soon
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Reviews & Ratings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        Reviews system coming soon
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Bio</label>
                            <Textarea
                              placeholder="Tell us about yourself..."
                              value={editForm.bio}
                              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Phone</label>
                              <Input
                                placeholder="Phone number"
                                value={editForm.phone}
                                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Website</label>
                              <Input
                                placeholder="Website URL"
                                value={editForm.website}
                                onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Location</label>
                            <Input
                              placeholder="City, State"
                              value={editForm.location}
                              onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                            />
                          </div>
                        </div>
                      ) : (
                         <div className="space-y-3">
                           <div className="flex items-center gap-2">
                             <Mail className="h-4 w-4 text-muted-foreground" />
                             <span>{profileData.email}</span>
                           </div>
                           
                           {!isOwnProfile && (
                             <div className="flex gap-2 pt-4">
                               <Button
                                 onClick={() => setShowMessaging(true)}
                                 className="flex-1"
                               >
                                 <MessageSquare className="h-4 w-4 mr-2" />
                                 Send Message
                               </Button>
                               <Button
                                 variant="outline"
                                 onClick={() => setShowVideoChat(true)}
                                 className="flex-1"
                               >
                                 <Video className="h-4 w-4 mr-2" />
                                 Video Call
                               </Button>
                             </div>
                           )}
                         </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Messaging System */}
      <MessagingSystem
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
        initialContactId={userId}
      />

      {/* Video Chat */}
      <JoinVideoChat
        isOpen={showVideoChat}
        onClose={() => setShowVideoChat(false)}
      />
    </>
  );
};

export default UserProfileModal;