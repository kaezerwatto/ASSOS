import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, GraduationCap, TrendingUp, Wallet, Users, Calendar, ArrowUp, ArrowDown, ChevronUp, ChevronDown } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { databaseService } from '../lib/appwrite-service';

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
  statut: 'actif(ve)' | 'suspendu(e)' | 'exclu(e)' | 'démissionnaire' | 'désactive(e)';
  role: 'membre' | 'trésorier' | 'président' | 'commissaire aux comptes' | 'secrétaire général';
}

interface EmpruntScolaire {
  $id: string;
  seance_id: string;
  date_emprunt: string;
  membre_id: string;
  montant: number;
  taux_interet: number;
  valeur_interet: number;
  mode_paiement: 'espèce' | 'mbway' | 'mixte';
  delai_remboursement: string;
  statut: 'en_cours' | 'rembourse';
  $createdAt: string;
}

interface EntreeScolaire {
  $id: string;
  seance_id: string;
  membre_id: string;
  type: 'dépôt' | 'remboursement';
  date_remboursement?: string;
  emprunt_rembourse_id?: string;
  qualite_remboursement?: 'emprunt' | 'intérêt' | 'les deux';
  type_remboursement?: 'globale' | 'partielle' | 'solde';
  montant: number;
  mode_paiement: 'espèce' | 'mbway' | 'mixte';
  $createdAt: string;
}

interface CaisseScolaireProps {
  userRole: 'admin' | 'tresorier';
}

// IDs de la base de données Appwrite
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '69243fec00044331ef75';
const SEANCES_COLLECTION = 'seances';
const MEMBRES_COLLECTION = 'membres';
const EMPRUNTS_SCOLAIRES_COLLECTION = 'emprunt_scolaire';
const ENTREES_SCOLAIRES_COLLECTION = 'entrees_scolaire';

type SortField = 'date_seance' | 'lieu_seance' | 'type';
type SortDirection = 'asc' | 'desc';

export function CaisseScolaire({ userRole }: CaisseScolaireProps) {
  const [isAddEntreeDialogOpen, setIsAddEntreeDialogOpen] = useState(false);
  const [isAddEmpruntDialogOpen, setIsAddEmpruntDialogOpen] = useState(false);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [emprunts, setEmprunts] = useState<EmpruntScolaire[]>([]);
  const [entrees, setEntrees] = useState<EntreeScolaire[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [sortField, setSortField] = useState<SortField>('date_seance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [entreeFormData, setEntreeFormData] = useState({
    seance_id: '',
    membre_id: '',
    type: 'dépôt',
    montant: '',
    mode_paiement: 'espèce',
    date_remboursement: '',
    emprunt_rembourse_id: '',
    qualite_remboursement: 'emprunt',
    type_remboursement: 'globale'
  });

  const [empruntFormData, setEmpruntFormData] = useState({
    seance_id: '',
    membre_id: '',
    montant: '',
    taux_interet: '10',
    mode_paiement: 'espèce',
    delai_remboursement: ''
  });

  // Charger les données depuis Appwrite
  useEffect(() => {
    loadSeances();
    loadMembres();
    loadEmprunts();
    loadEntrees();
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

  const loadEmprunts = async () => {
    try {
      const response = await databaseService.listDocuments(DATABASE_ID, EMPRUNTS_SCOLAIRES_COLLECTION);
      setEmprunts(response.documents as EmpruntScolaire[]);
    } catch (error) {
      console.error('Erreur lors du chargement des emprunts:', error);
    }
  };

  const loadEntrees = async () => {
    try {
      const response = await databaseService.listDocuments(DATABASE_ID, ENTREES_SCOLAIRES_COLLECTION);
      setEntrees(response.documents as EntreeScolaire[]);
    } catch (error) {
      console.error('Erreur lors du chargement des entrées:', error);
    }
  };

  const handleAddEntree = async () => {
    try {
      const entreeData: any = {
        seances: entreeFormData.seance_id,
        membres: entreeFormData.membre_id,
        type: entreeFormData.type,
        montant: parseFloat(entreeFormData.montant),
        mode_paiement: entreeFormData.mode_paiement
      };

      // Ajouter les champs spécifiques aux remboursements
      if (entreeFormData.type === 'remboursement') {
        entreeData.date_remboursement = entreeFormData.date_remboursement;
        entreeData.emprunt_rembourse_id = entreeFormData.emprunt_rembourse_id;
        entreeData.qualite_remboursement = entreeFormData.qualite_remboursement;
        entreeData.type_remboursement = entreeFormData.type_remboursement;
      }

      await databaseService.createDocument(DATABASE_ID, ENTREES_SCOLAIRES_COLLECTION, entreeData);
      
      setEntreeFormData({
        seance_id: '',
        membre_id: '',
        type: 'dépôt',
        montant: '',
        mode_paiement: 'espèce',
        date_remboursement: '',
        emprunt_rembourse_id: '',
        qualite_remboursement: 'emprunt',
        type_remboursement: 'globale'
      });
      setIsAddEntreeDialogOpen(false);
      loadEntrees();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'entrée:', error);
    }
  };

  const handleAddEmprunt = async () => {
    try {
      const montant = parseFloat(empruntFormData.montant);
      const tauxInteret = parseFloat(empruntFormData.taux_interet);
      const valeurInteret = (montant * tauxInteret) / 100;

      const empruntData = {
        seances: empruntFormData.seance_id,
        membres: empruntFormData.membre_id,
        date_emprunt: new Date().toISOString().split('T')[0],
        montant: montant,
        taux_interet: tauxInteret,
        valeur_interet: valeurInteret,
        mode_paiement: empruntFormData.mode_paiement,
        delai_remboursement: empruntFormData.delai_remboursement,
      };

      await databaseService.createDocument(DATABASE_ID, EMPRUNTS_SCOLAIRES_COLLECTION, empruntData);
      
      setEmpruntFormData({
        seance_id: '',
        membre_id: '',
        montant: '',
        taux_interet: '10',
        mode_paiement: 'espèce',
        delai_remboursement: ''
      });
      setIsAddEmpruntDialogOpen(false);
      loadEmprunts();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'emprunt:', error);
    }
  };

  // Obtenir les années disponibles (3 dernières années + année en cours)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];
    return years.sort((a, b) => b - a); // Tri décroissant
  };

  // Obtenir les séances de l'année sélectionnée
  const getSeancesByYear = (year: number) => {
    return seances.filter(seance => {
      const seanceYear = new Date(seance.date_seance).getFullYear();
      return seanceYear === year;
    });
  };

  // Calculer les statistiques par séance
  const getSeanceStats = (seanceId: string) => {
    const entreesSeance = entrees.filter(e => e.seance_id === seanceId);
    const empruntsSeance = emprunts.filter(e => e.seance_id === seanceId);

    const totalEntrees = entreesSeance.reduce((sum, e) => sum + e.montant, 0);
    const totalSorties = empruntsSeance.reduce((sum, e) => sum + e.montant, 0);
    const solde = totalEntrees - totalSorties;

    return { totalEntrees, totalSorties, solde };
  };

  // Calculer les statistiques pour l'année sélectionnée
  const getYearStats = (year: number) => {
    const seancesOfYear = getSeancesByYear(year);
    let totalEntrees = 0;
    let totalEmprunts = 0;
    let totalInterets = 0;

    seancesOfYear.forEach(seance => {
      const stats = getSeanceStats(seance.$id);
      totalEntrees += stats.totalEntrees;
      totalEmprunts += stats.totalSorties;
      
      // Calcul des intérêts pour les emprunts de l'année
      const empruntsSeance = emprunts.filter(e => e.seance_id === seance.$id);
      totalInterets += empruntsSeance.reduce((sum, e) => sum + e.valeur_interet, 0);
    });

    return { totalEntrees, totalEmprunts, totalInterets };
  };

  // Obtenir le nom d'un membre
  const getMembreName = (membreId: string) => {
    const membre = membres.find(m => m.$id === membreId);
    return membre ? `${membre.prenoms} ${membre.nom}` : 'Inconnu';
  };

  // Obtenir les détails d'une séance
  const getSeanceDetails = (seanceId: string) => {
    return seances.find(s => s.$id === seanceId);
  };

  // Statistiques globales (toutes années confondues pour le solde)
  const totalEntreesGlobal = entrees.reduce((sum, e) => sum + e.montant, 0);
  const totalEmpruntsGlobal = emprunts.reduce((sum, e) => sum + e.montant, 0);
  const totalInteretsGlobal = emprunts.reduce((sum, e) => sum + e.valeur_interet, 0);
  const soldeGlobal = totalEntreesGlobal - totalEmpruntsGlobal;

  // Statistiques de l'année en cours pour les widgets
  const currentYearStats = getYearStats(selectedYear);

  // Tri des séances
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedSeances = (seancesToSort: Seance[]) => {
    return [...seancesToSort].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date_seance') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getTypeSeanceBadgeColor = (type: string) => {
    const colors = {
      inaugurale: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      ordinaire: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      extraordinaire: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatutBadgeColor = (solde: number) => {
    return solde >= 0 
      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
      : 'bg-red-100 text-red-700 hover:bg-red-200';
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />;
  };

  const seancesOfSelectedYear = getSeancesByYear(selectedYear);
  const sortedSeances = getSortedSeances(seancesOfSelectedYear);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Caisse Scolaire</h1>
          <p className="text-slate-600">Gestion des finances de la caisse scolaire</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddEntreeDialogOpen} onOpenChange={setIsAddEntreeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <ArrowUp className="size-4 mr-2" />
                Nouvelle Entrée
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Enregistrer une nouvelle entrée</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="seance_entree">Séance</Label>
                  <Select 
                    value={entreeFormData.seance_id} 
                    onValueChange={(value) => setEntreeFormData({ ...entreeFormData, seance_id: value })}
                  >
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
                  <Label htmlFor="membre_entree">Membre</Label>
                  <Select 
                    value={entreeFormData.membre_id} 
                    onValueChange={(value) => setEntreeFormData({ ...entreeFormData, membre_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un membre" />
                    </SelectTrigger>
                    <SelectContent>
                      {membres.map((membre) => (
                        <SelectItem key={membre.$id} value={membre.$id}>
                          {membre.prenoms} {membre.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type_entree">Type d'entrée</Label>
                  <Select 
                    value={entreeFormData.type} 
                    onValueChange={(value: 'dépôt' | 'remboursement') => setEntreeFormData({ ...entreeFormData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dépôt">Dépôt</SelectItem>
                      <SelectItem value="remboursement">Remboursement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {entreeFormData.type === 'remboursement' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="date_remboursement">Date de remboursement</Label>
                      <Input
                        id="date_remboursement"
                        type="date"
                        value={entreeFormData.date_remboursement}
                        onChange={(e) => setEntreeFormData({ ...entreeFormData, date_remboursement: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emprunt_rembourse">Emprunt remboursé</Label>
                      <Select 
                        value={entreeFormData.emprunt_rembourse_id} 
                        onValueChange={(value) => setEntreeFormData({ ...entreeFormData, emprunt_rembourse_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un emprunt" />
                        </SelectTrigger>
                        <SelectContent>
                          {emprunts.filter(e => e.statut === 'en_cours').map((emprunt) => (
                            <SelectItem key={emprunt.$id} value={emprunt.$id}>
                              {getMembreName(emprunt.membre_id)} - {emprunt.montant}€
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="qualite_remboursement">Qualité du remboursement</Label>
                        <Select 
                          value={entreeFormData.qualite_remboursement} 
                          onValueChange={(value: 'emprunt' | 'intérêt' | 'les deux') => setEntreeFormData({ ...entreeFormData, qualite_remboursement: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emprunt">Emprunt</SelectItem>
                            <SelectItem value="intérêt">Intérêt</SelectItem>
                            <SelectItem value="les deux">Les deux</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type_remboursement">Type de remboursement</Label>
                        <Select 
                          value={entreeFormData.type_remboursement} 
                          onValueChange={(value: 'globale' | 'partielle' | 'solde') => setEntreeFormData({ ...entreeFormData, type_remboursement: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="globale">Globale</SelectItem>
                            <SelectItem value="partielle">Partielle</SelectItem>
                            <SelectItem value="solde">Solde</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="montant_entree">Montant (€)</Label>
                  <Input
                    id="montant_entree"
                    type="number"
                    value={entreeFormData.montant}
                    onChange={(e) => setEntreeFormData({ ...entreeFormData, montant: e.target.value })}
                    placeholder="500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode_paiement_entree">Mode de paiement</Label>
                  <Select 
                    value={entreeFormData.mode_paiement} 
                    onValueChange={(value: 'espèce' | 'mbway' | 'mixte') => setEntreeFormData({ ...entreeFormData, mode_paiement: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="espèce">Espèce</SelectItem>
                      <SelectItem value="mbway">Mbway</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={handleAddEntree}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
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

          <Dialog open={isAddEmpruntDialogOpen} onOpenChange={setIsAddEmpruntDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <ArrowDown className="size-4 mr-2" />
                Nouvel Emprunt
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Enregistrer un nouvel emprunt scolaire</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="seance_emprunt">Séance</Label>
                  <Select 
                    value={empruntFormData.seance_id} 
                    onValueChange={(value) => setEmpruntFormData({ ...empruntFormData, seance_id: value })}
                  >
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
                  <Label htmlFor="membre_emprunt">Membre emprunteur</Label>
                  <Select 
                    value={empruntFormData.membre_id} 
                    onValueChange={(value) => setEmpruntFormData({ ...empruntFormData, membre_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un membre" />
                    </SelectTrigger>
                    <SelectContent>
                      {membres.map((membre) => (
                        <SelectItem key={membre.$id} value={membre.$id}>
                          {membre.prenoms} {membre.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="montant_emprunt">Montant du prêt (€)</Label>
                  <Input
                    id="montant_emprunt"
                    type="number"
                    value={empruntFormData.montant}
                    onChange={(e) => setEmpruntFormData({ ...empruntFormData, montant: e.target.value })}
                    placeholder="800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taux_interet">Taux d'intérêt (%)</Label>
                  <Input
                    id="taux_interet"
                    type="number"
                    value={empruntFormData.taux_interet}
                    onChange={(e) => setEmpruntFormData({ ...empruntFormData, taux_interet: e.target.value })}
                    placeholder="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delai_remboursement">Délai de remboursement</Label>
                  <Input
                    id="delai_remboursement"
                    type="date"
                    value={empruntFormData.delai_remboursement}
                    onChange={(e) => setEmpruntFormData({ ...empruntFormData, delai_remboursement: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode_paiement_emprunt">Mode de paiement</Label>
                  <Select 
                    value={empruntFormData.mode_paiement} 
                    onValueChange={(value: 'espèce' | 'mbway' | 'mixte') => setEmpruntFormData({ ...empruntFormData, mode_paiement: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="espèce">Espèce</SelectItem>
                      <SelectItem value="mbway">Mbway</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {empruntFormData.montant && empruntFormData.taux_interet && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-800 mb-1">
                      <strong>Intérêts :</strong> {(parseFloat(empruntFormData.montant) * parseFloat(empruntFormData.taux_interet) / 100).toFixed(2)}€
                    </p>
                    <p className="text-sm text-purple-800">
                      <strong>Montant total à rembourser :</strong> {(parseFloat(empruntFormData.montant) + (parseFloat(empruntFormData.montant) * parseFloat(empruntFormData.taux_interet) / 100)).toFixed(2)}€
                    </p>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={handleAddEmprunt}
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddEmpruntDialogOpen(false)}
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

      {/* Stats Cards - Alignés sur une seule ligne */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Entrées {selectedYear}</p>
                <p className="text-xl font-semibold text-emerald-600">{currentYearStats.totalEntrees}€</p>
              </div>
              <div className="p-2 bg-emerald-500 rounded-lg">
                <ArrowUp className="size-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Emprunts {selectedYear}</p>
                <p className="text-xl font-semibold text-orange-600">{currentYearStats.totalEmprunts}€</p>
              </div>
              <div className="p-2 bg-orange-500 rounded-lg">
                <ArrowDown className="size-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Intérêts {selectedYear}</p>
                <p className="text-xl font-semibold text-purple-600">{currentYearStats.totalInterets}€</p>
              </div>
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="size-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Solde {selectedYear}</p>
                <p className={`text-xl font-semibold ${currentYearStats.totalEntrees - currentYearStats.totalEmprunts >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                  {currentYearStats.totalEntrees - currentYearStats.totalEmprunts}€
                </p>
              </div>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Wallet className="size-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Solde Total</p>
                <p className={`text-xl font-semibold ${soldeGlobal >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                  {soldeGlobal}€
                </p>
              </div>
              <div className="p-2 bg-indigo-500 rounded-lg">
                <GraduationCap className="size-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sélecteur d'année */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-900">Bilan Financier par Séance</h2>
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sélectionner une année" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableYears().map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tableau des séances avec bilan financier */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort('date_seance')}
                  >
                    <div className="flex items-center gap-1">
                      Séance
                      {getSortIcon('date_seance')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort('lieu_seance')}
                  >
                    <div className="flex items-center gap-1">
                      Lieu
                      {getSortIcon('lieu_seance')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-100"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-1">
                      Type
                      {getSortIcon('type')}
                    </div>
                  </TableHead>
                  <TableHead>Entrées</TableHead>
                  <TableHead>Sorties</TableHead>
                  <TableHead>Solde</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSeances.map((seance) => {
                  const stats = getSeanceStats(seance.$id);
                  return (
                    <TableRow key={seance.$id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {new Date(seance.date_seance).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-slate-600">{seance.lieu_seance}</TableCell>
                      <TableCell>
                        <Badge className={getTypeSeanceBadgeColor(seance.type)}>
                          {seance.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-emerald-600 font-semibold">
                        +{stats.totalEntrees}€
                      </TableCell>
                      <TableCell className="text-orange-600 font-semibold">
                        -{stats.totalSorties}€
                      </TableCell>
                      <TableCell className={`font-semibold ${stats.solde >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                        {stats.solde}€
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatutBadgeColor(stats.solde)}>
                          {stats.solde >= 0 ? 'Excédent' : 'Déficit'}
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

      {/* Détails des entrées et sorties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entrées */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <ArrowUp className="size-5 text-emerald-600" />
              Détail des Entrées {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {entrees.filter(entree => {
                const seance = getSeanceDetails(entree.seance_id);
                return seance && new Date(seance.date_seance).getFullYear() === selectedYear;
              }).map((entree) => {
                const seance = getSeanceDetails(entree.seance_id);
                return (
                  <div key={entree.$id} className="p-4 bg-white border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getMembreName(entree.membre_id)}
                        </p>
                        <p className="text-sm text-slate-600">
                          {seance && `${new Date(seance.date_seance).toLocaleDateString('fr-FR')} - ${seance.lieu_seance}`}
                        </p>
                      </div>
                      <Badge className={
                        entree.type === 'dépôt' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }>
                        {entree.type === 'dépôt' ? 'Dépôt' : 'Remboursement'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-emerald-600">+{entree.montant}€</span>
                      <span className="text-sm text-slate-500 capitalize">{entree.mode_paiement}</span>
                    </div>
                    {entree.type === 'remboursement' && entree.qualite_remboursement && (
                      <p className="text-xs text-slate-500 mt-1">
                        {entree.qualite_remboursement} • {entree.type_remboursement}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sorties */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <ArrowDown className="size-5 text-orange-600" />
              Détail des Emprunts {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {emprunts.filter(emprunt => {
                const seance = getSeanceDetails(emprunt.seance_id);
                return seance && new Date(seance.date_seance).getFullYear() === selectedYear;
              }).map((emprunt) => {
                const seance = getSeanceDetails(emprunt.seance_id);
                return (
                  <div key={emprunt.$id} className="p-4 bg-white border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getMembreName(emprunt.membre_id)}
                        </p>
                        <p className="text-sm text-slate-600">
                          {seance && `${new Date(seance.date_seance).toLocaleDateString('fr-FR')} - ${seance.lieu_seance}`}
                        </p>
                      </div>
                      <Badge className={
                        emprunt.statut === 'en_cours'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }>
                        {emprunt.statut === 'en_cours' ? 'En cours' : 'Remboursé'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-lg font-bold text-orange-600">-{emprunt.montant}€</span>
                      <span className="text-sm text-slate-500 capitalize">{emprunt.mode_paiement}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Intérêts: {emprunt.valeur_interet}€</span>
                      <span>Échéance: {new Date(emprunt.delai_remboursement).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}