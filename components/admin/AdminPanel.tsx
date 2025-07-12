'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Shield, 
  MessageSquare, 
  Download, 
  Ban, 
  CheckCircle, 
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';

interface User {
  id: string;
  username: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  questionCount: number;
  answerCount: number;
  isBanned: boolean;
}

interface Question {
  id: string;
  title: string;
  author: {
    username: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  pendingQuestions: number;
  bannedUsers: number;
}

export default function AdminPanel() {
  const { user } = useUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [platformMessage, setPlatformMessage] = useState('');
  const [messageType, setMessageType] = useState<'INFO' | 'WARNING' | 'ALERT'>('INFO');

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Load users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Load pending questions
      const questionsResponse = await fetch('/api/admin/questions');
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: banReason }),
      });

      if (response.ok) {
        setUsers(prev => 
          prev.map(u => 
            u.id === selectedUser.id ? { ...u, isBanned: true } : u
          )
        );
        setShowBanDialog(false);
        setSelectedUser(null);
        setBanReason('');
        loadAdminData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST',
      });

      if (response.ok) {
        setUsers(prev => 
          prev.map(u => 
            u.id === userId ? { ...u, isBanned: false } : u
          )
        );
        loadAdminData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleApproveQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        setQuestions(prev => 
          prev.map(q => 
            q.id === questionId ? { ...q, status: 'APPROVED' } : q
          )
        );
        loadAdminData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error approving question:', error);
    }
  };

  const handleRejectQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}/reject`, {
        method: 'POST',
      });

      if (response.ok) {
        setQuestions(prev => 
          prev.map(q => 
            q.id === questionId ? { ...q, status: 'REJECTED' } : q
          )
        );
        loadAdminData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error rejecting question:', error);
    }
  };

  const handleSendPlatformMessage = async () => {
    if (!platformMessage.trim()) return;

    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: platformMessage,
          type: messageType,
        }),
      });

      if (response.ok) {
        setShowMessageDialog(false);
        setPlatformMessage('');
        setMessageType('INFO');
      }
    } catch (error) {
      console.error('Error sending platform message:', error);
    }
  };

  const handleDownloadReport = async (reportType: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportType}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowMessageDialog(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalAnswers}</p>
                  <p className="text-sm text-muted-foreground">Total Answers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingQuestions}</p>
                  <p className="text-sm text-muted-foreground">Pending Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.bannedUsers}</p>
                  <p className="text-sm text-muted-foreground">Banned Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleDownloadReport('users')}
            >
              Download User Report
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownloadReport('questions')}
            >
              Download Questions Report
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownloadReport('activity')}
            >
              Download Activity Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.filter(q => q.status === 'PENDING').map((question) => (
              <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{question.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    by {question.author.username} • {new Date(question.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveQuestion(question.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRejectQuestion(question.id)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
            {questions.filter(q => q.status === 'PENDING').length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No pending questions
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{user.username}</h3>
                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    {user.isBanned && (
                      <Badge variant="destructive">Banned</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.questionCount} questions • {user.answerCount} answers • 
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {user.isBanned ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnbanUser(user.id)}
                    >
                      Unban
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowBanDialog(true);
                      }}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Ban
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedUser?.username}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="banReason">Reason for ban</Label>
              <Textarea
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter the reason for banning this user..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBanUser}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Platform Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Platform Message</DialogTitle>
            <DialogDescription>
              Send a message to all users on the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="messageType">Message Type</Label>
              <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFO">Information</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="ALERT">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="platformMessage">Message</Label>
              <Textarea
                id="platformMessage"
                value={platformMessage}
                onChange={(e) => setPlatformMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPlatformMessage}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 