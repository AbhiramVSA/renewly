import React, { useState } from 'react';
import { useUsers, useDeleteUser, useUpdateUserRole } from '@/hooks/user.hooks';
import { AdminOnly, SuperAdminOnly } from '@/components/auth/RoleGuard';
import { RoleBadge } from '@/components/ui/role-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { canChangeUserRole } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import type { UserFilters, Role } from '@/types';

const ROLES: Role[] = ['USER', 'READ_ONLY', 'SERVICE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'];

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState('');

  const { data: usersData, isLoading, error } = useUsers(filters);
  const deleteUserMutation = useDeleteUser();
  const updateRoleMutation = useUpdateUserRole();

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, q: search, page: 1 }));
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    if (!currentUser || !canChangeUserRole(currentUser.role, newRole)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to assign this role',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateRoleMutation.mutateAsync({ userId, data: { role: newRole } });
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Error loading users: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminOnly fallback={
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
          </CardContent>
        </Card>
      </div>
    }>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.items.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value: Role) => handleRoleChange(user._id, value)}
                          disabled={
                            updateRoleMutation.isPending ||
                            !currentUser
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              <RoleBadge role={user.role} />
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                <RoleBadge role={role} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <SuperAdminOnly>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                disabled={deleteUserMutation.isPending || user._id === currentUser?._id}
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </SuperAdminOnly>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {usersData?.pagination && (
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {usersData.items.length} of {usersData.pagination.total} users
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                    disabled={!usersData.pagination.page || usersData.pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                    disabled={usersData.items.length < (usersData.pagination.limit || 20)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
};
