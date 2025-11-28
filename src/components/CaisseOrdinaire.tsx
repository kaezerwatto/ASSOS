import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Minus, Wallet, TrendingUp, TrendingDown, Calendar, MapPin } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { databaseService } from '../lib/appwrite-service';

// Types de base
interface Seance {
  $id: string;
  date_seance: string;
  lieu_seance: string;
  heure_debut?: string;
  type: 'inaugurale' | 'ordinaire' | 'extraordinaire';
  nouvelles_membres?: string;
  resolutions?: string;
  $createdAt: string;
}

interface Membre {
  $id: string;
  nom: string;
  prenoms: string;
  date_inscription: string;
  lieu_residence: string;
  telephone: string;
  email?: string;
  photo?: string;
  statut: 'actif(ve)' | 'suspendu(e)' | 'exclu(e)' | 'demissionnaire' | 'desactive(e)';
  role: 'membre' | 'tresorier' | 'president' | 'commissaire_aux_comptes' | 'secretaire_general';
}

interface Entree {
  $id: string;
  seance_id: string;
  membre_id?: string;
  date_donateur?: string;
  type: 'don anonyme' | 'don public' | 'recouvrement aide' | 'inscription' | 'maintenance tontine' | 'fonds caisse';
  nom_donateur?: string;
  montant: number;
  mode_paiement: 'espèces' | 'Mbway' | 'mixte';
  $createdAt: string;
}

interface Sortie {
  $id: string;
  type: 'aide décès mère' | 'aide décès père' | 'aide maladie' | 'aide naissance' | 'aide mariage' | 'frais entretien salle' | 'frais repas' | 'frais boisson' | 'dépense bureau' | 'dépense statutaire';
  montant: number;
  mode_paiement: 'espèces' | 'Mbway' | 'mixte';
  date_aide?: string;
  $createdAt: string;
}

interface CaisseProps {
  userRole: 'admin' | 'tresorier';
}

// IDs de la base de données Appwrite
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '69243fec00044331ef75';
const MEMBRES_COLLECTION = 'membres';
const SEANCES_COLLECTION = 'seances';
const ENTREES_COLLECTION = 'entrees';
const SORTIES_COLLECTION = 'sorties';

export function CaisseOrdinaire({ userRole }: CaisseProps) {
  const [isAddEntreeDialogOpen, setIsAddEntreeDialogOpen] = useState(false);
  const [isAddSortieDialogOpen, setIsAddSortieDialogOpen] = useState(false);
  const [isAddSeanceDialogOpen, setIsAddSeanceDialogOpen] = useState(false);
  
  const [seances, setSeances] = useState<Seance[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [entrees, setEntrees] = useState<Entree[]>([]);
  const [sorties, setSorties] = useState<Sortie[]>([]);

  const [entreeFormData, setEntreeFormData] = useState({
    seance_id: '',
    membre_id: '',
    date_donateur: '',
    type: '',
    nom_donateur: '',
    montant: '',
    mode_paiement: '',
  });

  const [sortieFormData, setSortieFormData] = useState({
    type: '',
    montant: '',
    mode_paiement: '',
    date_aide: '',
  });

  const [seanceFormData, setSeanceFormData] = useState({
    date_seance: '',
    lieu_seance: '',
    heure_debut: '',
    type: 'ordinaire',
    nouvelles_membres: '',
    resolutions: '',
  });

  // Charger les données depuis Appwrite
  useEffect(() => {
    loadSeances();
    loadMembres();
    loadEntrees();
    loadSorties();
  }, []);

  const loadSeances = async () => {
    try {
      const response = await databaseService.listDocuments(DATABASE_ID, SEANCES_COLLECTION);
      setSeances(response.documents as Seance[]);
    } catch (error) {
      console.error('Erreur lors du chargement des séances:', error);
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

  const loadEntrees = async () => {
    try {
      const response = await databaseService.listDocuments(DATABASE_ID, ENTREES_COLLECTION);
      setEntrees(response.documents as Entree[]);
    } catch (error) {
      console.error('Erreur lors du chargement des entrées:', error);
    }
  };

  const loadSorties = async () => {
    try {
      const response = await databaseService.listDocuments(DATABASE_ID, SORTIES_COLLECTION);
      setSorties(response.documents as Sortie[]);
    } catch (error) {
      console.error('Erreur lors du chargement des sorties:', error);
    }
  };

  const handleAddEntree = async () => {
    try {
      const entreeData: any = {
        seances: entreeFormData.seance_id,
        type: entreeFormData.type,
        montant: parseFloat(entreeFormData.montant),
        mode_paiement: entreeFormData.mode_paiement,
      };

      // Ajouter les champs conditionnels
      if (entreeFormData.membre_id) {
        entreeData.membres = entreeFormData.membre_id;
      }
      if (entreeFormData.date_donateur) {
        entreeData.date_donation = entreeFormData.date_donateur;
      }
      if (entreeFormData.nom_donateur) {
        entreeData.nom_donateur = entreeFormData.nom_donateur;
      }

      await databaseService.createDocument(DATABASE_ID, ENTREES_COLLECTION, entreeData);
      
      setEntreeFormData({
        seance_id: '', membre_id: '', date_donateur: '', type: '', 
        nom_donateur: '', montant: '', mode_paiement: ''
      });
      setIsAddEntreeDialogOpen(false);
      loadEntrees();
    } catch (error) {
      console.error('Erreur lors de la création de l\'entrée:', error);
    }
  };

  const handleAddSortie = async () => {
    try {
      const sortieData: any = {
        type: sortieFormData.type,
        montant: parseFloat(sortieFormData.montant),
        mode_paiement: sortieFormData.mode_paiement,
      };

      if (sortieFormData.date_aide) {
        sortieData.date_aide = sortieFormData.date_aide;
      }

      await databaseService.createDocument(DATABASE_ID, SORTIES_COLLECTION, sortieData);
      
      setSortieFormData({ type: '', montant: '', mode_paiement: '', date_aide: '' });
      setIsAddSortieDialogOpen(false);
      loadSorties();
    } catch (error) {
      console.error('Erreur lors de la création de la sortie:', error);
    }
  };

  const handleAddSeance = async () => {
    try {
      const seanceData: any = {
        date_seance: seanceFormData.date_seance,
        lieu_seance: seanceFormData.lieu_seance,
        type: seanceFormData.type,
      };

      if (seanceFormData.heure_debut) {
        seanceData.heure_debut = seanceFormData.heure_debut;
      }
      if (seanceFormData.nouvelles_membres) {
        seanceData.nouvelles_membres = seanceFormData.nouvelles_membres;
      }
      if (seanceFormData.resolutions) {
        seanceData.resolutions = seanceFormData.resolutions;
      }

      await databaseService.createDocument(DATABASE_ID, SEANCES_COLLECTION, seanceData);
      
      setSeanceFormData({
        date_seance: '', lieu_seance: '', heure_debut: '', type: 'ordinaire',
        nouvelles_membres: '', resolutions: ''
      });
      setIsAddSeanceDialogOpen(false);
      loadSeances();
    } catch (error) {
      console.error('Erreur lors de la création de la séance:', error);
    }
  };

  // Calculs des totaux
  const totalEntrees = entrees.reduce((sum, entree) => sum + entree.montant, 0);
  const totalSorties = sorties.reduce((sum, sortie) => sum + sortie.montant, 0);
  const soldeCaisse = totalEntrees - totalSorties;

  // Entrées par séance
  const getEntreesBySeance = (seanceId: string) => {
    return entrees.filter(entree => entree.seance_id === seanceId);
  };

  const getSeanceInfo = (seanceId: string) => {
    return seances.find(seance => seance.$id === seanceId);
  };

  const getMembreInfo = (membreId: string) => {
    const membre = membres.find(m => m.$id === membreId);
    return membre ? `${membre.prenoms} ${membre.nom}` : 'Inconnu';
  };

  const getTypeEntreeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'don anonyme': 'Don anonyme',
      'don public': 'Don public',
      'recouvrement aide': 'Recouvrement aide',
      'inscription': 'Inscription',
      'maintenance tontine': 'Maintenance tontine',
      'fonds caisse': 'Fonds caisse'
    };
    return labels[type] || type;
  };

  const getTypeSortieLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'aide décès mère': 'Aide décès mère',
      'aide décès père': 'Aide décès père',
      'aide maladie': 'Aide maladie',
      'aide naissance': 'Aide naissance',
      'aide mariage': 'Aide mariage',
      'frais entretien salle': 'Frais entretien',
      'frais repas': 'Frais repas',
      'frais boisson': 'Frais boisson',
      'dépense bureau': 'Dépense bureau',
      'dépense statutaire': 'Dépense statutaire'
    };
    return labels[type] || type;
  };

  const getModePaiementBadge = (mode: string) => {
    const colors = {
      'espèces': 'bg-green-100 text-green-700',
      'Mbway': 'bg-blue-100 text-blue-700',
      'mixte': 'bg-purple-100 text-purple-700'
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getSeanceTypeBadge = (type: string) => {
    const colors = {
      'inaugurale': 'bg-purple-100 text-purple-700',
      'ordinaire': 'bg-blue-100 text-blue-700',
      'extraordinaire': 'bg-orange-100 text-orange-700'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Gestion de la Caisse</h1>
          <p className="text-slate-600">{seances.length} séances enregistrées</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddSeanceDialogOpen} onOpenChange={setIsAddSeanceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <Calendar className="size-4 mr-2" />
                Nouvelle Séance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle séance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="heure_debut">Heure de début</Label>
                    <Input
                      id="heure_debut"
                      type="time"
                      value={seanceFormData.heure_debut}
                      onChange={(e) => setSeanceFormData({ ...seanceFormData, heure_debut: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lieu_seance">Lieu de la séance</Label>
                  <Input
                    id="lieu_seance"
                    value={seanceFormData.lieu_seance}
                    onChange={(e) => setSeanceFormData({ ...seanceFormData, lieu_seance: e.target.value })}
                    placeholder="Lieu de la réunion"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type_seance">Type de séance</Label>
                  <Select value={seanceFormData.type} onValueChange={(value) => setSeanceFormData({ ...seanceFormData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de séance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordinaire">Ordinaire</SelectItem>
                      <SelectItem value="inaugurale">Inaugurale</SelectItem>
                      <SelectItem value="extraordinaire">Extraordinaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nouvelles_membres">Nouveaux membres</Label>
                  <Textarea
                    id="nouvelles_membres"
                    value={seanceFormData.nouvelles_membres}
                    onChange={(e) => setSeanceFormData({ ...seanceFormData, nouvelles_membres: e.target.value })}
                    placeholder="Liste des nouveaux membres..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolutions">Résolutions</Label>
                  <Textarea
                    id="resolutions"
                    value={seanceFormData.resolutions}
                    onChange={(e) => setSeanceFormData({ ...seanceFormData, resolutions: e.target.value })}
                    placeholder="Résolutions prises..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button
                    onClick={handleAddSeance}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={!seanceFormData.date_seance || !seanceFormData.lieu_seance}
                  >
                    Créer la séance
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddSeanceDialogOpen(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddEntreeDialogOpen} onOpenChange={setIsAddEntreeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="size-4 mr-2" />
                Nouvelle Entrée
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Enregistrer une entrée en caisse</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="seance_entree">Séance liée</Label>
                  <Select value={entreeFormData.seance_id} onValueChange={(value) => setEntreeFormData({ ...entreeFormData, seance_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une séance" />
                    </SelectTrigger>
                    <SelectContent>
                      {seances.map((seance) => (
                        <SelectItem key={seance.$id} value={seance.$id}>
                          {new Date(seance.date_seance).toLocaleDateString('fr-FR')} - {seance.lieu_seance}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type_entree">Type d'entrée</Label>
                  <Select value={entreeFormData.type} onValueChange={(value) => setEntreeFormData({ ...entreeFormData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type d'entrée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="don anonyme">Don anonyme</SelectItem>
                      <SelectItem value="don public">Don public</SelectItem>
                      <SelectItem value="recouvrement aide">Recouvrement aide</SelectItem>
                      <SelectItem value="inscription">Inscription</SelectItem>
                      <SelectItem value="maintenance tontine">Maintenance tontine</SelectItem>
                      <SelectItem value="fonds caisse">Fonds caisse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(entreeFormData.type === 'recouvrement aide' || entreeFormData.type === 'inscription') && (
                  <div className="space-y-2">
                    <Label htmlFor="membre_entree">Membre</Label>
                    <Select value={entreeFormData.membre_id} onValueChange={(value) => setEntreeFormData({ ...entreeFormData, membre_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un membre" />
                      </SelectTrigger>
                      <SelectContent>
                        {membres.filter(m => m.statut === 'actif(ve)').map((membre) => (
                          <SelectItem key={membre.$id} value={membre.$id}>
                            {membre.prenoms} {membre.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(entreeFormData.type === 'don anonyme' || entreeFormData.type === 'don public') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date_donateur">Date du don</Label>
                      <Input
                        id="date_donateur"
                        type="date"
                        value={entreeFormData.date_donateur}
                        onChange={(e) => setEntreeFormData({ ...entreeFormData, date_donateur: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nom_donateur">Nom du donateur</Label>
                      <Input
                        id="nom_donateur"
                        value={entreeFormData.nom_donateur}
                        onChange={(e) => setEntreeFormData({ ...entreeFormData, nom_donateur: e.target.value })}
                        placeholder="Nom du donateur"
                        disabled={entreeFormData.type === 'don anonyme'}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="montant_entree">Montant (€)</Label>
                  <Input
                    id="montant_entree"
                    type="number"
                    value={entreeFormData.montant}
                    onChange={(e) => setEntreeFormData({ ...entreeFormData, montant: e.target.value })}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode_paiement_entree">Mode de paiement</Label>
                  <Select value={entreeFormData.mode_paiement} onValueChange={(value) => setEntreeFormData({ ...entreeFormData, mode_paiement: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="espèces">Espèce</SelectItem>
                      <SelectItem value="Mbway">Mbway</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={handleAddEntree}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={!entreeFormData.seance_id || !entreeFormData.type || !entreeFormData.montant || !entreeFormData.mode_paiement}
                  >
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddEntreeDialogOpen(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddSortieDialogOpen} onOpenChange={setIsAddSortieDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Minus className="size-4 mr-2" />
                Nouvelle Sortie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Enregistrer une sortie de caisse</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="type_sortie">Type de sortie</Label>
                  <Select value={sortieFormData.type} onValueChange={(value) => setSortieFormData({ ...sortieFormData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type de sortie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aide décès mère">Aide décès mère</SelectItem>
                      <SelectItem value="aide décès père">Aide décès père</SelectItem>
                      <SelectItem value="aide maladie">Aide maladie</SelectItem>
                      <SelectItem value="aide naissance">Aide naissance</SelectItem>
                      <SelectItem value="aide mariage">Aide mariage</SelectItem>
                      <SelectItem value="frais entretien salle">Frais entretien</SelectItem>
                      <SelectItem value="frais repas">Frais repas</SelectItem>
                      <SelectItem value="frais boisson">Frais boisson</SelectItem>
                      <SelectItem value="dépense bureau">Dépense bureau</SelectItem>
                      <SelectItem value="dépense statutaire">Dépense statutaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(sortieFormData.type.includes('aide_')) && (
                  <div className="space-y-2">
                    <Label htmlFor="date_aide">Date de l'aide</Label>
                    <Input
                      id="date_aide"
                      type="date"
                      value={sortieFormData.date_aide}
                      onChange={(e) => setSortieFormData({ ...sortieFormData, date_aide: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="montant_sortie">Montant (€)</Label>
                  <Input
                    id="montant_sortie"
                    type="number"
                    value={sortieFormData.montant}
                    onChange={(e) => setSortieFormData({ ...sortieFormData, montant: e.target.value })}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode_paiement_sortie">Mode de paiement</Label>
                  <Select value={sortieFormData.mode_paiement} onValueChange={(value) => setSortieFormData({ ...sortieFormData, mode_paiement: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="espèces">Espèce</SelectItem>
                      <SelectItem value="Mbway">Mbway</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={handleAddSortie}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={!sortieFormData.type || !sortieFormData.montant || !sortieFormData.mode_paiement}
                  >
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddSortieDialogOpen(false)}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Entrées</p>
                <p className="text-2xl text-green-600">{totalEntrees}€</p>
              </div>
              <div className="p-3 bg-green-500 rounded-lg">
                <TrendingUp className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Sorties</p>
                <p className="text-2xl text-red-600">{totalSorties}€</p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <TrendingDown className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Solde Caisse</p>
                <p className={`text-2xl ${soldeCaisse >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {soldeCaisse}€
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <Wallet className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Séances</p>
                <p className="text-2xl text-purple-600">{seances.length}</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <Calendar className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des séances avec entrées/sorties */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Calendar className="size-5 text-indigo-600" />
            Mouvements de Caisse par Séance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Séance</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entrées</TableHead>
                  <TableHead>Sorties</TableHead>
                  <TableHead>Solde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seances.map((seance) => {
                  const entreesSeance = getEntreesBySeance(seance.$id);
                  const totalEntreesSeance = entreesSeance.reduce((sum, entree) => sum + entree.montant, 0);
                  // Pour les sorties, on considère qu'elles ne sont pas liées à une séance spécifique
                  const soldeSeance = totalEntreesSeance;

                  return (
                    <TableRow key={seance.$id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {new Date(seance.date_seance).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {seance.lieu_seance}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeanceTypeBadge(seance.type)}>
                          {seance.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        +{totalEntreesSeance}€
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        -{/* Les sorties ne sont pas liées aux séances */}
                      </TableCell>
                      <TableCell className={`font-semibold ${soldeSeance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {soldeSeance}€
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Détails des entrées */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <TrendingUp className="size-5 text-green-600" />
            Détail des Entrées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Séance</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Paiement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entrees.map((entree) => {
                  const seance = getSeanceInfo(entree.seance_id);
                  return (
                    <TableRow key={entree.$id} className="hover:bg-slate-50">
                      <TableCell className="text-slate-600">
                        {new Date(entree.$createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {seance ? `${new Date(seance.date_seance).toLocaleDateString('fr-FR')} - ${seance.lieu_seance}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          {getTypeEntreeLabel(entree.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {entree.membre_id ? getMembreInfo(entree.membre_id) : 
                         entree.nom_donateur || 'Non spécifié'}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        +{entree.montant}€
                      </TableCell>
                      <TableCell>
                        <Badge className={getModePaiementBadge(entree.mode_paiement)}>
                          {entree.mode_paiement}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Détails des sorties */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <TrendingDown className="size-5 text-red-600" />
            Détail des Sorties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Date aide</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorties.map((sortie) => (
                  <TableRow key={sortie.$id} className="hover:bg-slate-50">
                    <TableCell className="text-slate-600">
                      {new Date(sortie.$createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-red-200 text-red-700">
                        {getTypeSortieLabel(sortie.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      -{sortie.montant}€
                    </TableCell>
                    <TableCell>
                      <Badge className={getModePaiementBadge(sortie.mode_paiement)}>
                        {sortie.mode_paiement}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {sortie.date_aide ? new Date(sortie.date_aide).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
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