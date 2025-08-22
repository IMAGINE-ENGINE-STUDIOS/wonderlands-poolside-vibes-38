import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Award,
  Users,
  DollarSign,
  Camera,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  isOwnProfile?: boolean;
}

const UserProfileModal = ({ isOpen, onClose, userId, isOwnProfile = false }: UserProfileModalProps) => {
  const { user, profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    company_logo_url: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    website: '',
    founded_year: '',
    employees: '',
    specializations: [] as string[],
    certifications: [] as string[]
  });

  // Mock profile data for demonstration
  const mockProfile = {
    id: userId || user?.id || '1',
    first_name: 'John',
    last_name: 'Smith',
    company_name: 'Luxury Homes Development',
    company_logo_url: '',
    email: 'john@luxuryhomes.com',
    phone: '(555) 123-4567',
    address: 'Miami, FL',
    description: 'Premier luxury home developer with over 15 years of experience in high-end residential projects. Specializing in custom pool installations, outdoor living spaces, and complete home renovations.',
    website: 'www.luxuryhomes.com',
    founded_year: '2008',
    employees: '25-50',
    rating: 4.8,
    total_projects: 127,
    total_spent: 2450000,
    member_since: '2020-01-15',
    verified: true,
    specializations: ['Luxury Pools', 'Outdoor Kitchens', 'Landscaping', 'Home Renovation'],
    certifications: ['Licensed General Contractor', 'Pool & Spa Certified', 'EPA Lead-Safe Certified'],
    recent_projects: [
      {
        id: '1',
        title: 'Infinity Pool Installation',
        location: 'Coral Gables, FL',
        budget: 85000,
        completed_date: '2024-02-15',
        image: '/lovable-uploads/3bdd9802-26f9-47ab-8498-e0e66344685c.png'
      },
      {
        id: '2',
        title: 'Outdoor Entertainment Area',
        location: 'Pinecrest, FL',
        budget: 65000,
        completed_date: '2024-01-20',
        image: '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png'
      }
    ],
    reviews: [
      {
        id: '1',
        author: 'Sarah Williams',
        rating: 5,
        comment: 'Exceptional work! John and his team transformed our backyard into a paradise. The attention to detail and quality craftsmanship exceeded our expectations.',
        date: '2024-02-20',
        project: 'Pool & Spa Installation'
      },
      {
        id: '2',
        author: 'Mike Rodriguez',
        rating: 5,
        comment: 'Professional, reliable, and delivered exactly what was promised. The outdoor kitchen is absolutely stunning!',
        date: '2024-01-25',
        project: 'Outdoor Kitchen'
      }
    ]
  };

  useEffect(() => {
    if (isOpen) {
      if (isOwnProfile && profile) {
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          company_name: profile.company_name || '',
          company_logo_url: profile.company_logo_url || '',
          email: profile.email || '',
          phone: mockProfile.phone,
          address: mockProfile.address,
          description: mockProfile.description,
          website: mockProfile.website,
          founded_year: mockProfile.founded_year,
          employees: mockProfile.employees,
          specializations: mockProfile.specializations,
          certifications: mockProfile.certifications
        });
      } else {
        setFormData({
          first_name: mockProfile.first_name,
          last_name: mockProfile.last_name,
          company_name: mockProfile.company_name,
          company_logo_url: mockProfile.company_logo_url,
          email: mockProfile.email,
          phone: mockProfile.phone,
          address: mockProfile.address,
          description: mockProfile.description,
          website: mockProfile.website,
          founded_year: mockProfile.founded_year,
          employees: mockProfile.employees,
          specializations: mockProfile.specializations,
          certifications: mockProfile.certifications
        });
      }
    }
  }, [isOpen, isOwnProfile, profile]);

  const handleSave = async () => {
    if (isOwnProfile) {
      try {
        await updateProfile({
          first_name: formData.first_name,
          last_name: formData.last_name,
          company_name: formData.company_name,
          company_logo_url: formData.company_logo_url
        });
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } catch (error) {
        toast.error('Failed to update profile');
      }
    }
  };

  const getInitials = (firstName: string, lastName: string, companyName: string) => {
    if (companyName) {
      return companyName.substring(0, 2).toUpperCase();
    }
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const currentProfile = isOwnProfile ? { ...mockProfile, ...profile } : mockProfile;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {isOwnProfile ? 'My Profile' : 'Business Profile'}
            </DialogTitle>
            {isOwnProfile && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={formData.company_logo_url} />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-teal text-white">
                      {getInitials(formData.first_name, formData.last_name, formData.company_name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      {isEditing ? (
                        <Input
                          value={formData.first_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                        />
                      ) : (
                        <p className="font-medium">{formData.first_name}</p>
                      )}
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      {isEditing ? (
                        <Input
                          value={formData.last_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                        />
                      ) : (
                        <p className="font-medium">{formData.last_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Company Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.company_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-lg">{formData.company_name}</p>
                        {currentProfile.verified && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Award className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {formData.address}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Member since {new Date(currentProfile.member_since).getFullYear()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {currentProfile.rating} rating
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-2xl font-bold text-primary">{currentProfile.total_projects}</div>
                  <div className="text-sm text-muted-foreground">Projects Completed</div>
                  <div className="text-lg font-semibold text-green-600">
                    ${(currentProfile.total_spent / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  ) : (
                    <p className="text-muted-foreground">{formData.description}</p>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Specializations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {formData.specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {formData.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentProfile.recent_projects.map((project) => (
                  <Card key={project.id}>
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img 
                        src={project.image} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="pt-4">
                      <h4 className="font-semibold mb-2">{project.title}</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${project.budget.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Completed {new Date(project.completed_date).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-4">
                {currentProfile.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{review.author}</h4>
                          <p className="text-sm text-muted-foreground">{review.project}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-2">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">{formData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-muted-foreground">{formData.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Website</p>
                          <p className="text-muted-foreground">{formData.website}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Company Size</p>
                          <p className="text-muted-foreground">{formData.employees} employees</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Founded</p>
                          <p className="text-muted-foreground">{formData.founded_year}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;