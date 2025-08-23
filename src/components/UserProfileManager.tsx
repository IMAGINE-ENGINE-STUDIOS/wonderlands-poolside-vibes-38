import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Edit3, Shield, Mail, Building2, Camera } from 'lucide-react';

interface UserProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfileManager = ({ isOpen, onClose }: UserProfileManagerProps) => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    company_name: profile?.company_name || '',
    company_logo_url: profile?.company_logo_url || '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        company_name: profile.company_name || '',
        company_logo_url: profile.company_logo_url || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      company_name: profile?.company_name || '',
      company_logo_url: profile?.company_logo_url || '',
    });
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'main_admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'supplier': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'installer': return 'bg-green-100 text-green-800 border-green-200';
      case 'consumer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!profile || !user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Not Found</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p>Unable to load profile information.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profile.email}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Account Type</Label>
                  <div className="mt-1">
                    <Badge className={getRoleBadgeColor(profile.role)}>
                      {profile.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Account Status</Label>
                  <div className="mt-1">
                    <Badge className={profile.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email Verified</Label>
                  <div className="mt-1">
                    <Badge className={user.email_confirmed_at ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                      {user.email_confirmed_at ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </span>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  
                  {(profile.role === 'supplier' || profile.role === 'installer') && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company_name" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Company Name
                        </Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_logo_url" className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Company Logo URL
                        </Label>
                        <Input
                          id="company_logo_url"
                          value={formData.company_logo_url}
                          onChange={(e) => setFormData({ ...formData, company_logo_url: e.target.value })}
                          placeholder="Enter logo URL"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={isLoading} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">First Name</Label>
                    <p className="font-medium mt-1">{profile.first_name || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Last Name</Label>
                    <p className="font-medium mt-1">{profile.last_name || 'Not set'}</p>
                  </div>
                  
                  {(profile.role === 'supplier' || profile.role === 'installer') && (
                    <>
                      <div>
                        <Label className="text-sm text-muted-foreground">Company Name</Label>
                        <p className="font-medium mt-1">{profile.company_name || 'Not set'}</p>
                      </div>
                      {profile.company_logo_url && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Company Logo</Label>
                          <div className="mt-2">
                            <img 
                              src={profile.company_logo_url} 
                              alt="Company Logo" 
                              className="w-16 h-16 object-contain border rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!user.email_confirmed_at && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      Your email address is not verified. Please check your email and click the verification link.
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  To change your email or password, please use the password reset functionality on the login page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileManager;