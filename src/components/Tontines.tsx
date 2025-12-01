import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Coins, TrendingUp, Users, Calendar, Trash2, Edit, Eye, UserPlus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { databaseService } from '../lib/appwrite-service';

interface Tontine {
  $id: string;
  libelle: string;
  montant_individuel: number;
  nombre_participants: number;
  frequence: 'mensuelle' | 'trimestrielle' | 'semestrielle' | 'annuelle';
  $createdAt: string;
}

interface Membre {
  $id: string;
  nom: string;
  prenom: string;
  email: string;
}

interface SeanceTontine {
  $id: string;
  tontine_id: string;
  date_seance: string;
  beneficiaire_id: string;
  montant_percu: number;
  statut: 'planifiee' | 'terminee' | 'annulee';
}

interface MembreTontine {
  $id: string;
  tontine_id: string;
  membre_id: string;
  date_adhesion: string;
  statut: 'actif' | 'inactif';
}

interface TontinesProps {
  userRole: 'admin' | 'tresorier';
}

// IDs de la base de données Appwrite
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '69243fec00044331ef75';
const TONTINES_COLLECTION = 'tontines';
const MEMBRES_COLLECTION = 'membres';
const SEANCES_TONTINES_COLLECTION = 'seances_tontines';
const MEMBRES_TONTINE_COLLECTION = 'membres_tontine';

export function Tontines({ userRole }: TontinesProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isCreateSeanceDialogOpen, setIsCreateSeanceDialogOpen] = useState(false);
  const [selectedTontine, setSelectedTontine] = useState<Tontine | null>(null);
  
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [seances, setSeances] = useState<SeanceTontine[]>([]);
  const [membresTontine, setMembresTontine] = useState<MembreTontine[]>([]);

  const [formData, setFormData] = useState({
    libelle: '',
    montant_individuel: '',
    nombre_participants: '',
    frequence: '',
  });

  const [seanceFormData, setSeanceFormData] = useState({
    date_seance: '',
    beneficiaire_id: '',
  });

  // Charger les données depuis Appwrite
  useEffect(() => {
    loadTontines();
    loadMembres();
    loadSeances();
    loadMembresTontine();
  }, []);

  const loadTontines = async () => {
    try {
      const response = await databaseService.listDocuments(DATABASE_ID, TONTINES_COLLECTION);
      setTontines(response.documents as Tontine[]);
    } catch (error) {
      console.error('Erreur lors du chargement des tontines:', error);
    }
  };

  const loadMembres = async () => {
    try {
      const response = await databaseService.listDocuments(DATABASE_ID, MEMBRES_COLLECTION);
      setMembres(response.documents as Membre[]);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    }
  };

  const loadSeances = async () => {
    try {
      const response = await databaseService.listDocuments(DATABASE_ID, SEANCES_TONTINES_COLLECTION);
      setSeances(response.documents as SeanceTontine[]);
    } catch (error) {
      console.error('Erreur lors du chargement des séances:', error);
    }
  };

  const loadMembresTontine = async () => {
    try {
      const response = await databaseService.listDocuments(DATABASE_ID, MEMBRES_TONTINE_COLLECTION);
      setMembresTontine(response.documents as MembreTontine[]);
    } catch (error) {
      console.error('Erreur lors du chargement des membres de tontine:', error);
    }
  };

  const handleAddTontine = async () => {
    try {
      const newTontine = {
        libelle: formData.libelle,
        montant_individuel: parseFloat(formData.montant_individuel),
        nombre_participants: parseInt(formData.nombre_participants),
        frequence: formData.frequence,
      };

      await databaseService.createDocument(DATABASE_ID, TONTINES_COLLECTION, newTontine);
      
      setFormData({ libelle: '', montant_individuel: '', nombre_participants: '', frequence: '' });
      setIsAddDialogOpen(false);
      loadTontines(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la création de la tontine:', error);
    }
  };

  const handleDeleteTontine = async (tontineId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tontine ?')) {
      try {
        await databaseService.deleteDocument(DATABASE_ID, TONTINES_COLLECTION, tontineId);
        loadTontines(); // Recharger la liste
      } catch (error) {
        console.error('Erreur lors de la suppression de la tontine:', error);
      }
    }
  };

  const handleAddMemberToTontine = async (tontineId: string, membreId: string) => {
    try {
      const adhesionData = {
        tontine_id: tontineId,
        membre_id: membreId,
        date_adhesion: new Date().toISOString().split('T')[0],
        statut: 'actif'
      };

      await databaseService.createDocument(DATABASE_ID, MEMBRES_TONTINE_COLLECTION, adhesionData);
      setIsAddMemberDialogOpen(false);
      loadMembresTontine(); // Recharger les membres de tontine
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre à la tontine:', error);
    }
  };

  const handleCreateSeance = async () => {
    if (!selectedTontine) return;

    try {
      const seanceData = {
        tontine_id: selectedTontine.$id,
        date_seance: seanceFormData.date_seance,
        beneficiaire_id: seanceFormData.beneficiaire_id,
        montant_percu: selectedTontine.montant_individuel * selectedTontine.nombre_participants,
        statut: 'planifiee'
      };

      await databaseService.createDocument(DATABASE_ID, SEANCES_TONTINES_COLLECTION, seanceData);
      
      setSeanceFormData({ date_seance: '', beneficiaire_id: '' });
      setIsCreateSeanceDialogOpen(false);
      loadSeances(); // Recharger les séances
    } catch (error) {
      console.error('Erreur lors de la création de la séance:', error);
    }
  };

  const getFrequenceBadgeColor = (frequence: string) => {
    const colors = {
      mensuelle: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      trimestrielle: 'bg-green-100 text-green-700 hover:bg-green-200',
      semestrielle: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      annuelle: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    };
    return colors[frequence as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getMembresByTontine = (tontineId: string) => {
    return membresTontine
      .filter(mt => mt.tontine_id === tontineId)
      .map(mt => membres.find(m => m.$id === mt.membre_id))
      .filter(Boolean) as Membre[];
  };

  const getSeancesByTontine = (tontineId: string) => {
    return seances.filter(s => s.tontine_id === tontineId);
  };

  const getBeneficiaireName = (beneficiaireId: string) => {
    const membre = membres.find(m => m.$id === beneficiaireId);
    return membre ? `${membre.prenom} ${membre.nom}` : 'Inconnu';
  };

  const totalTontines = tontines.length;
  const totalMembresTontine = membresTontine.length;
  const totalMontantTontines = tontines.reduce((sum, t) => sum + (t.montant_individuel * t.nombre_participants), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Gestion des Tontines</h1>
          <p className="text-slate-600">{totalTontines} tontines actives</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="size-4 mr-2" />
              Nouvelle Tontine
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tontine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="libelle">Libellé de la tontine</Label>
                <Input
                  id="libelle"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  placeholder="Nom de la tontine"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="montant_individuel">Montant individuel (€)</Label>
                <Input
                  id="montant_individuel"
                  type="number"
                  value={formData.montant_individuel}
                  onChange={(e) => setFormData({ ...formData, montant_individuel: e.target.value })}
                  placeholder="500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre_participants">Nombre de participants</Label>
                <Input
                  id="nombre_participants"
                  type="number"
                  value={formData.nombre_participants}
                  onChange={(e) => setFormData({ ...formData, nombre_participants: e.target.value })}
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequence">Fréquence</Label>
                <Select value={formData.frequence} onValueChange={(value) => setFormData({ ...formData, frequence: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une fréquence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensuelle">Mensuelle</SelectItem>
                    <SelectItem value="trimestrielle">Trimestrielle</SelectItem>
                    <SelectItem value="semestrielle">Semestrielle</SelectItem>
                    <SelectItem value="annuelle">Annuelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleAddTontine}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!formData.libelle || !formData.montant_individuel || !formData.nombre_participants || !formData.frequence}
                >
                  Créer la tontine
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Tontines</p>
                <p className="text-2xl text-slate-900">{totalTontines}</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <Coins className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Participants Total</p>
                <p className="text-2xl text-emerald-600">{totalMembresTontine}</p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-lg">
                <Users className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Montant Total</p>
                <p className="text-2xl text-slate-900">{totalMontantTontines}€</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <TrendingUp className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tontines Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Coins className="size-5 text-indigo-600" />
            Liste des Tontines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Libellé</TableHead>
                  <TableHead>Montant Individuel</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead>Montant Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tontines.map((tontine) => (
                  <TableRow key={tontine.$id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{tontine.libelle}</TableCell>
                    <TableCell className="text-slate-600">{tontine.montant_individuel}€</TableCell>
                    <TableCell className="text-slate-600">{tontine.nombre_participants}</TableCell>
                    <TableCell>
                      <Badge className={getFrequenceBadgeColor(tontine.frequence)}>
                        {tontine.frequence}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-900 font-semibold">
                      {tontine.montant_individuel * tontine.nombre_participants}€
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTontine(tontine);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTontine(tontine);
                            setIsAddMemberDialogOpen(true);
                          }}
                        >
                          <UserPlus className="size-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteTontine(tontine.$id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour afficher les détails d'une tontine */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la tontine: {selectedTontine?.libelle}</DialogTitle>
            <DialogDescription>
              Informations complètes sur la tontine et ses séances
            </DialogDescription>
          </DialogHeader>
          
          {selectedTontine && (
            <div className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Montant individuel</p>
                  <p className="font-semibold">{selectedTontine.montant_individuel}€</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Participants</p>
                  <p className="font-semibold">{selectedTontine.nombre_participants}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Fréquence</p>
                  <Badge className={getFrequenceBadgeColor(selectedTontine.frequence)}>
                    {selectedTontine.frequence}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Montant total</p>
                  <p className="font-semibold text-indigo-600">
                    {selectedTontine.montant_individuel * selectedTontine.nombre_participants}€
                  </p>
                </div>
              </div>

              {/* Membres de la tontine */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Membres participants</h4>
                  <Button
                    size="sm"
                    onClick={() => setIsAddMemberDialogOpen(true)}
                  >
                    <UserPlus className="size-4 mr-1" />
                    Ajouter un membre
                  </Button>
                </div>
                <div className="space-y-2">
                  {getMembresByTontine(selectedTontine.$id).map((membre) => (
                    <div key={membre.$id} className="flex items-center justify-between p-2 bg-white border rounded">
                      <span>{membre.prenom} {membre.nom}</span>
                      <Badge variant="outline">Actif</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Séances de tontine */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Séances de tontine</h4>
                  <Button
                    size="sm"
                    onClick={() => setIsCreateSeanceDialogOpen(true)}
                  >
                    <Calendar className="size-4 mr-1" />
                    Créer une séance
                  </Button>
                </div>
                <div className="space-y-2">
                  {getSeancesByTontine(selectedTontine.$id).map((seance) => (
                    <div key={seance.$id} className="p-3 bg-white border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {new Date(seance.date_seance).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm text-slate-600">
                            Bénéficiaire: {getBeneficiaireName(seance.beneficiaire_id)}
                          </p>
                        </div>
                        <Badge className={
                          seance.statut === 'terminee' ? 'bg-green-100 text-green-700' :
                          seance.statut === 'planifiee' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {seance.statut}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2">
                        Montant perçu: <span className="font-semibold">{seance.montant_percu}€</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter un membre à une tontine */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ajouter un membre à la tontine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="membre">Sélectionner un membre</Label>
              <Select onValueChange={(membreId) => {
                if (selectedTontine) {
                  handleAddMemberToTontine(selectedTontine.$id, membreId);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un membre" />
                </SelectTrigger>
                <SelectContent>
                  {membres.map((membre) => (
                    <SelectItem key={membre.$id} value={membre.$id}>
                      {membre.prenom} {membre.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour créer une séance */}
      <Dialog open={isCreateSeanceDialogOpen} onOpenChange={setIsCreateSeanceDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Créer une séance de tontine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date_seance">Date de la séance</Label>
              <Input
                id="date_seance"
                type="date"
                value={seanceFormData.date_seance}
                onChange={(e) => setSeanceFormData({ ...seanceFormData, date_seance: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiaire">Bénéficiaire</Label>
              <Select 
                value={seanceFormData.beneficiaire_id} 
                onValueChange={(value) => setSeanceFormData({ ...seanceFormData, beneficiaire_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le bénéficiaire" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTontine && getMembresByTontine(selectedTontine.$id).map((membre) => (
                    <SelectItem key={membre.$id} value={membre.$id}>
                      {membre.prenom} {membre.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleCreateSeance}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={!seanceFormData.date_seance || !seanceFormData.beneficiaire_id}
            >
              Créer la séance
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}