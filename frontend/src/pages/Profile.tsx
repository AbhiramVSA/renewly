import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, signOutAll } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) return null;

  const handleUpdateProfile = async () => {
    try {
      setSavingProfile(true);
      const res = await api.put(`/api/v1/users/${user._id}`, { name, email });
      if (res.data?.success) {
        toast({ title: 'Profile updated', description: 'Your details were saved.' });
        // Update local storage for immediate reflect
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          u.name = name;
          u.email = email;
          localStorage.setItem('user', JSON.stringify(u));
        }
      }
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.response?.data?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setChangingPassword(true);
      const res = await api.patch(`/api/v1/users/${user._id}/password`, { currentPassword, newPassword });
      if (res.data?.success) {
        toast({ title: 'Password changed', description: 'Please sign in again on other devices.' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (e: any) {
      toast({ title: 'Change failed', description: e.response?.data?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Profile</h1>
        </div>

        {/* User summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Name</div>
              <div className="font-medium">{user.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Email</div>
              <div className="font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Role</div>
              <div className="font-medium">{user.role}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium">Active</div>
            </div>
            <div className="sm:col-span-2">
              <Button variant="outline" onClick={async () => { await signOutAll(); }} className="border-red-300 text-red-600 hover:bg-red-50">
                Sign out from all devices
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile details */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateProfile} disabled={savingProfile} className="bg-red-500 hover:bg-red-600 text-white">
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Password change */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleChangePassword} disabled={changingPassword} className="bg-red-500 hover:bg-red-600 text-white">
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
