import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Trash2, UserCircle, Mail, Phone, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

interface MembersProps {
  userRole: 'admin' | 'tresorier';
}

export function Members({ userRole }: MembersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      firstName: 'Marie',
      lastName: 'Dupont',
      phone: '+33 6 12 34 56 78',
      email: 'marie.dupont@email.com',
      status: 'active',
      joinDate: '2023-01-15',
    },
    {
      id: '2',
      firstName: 'Jean',
      lastName: 'Martin',
      phone: '+33 6 23 45 67 89',
      email: 'jean.martin@email.com',
      status: 'active',
      joinDate: '2023-02-20',
    },
    {
      id: '3',
      firstName: 'Sophie',
      lastName: 'Bernard',
      phone: '+33 6 34 56 78 90',
      email: 'sophie.bernard@email.com',
      status: 'active',
      joinDate: '2023-03-10',
    },
    {
      id: '4',
      firstName: 'Pierre',
      lastName: 'Durand',
      phone: '+33 6 45 67 89 01',
      email: 'pierre.durand@email.com',
      status: 'active',
      joinDate: '2023-05-22',
    },
    {
      id: '5',
      firstName: 'Claire',
      lastName: 'Petit',
      phone: '+33 6 56 78 90 12',
      email: 'claire.petit@email.com',
      status: 'inactive',
      joinDate: '2022-11-10',
    },
  ]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const filteredMembers = members.filter(
    (member) =>
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = () => {
    const newMember: Member = {
      id: Date.now().toString(),
      ...formData,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
    };
    setMembers([...members, newMember]);
    setFormData({ firstName: '', lastName: '', phone: '', email: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditMember = () => {
    if (selectedMember) {
      setMembers(members.map(m => 
        m.id === selectedMember.id 
          ? { ...selectedMember, ...formData }
          : m
      ));
      setIsEditDialogOpen(false);
      setSelectedMember(null);
      setFormData({ firstName: '', lastName: '', phone: '', email: '' });
    }
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const openEditDialog = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone,
      email: member.email,
    });
    setIsEditDialogOpen(true);
  };

  // Stats for charts
  const membersByMonth = [
    { month: 'Jan', count: 42 },
    { month: 'Fev', count: 43 },
    { month: 'Mar', count: 44 },
    { month: 'Avr', count: 45 },
    { month: 'Mai', count: 47 },
    { month: 'Juin', count: 48 },
  ];

  const statusData = [
    { name: 'Actifs', value: members.filter(m => m.status === 'active').length, color: '#10b981' },
    { name: 'Inactifs', value: members.filter(m => m.status === 'inactive').length, color: '#ef4444' },
  ];

  const activeMembers = members.filter(m => m.status === 'active').length;
  const inactiveMembers = members.filter(m => m.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-indigo-950 mb-2">Gestion des Membres</h1>
          <p className="text-slate-600">{members.length} membres inscrits</p>
        </div>
        {userRole === 'admin' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                <Plus className="size-4 mr-2" />
                Nouveau Membre
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Ajouter un nouveau membre</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-slate-700">Prénom *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Prénom"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-slate-700">Nom *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Nom"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700">Téléphone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+33 6 00 00 00 00"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemple.com"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAddMember}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!formData.firstName || !formData.lastName || !formData.phone || !formData.email}
                >
                  Ajouter le membre
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Membres Actifs</p>
                <p className="text-3xl text-emerald-600">{activeMembers}</p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-lg">
                <UserCircle className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Membres Inactifs</p>
                <p className="text-3xl text-red-600">{inactiveMembers}</p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <UserCircle className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Membres</p>
                <p className="text-3xl text-indigo-600">{members.length}</p>
              </div>
              <div className="p-3 bg-indigo-500 rounded-lg">
                <UserCircle className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="size-5 text-indigo-600" />
              Évolution des Membres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={membersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} name="Nombre de membres" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <UserCircle className="size-5 text-indigo-600" />
              Statut des Membres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Rechercher un membre par nom, prénom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <UserCircle className="size-5 text-indigo-600" />
            Liste des Membres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Nom Complet</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Statut</TableHead>
                  {userRole === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id} className="hover:bg-slate-50">
                    <TableCell className="text-slate-900">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell className="text-slate-600">{member.phone}</TableCell>
                    <TableCell className="text-slate-600">{member.email}</TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-slate-400" />
                        {new Date(member.joinDate).toLocaleDateString('fr-FR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          member.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }
                      >
                        {member.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    {userRole === 'admin' && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                            onClick={() => openEditDialog(member)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Modifier le membre</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName" className="text-slate-700">Prénom *</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Prénom"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName" className="text-slate-700">Nom *</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Nom"
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-slate-700">Téléphone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="edit-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 6 00 00 00 00"
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-slate-700">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemple.com"
                  className="pl-10 h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setFormData({ firstName: '', lastName: '', phone: '', email: '' });
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleEditMember}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              disabled={!formData.firstName || !formData.lastName || !formData.phone || !formData.email}
            >
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
