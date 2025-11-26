import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, CalendarDays, Users, DollarSign } from 'lucide-react';
import { Checkbox } from './ui/checkbox';

interface Session {
  id: string;
  date: string;
  attendees: number;
  totalMembers: number;
  roomMaintenance: number;
  meal: number;
  drinks: number;
  notes: string;
}

interface SessionsProps {
  userRole: 'admin' | 'tresorier';
}

export function Sessions({ userRole }: SessionsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      date: '2025-11-15',
      attendees: 42,
      totalMembers: 48,
      roomMaintenance: 25,
      meal: 75,
      drinks: 35,
      notes: 'Séance régulière',
    },
    {
      id: '2',
      date: '2025-11-01',
      attendees: 45,
      totalMembers: 48,
      roomMaintenance: 25,
      meal: 80,
      drinks: 40,
      notes: 'Séance avec assemblée générale',
    },
  ]);

  const [formData, setFormData] = useState({
    date: '',
    roomMaintenance: '25',
    meal: '',
    drinks: '',
    notes: '',
  });

  const mockMembers = [
    { id: '1', name: 'Marie Dupont', present: true },
    { id: '2', name: 'Jean Martin', present: true },
    { id: '3', name: 'Sophie Bernard', present: false },
    { id: '4', name: 'Pierre Durand', present: true },
    { id: '5', name: 'Claire Petit', present: true },
  ];

  const [attendance, setAttendance] = useState(mockMembers);

  const handleAddSession = () => {
    const presentCount = attendance.filter(m => m.present).length;
    const newSession: Session = {
      id: Date.now().toString(),
      date: formData.date,
      attendees: presentCount,
      totalMembers: attendance.length,
      roomMaintenance: parseFloat(formData.roomMaintenance),
      meal: parseFloat(formData.meal),
      drinks: parseFloat(formData.drinks),
      notes: formData.notes,
    };
    setSessions([newSession, ...sessions]);
    setFormData({ date: '', roomMaintenance: '25', meal: '', drinks: '', notes: '' });
    setIsAddDialogOpen(false);
  };

  const totalExpenses = (session: Session) => {
    return session.roomMaintenance + session.meal + session.drinks;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-indigo-950 mb-2">Gestion des Séances</h1>
          <p className="text-slate-600">{sessions.length} séances enregistrées</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="size-4 mr-2" />
              Nouvelle Séance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enregistrer une nouvelle séance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date de la séance</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Présences</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAttendanceDialogOpen(true)}
                >
                  <Users className="size-4 mr-2" />
                  Gérer les présences
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomMaintenance">Entretien de la salle (€)</Label>
                <Input
                  id="roomMaintenance"
                  type="number"
                  value={formData.roomMaintenance}
                  onChange={(e) => setFormData({ ...formData, roomMaintenance: e.target.value })}
                  placeholder="25"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meal">Repas (€)</Label>
                  <Input
                    id="meal"
                    type="number"
                    value={formData.meal}
                    onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                    placeholder="75"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drinks">Boisson (€)</Label>
                  <Input
                    id="drinks"
                    type="number"
                    value={formData.drinks}
                    onChange={(e) => setFormData({ ...formData, drinks: e.target.value })}
                    placeholder="35"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes de la séance..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  onClick={handleAddSession}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!formData.date || !formData.meal || !formData.drinks}
                >
                  Enregistrer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gérer les présences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 max-h-[400px] overflow-y-auto">
            {attendance.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                <Checkbox
                  id={`member-${member.id}`}
                  checked={member.present}
                  onCheckedChange={(checked) => {
                    setAttendance(attendance.map(m =>
                      m.id === member.id ? { ...m, present: checked as boolean } : m
                    ));
                  }}
                />
                <Label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">
                  {member.name}
                </Label>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-slate-600">
              Présents: <span className="text-indigo-600">{attendance.filter(m => m.present).length}</span> / {attendance.length}
            </p>
            <Button
              onClick={() => setIsAttendanceDialogOpen(false)}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
            >
              Valider
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sessions List */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <CalendarDays className="size-5 text-indigo-600" />
            Historique des Séances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Présences</TableHead>
                  <TableHead>Entretien Salle</TableHead>
                  <TableHead>Repas</TableHead>
                  <TableHead>Boisson</TableHead>
                  <TableHead>Total Dépenses</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id} className="hover:bg-slate-50">
                    <TableCell>
                      {new Date(session.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        {session.attendees}/{session.totalMembers}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{session.roomMaintenance}€</TableCell>
                    <TableCell className="text-slate-600">{session.meal}€</TableCell>
                    <TableCell className="text-slate-600">{session.drinks}€</TableCell>
                    <TableCell>
                      <span className="text-red-600">{totalExpenses(session)}€</span>
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">{session.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}