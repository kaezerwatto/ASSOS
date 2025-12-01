import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, CalendarDays, Users, DollarSign, Edit, Eye, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { databaseService, ID } from '../lib/appwrite-service';

interface Session {
  id: string;
  date_seance: string;
  type: 'inaugurale' | 'ordinaire' | 'extraordinaire';
  lieu_seance: string;
  heure_seance: string;
  nouvelles_membres: string;
  resolutions: string;
  $createdAt?: string;
}

interface Participation {
  id: string;
  est_present: boolean;
  type_absence?: 'justifiée' | 'non justifiée';
  heure_arrivee?: string;
  membres: string;
  seances: string;
}

interface Member {
  id: string;
  name: string;
  present: boolean;
  heure_arrivee?: string;
}

interface SessionsProps {
  userRole: 'admin' | 'tresorier';
}

// IDs de votre base de données Appwrite
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '69243fec00044331ef75';
const SESSIONS_COLLECTION_ID = 'seances';
const PARTICIPATION_COLLECTION_ID = 'participation_seance';
const MEMBRES_COLLECTION_ID = 'membres';

export function Sessions({ userRole }: SessionsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isViewSessionDialogOpen, setIsViewSessionDialogOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);

  // États pour la pagination et le tri
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'date_seance' | 'lieu_seance' | 'type'>('date_seance');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    date_seance: '',
    type: 'ordinaire' as 'inaugurale' | 'ordinaire' | 'extraordinaire',
    lieu_seance: '',
    heure_seance: '',
    nouvelles_membres: '',
    resolutions: '',
  });

  const [attendance, setAttendance] = useState<Member[]>([]);

  // Charger les séances depuis Appwrite
  const loadSessions = async () => {
    try {
      const response = await databaseService.listDocuments(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID
      );
      setSessions(response.documents as any);
    } catch (error) {
      console.error('Erreur lors du chargement des séances:', error);
    }
  };

  // Charger les membres depuis Appwrite
  const loadMembers = async () => {
    try {
      const response = await databaseService.listDocuments(
        DATABASE_ID,
        MEMBRES_COLLECTION_ID
      );
      const membresData = response.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.noms + ' ' + doc.prenoms || 'Membre sans nom',
        present: false
      }));
      setMembers(membresData);
      setAttendance(membresData);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
      const mockMembers = [
        { id: '1', name: 'Marie Dupont', present: true },
        { id: '2', name: 'Jean Martin', present: true },
        { id: '3', name: 'Sophie Bernard', present: false },
        { id: '4', name: 'Pierre Durand', present: true },
        { id: '5', name: 'Claire Petit', present: true },
      ];
      setMembers(mockMembers);
      setAttendance(mockMembers);
    }
  };

  // Charger les participations pour une séance
  const loadParticipations = async (sessionId: string) => {
    try {
      const response = await databaseService.listDocuments(
        DATABASE_ID,
        PARTICIPATION_COLLECTION_ID,
        [`seances=${sessionId}`]
      );
      setParticipations(response.documents as any);
    } catch (error) {
      console.error('Erreur lors du chargement des participations:', error);
    }
  };

  useEffect(() => {
    loadSessions();
    loadMembers();
  }, []);

  const handleAddSession = async () => {
    try {
      const newSession = await databaseService.createDocument(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID,
        {
          date_seance: formData.date_seance,
          type: formData.type,
          lieu_seance: formData.lieu_seance,
          heure_seance: formData.heure_seance,
          nouvelles_membres: formData.nouvelles_membres,
          resolutions: formData.resolutions,
        }
      );

      // Enregistrer les participations
      for (const member of attendance) {
        await databaseService.createDocument(
          DATABASE_ID,
          PARTICIPATION_COLLECTION_ID,
          {
            est_present: member.present,
            type_absence: member.present ? undefined : 'non justifiée',
            heure_arrivee: member.present ? formData.heure_seance : undefined,
            membres: member.id,
            seances: newSession.$id,
          }
        );
      }

      setSessions([newSession as any, ...sessions]);
      setFormData({
        date_seance: '',
        type: 'ordinaire',
        lieu_seance: '',
        heure_seance: '',
        nouvelles_membres: '',
        resolutions: '',
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création de la séance:', error);
    }
  };

  const handleUpdateSession = async () => {
    if (!currentSession) return;

    try {
      const updatedSession = await databaseService.updateDocument(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID,
        currentSession.id,
        {
          date_seance: formData.date_seance,
          type: formData.type,
          lieu_seance: formData.lieu_seance,
          heure_seance: formData.heure_seance,
          nouvelles_membres: formData.nouvelles_membres,
          resolutions: formData.resolutions,
        }
      );

      setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession as any : s));
      setIsEditDialogOpen(false);
      resetFormData();
    } catch (error) {
      console.error('Erreur lors de la modification de la séance:', error);
    }
  };

  const handleUpdateAttendance = async (sessionId: string) => {
    try {
      // Supprimer les anciennes participations
      const existingParticipations = await databaseService.listDocuments(
        DATABASE_ID,
        PARTICIPATION_COLLECTION_ID,
        [`seances=${sessionId}`]
      );

      for (const participation of existingParticipations.documents) {
        await databaseService.deleteDocument(
          DATABASE_ID,
          PARTICIPATION_COLLECTION_ID,
          participation.$id
        );
      }

      // Créer les nouvelles participations
      for (const member of attendance) {
        await databaseService.createDocument(
          DATABASE_ID,
          PARTICIPATION_COLLECTION_ID,
          {
            est_present: member.present,
            type_absence: member.present ? undefined : 'non justifiée',
            heure_arrivee: member.present ? (member.heure_arrivee || formData.heure_seance) : undefined,
            membres: member.id,
            seances: sessionId,
          }
        );
      }

      setIsAttendanceDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des présences:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      return;
    }

    try {
      // Supprimer les participations associées
      const participations = await databaseService.listDocuments(
        DATABASE_ID,
        PARTICIPATION_COLLECTION_ID,
        [`seances=${sessionId}`]
      );

      for (const participation of participations.documents) {
        await databaseService.deleteDocument(
          DATABASE_ID,
          PARTICIPATION_COLLECTION_ID,
          participation.$id
        );
      }

      // Supprimer la séance
      await databaseService.deleteDocument(
        DATABASE_ID,
        SESSIONS_COLLECTION_ID,
        sessionId
      );

      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la séance:', error);
    }
  };

  const openViewSession = async (session: Session) => {
    setCurrentSession(session);
    await loadParticipations(session.id);
    setIsViewSessionDialogOpen(true);
  };

  const openEditSession = (session: Session) => {
    setCurrentSession(session);
    setFormData({
      date_seance: session.date_seance,
      type: session.type,
      lieu_seance: session.lieu_seance,
      heure_seance: session.heure_seance,
      nouvelles_membres: session.nouvelles_membres,
      resolutions: session.resolutions,
    });
    setIsEditDialogOpen(true);
  };

  const openEditAttendance = async (session: Session) => {
    setCurrentSession(session);
    await loadParticipations(session.id);
    
    // Mettre à jour l'attendance avec les données existantes
    const updatedAttendance = members.map(member => {
      const participation = participations.find(p => p.membres === member.id);
      return {
        ...member,
        present: participation?.est_present || false,
        heure_arrivee: participation?.heure_arrivee
      };
    });
    setAttendance(updatedAttendance);
    
    setIsAttendanceDialogOpen(true);
  };

  const resetFormData = () => {
    setFormData({
      date_seance: '',
      type: 'ordinaire',
      lieu_seance: '',
      heure_seance: '',
      nouvelles_membres: '',
      resolutions: '',
    });
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'inaugurale': return 'bg-purple-100 text-purple-700';
      case 'ordinaire': return 'bg-blue-100 text-blue-700';
      case 'extraordinaire': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPresenceStats = () => {
    const total = attendance.length;
    const present = attendance.filter(m => m.present).length;
    const absent = total - present;
    return { total, present, absent };
  };

  // Fonctions de tri et pagination
  const handleSort = (field: 'date_seance' | 'lieu_seance' | 'type') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'date_seance') {
      aValue = new Date(a.date_seance).getTime();
      bValue = new Date(b.date_seance).getTime();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSessions = sortedSessions.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const SortableHeader = ({ field, children }: { field: 'date_seance' | 'lieu_seance' | 'type', children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-slate-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="size-4" />
        {sortField === field && (
          <span className="text-xs">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-slate-600 mb-2">Gestion des Séances</h1>
          <p className="text-slate-600">{sessions.length} séances enregistrées</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="size-4 mr-2" />
              Nouvelle Séance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Enregistrer une nouvelle séance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="date_seance">Date de la séance</Label>
                <Input
                  id="date_seance"
                  type="date"
                  value={formData.date_seance}
                  onChange={(e) => setFormData({ ...formData, date_seance: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heure_seance">Heure de la séance</Label>
                <Input
                  id="heure_seance"
                  type="time"
                  value={formData.heure_seance}
                  onChange={(e) => setFormData({ ...formData, heure_seance: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de séance</Label>
                <select
                  id="type"
                  className="w-full p-2 border border-slate-200 rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="ordinaire">Ordinaire</option>
                  <option value="inaugurale">Inaugurale</option>
                  <option value="extraordinaire">Extraordinaire</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lieu_seance">Lieu de la séance</Label>
                <Input
                  id="lieu_seance"
                  type="text"
                  value={formData.lieu_seance}
                  onChange={(e) => setFormData({ ...formData, lieu_seance: e.target.value })}
                  placeholder="Salle de réunion..."
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
                  Gérer les présences ({attendance.filter(m => m.present).length}/{attendance.length})
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nouvelles_membres">Nouvelles membres</Label>
                <Textarea
                  id="nouvelles_membres"
                  value={formData.nouvelles_membres}
                  onChange={(e) => setFormData({ ...formData, nouvelles_membres: e.target.value })}
                  placeholder="Liste des nouvelles membres..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolutions">Résolutions</Label>
                <Textarea
                  id="resolutions"
                  value={formData.resolutions}
                  onChange={(e) => setFormData({ ...formData, resolutions: e.target.value })}
                  placeholder="Résolutions prises durant la séance..."
                  rows={3}
                />
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  onClick={handleAddSession}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={!formData.date_seance || !formData.lieu_seance}
                >
                  Enregistrer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetFormData();
                  }}
                >
                  Annuler
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la séance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit_date_seance">Date de la séance</Label>
              <Input
                id="edit_date_seance"
                type="date"
                value={formData.date_seance}
                onChange={(e) => setFormData({ ...formData, date_seance: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_heure_seance">Heure de la séance</Label>
              <Input
                id="edit_heure_seance"
                type="time"
                value={formData.heure_seance}
                onChange={(e) => setFormData({ ...formData, heure_seance: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_type">Type de séance</Label>
              <select
                id="edit_type"
                className="w-full p-2 border border-slate-200 rounded-md"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="ordinaire">Ordinaire</option>
                <option value="inaugurale">Inaugurale</option>
                <option value="extraordinaire">Extraordinaire</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_lieu_seance">Lieu de la séance</Label>
              <Input
                id="edit_lieu_seance"
                type="text"
                value={formData.lieu_seance}
                onChange={(e) => setFormData({ ...formData, lieu_seance: e.target.value })}
                placeholder="Salle de réunion..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_nouvelles_membres">Nouvelles membres</Label>
              <Textarea
                id="edit_nouvelles_membres"
                value={formData.nouvelles_membres}
                onChange={(e) => setFormData({ ...formData, nouvelles_membres: e.target.value })}
                placeholder="Liste des nouvelles membres..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_resolutions">Résolutions</Label>
              <Textarea
                id="edit_resolutions"
                value={formData.resolutions}
                onChange={(e) => setFormData({ ...formData, resolutions: e.target.value })}
                placeholder="Résolutions prises durant la séance..."
                rows={3}
              />
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                onClick={handleUpdateSession}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!formData.date_seance || !formData.lieu_seance}
              >
                Modifier
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetFormData();
                }}
              >
                Annuler
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentSession ? 'Modifier les présences' : 'Gérer les présences'}
            </DialogTitle>
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
                {member.present && (
                  <Input
                    type="time"
                    value={member.heure_arrivee || formData.heure_seance}
                    onChange={(e) => {
                      setAttendance(attendance.map(m =>
                        m.id === member.id ? { ...m, heure_arrivee: e.target.value } : m
                      ));
                    }}
                    className="w-32"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-slate-600">
              Présents: <span className="text-indigo-600">{attendance.filter(m => m.present).length}</span> / {attendance.length}
            </p>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => currentSession ? handleUpdateAttendance(currentSession.id) : setIsAttendanceDialogOpen(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {currentSession ? 'Mettre à jour' : 'Valider'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAttendanceDialogOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Session Dialog */}
      <Dialog open={isViewSessionDialogOpen} onOpenChange={setIsViewSessionDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la séance</DialogTitle>
          </DialogHeader>
          {currentSession && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Date</Label>
                  <p>{new Date(currentSession.date_seance).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label className="font-semibold">Heure</Label>
                  <p>{currentSession.heure_seance}</p>
                </div>
                <div>
                  <Label className="font-semibold">Type</Label>
                  <Badge className={getTypeBadgeVariant(currentSession.type)}>
                    {currentSession.type}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Lieu</Label>
                  <p>{currentSession.lieu_seance}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Statistiques de présence</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{getPresenceStats().present}</div>
                      <div className="text-sm text-slate-600">Présents</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{getPresenceStats().absent}</div>
                      <div className="text-sm text-slate-600">Absents</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-slate-600">{getPresenceStats().total}</div>
                      <div className="text-sm text-slate-600">Total</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {currentSession.nouvelles_membres && (
                <div>
                  <Label className="font-semibold">Nouvelles membres</Label>
                  <p className="mt-1 whitespace-pre-wrap">{currentSession.nouvelles_membres}</p>
                </div>
              )}

              {currentSession.resolutions && (
                <div>
                  <Label className="font-semibold">Résolutions</Label>
                  <p className="mt-1 whitespace-pre-wrap">{currentSession.resolutions}</p>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsViewSessionDialogOpen(false)}
                >
                  Fermer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sessions List */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <CalendarDays className="size-5 text-indigo-600" />
            Liste des Séances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <SortableHeader field="date_seance">
                    Date de la réunion
                  </SortableHeader>
                  <SortableHeader field="lieu_seance">
                    Lieu de la réunion
                  </SortableHeader>
                  <SortableHeader field="type">
                    Type de la réunion
                  </SortableHeader>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSessions.map((session) => (
                  <TableRow key={session.id} className="hover:bg-slate-50">
                    <TableCell>
                      {new Date(session.date_seance).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-slate-600">{session.lieu_seance}</TableCell>
                    <TableCell>
                      <Badge className={getTypeBadgeVariant(session.type)}>
                        {session.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewSession(session)}
                          title="Voir les détails"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditSession(session)}
                          title="Modifier la séance"
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditAttendance(session)}
                          title="Gérer les présences"
                        >
                          <Users className="size-4" />
                        </Button>
                        {userRole === 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteSession(session.id)}
                            title="Supprimer la séance"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-slate-600">
                Page {currentPage} sur {totalPages} - {sessions.length} séances
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={currentPage === page ? "bg-indigo-600 text-white" : ""}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}