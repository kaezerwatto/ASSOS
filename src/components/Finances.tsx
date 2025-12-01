import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign, Filter, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { databaseService } from '../lib/appwrite-service';

// Types basés sur les autres fichiers
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

interface Transaction {
  $id: string;
  seance_id: string;
  membre_id?: string;
  type: 'depot' | 'retrait' | 'tontine_maintenance' | 'aide_accordee' | 'aide_recouvree' | 'pret_scolaire' | 'interet_pret' | 'don' | 'seance_entretien' | 'seance_repas' | 'seance_boisson' | 'depense_bureau' | 'depense_statutaire';
  montant: number;
  date_transaction: string;
  description: string;
  caisse: 'generale' | 'scolaire';
  mode_paiement: 'espèces' | 'Mbway' | 'mixte';
  $createdAt: string;
}

interface FinancesProps {
  userRole: 'admin' | 'tresorier';
}

// IDs de la base de données Appwrite
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '69243fec00044331ef75';
const SEANCES_COLLECTION = 'seances';
const MEMBRES_COLLECTION = 'membres';
const TRANSACTIONS_COLLECTION = 'transactions_finances';

const transactionTypes = {
  depot: { label: 'Dépôt', category: 'entree' as const, caisse: 'generale' as const },
  retrait: { label: 'Retrait', category: 'sortie' as const, caisse: 'generale' as const },
  tontine_maintenance: { label: 'Frais Tontine', category: 'entree' as const, caisse: 'generale' as const },
  aide_accordee: { label: 'Aide Accordée', category: 'sortie' as const, caisse: 'generale' as const },
  aide_recouvree: { label: 'Aide Recouvrée', category: 'entree' as const, caisse: 'generale' as const },
  pret_scolaire: { label: 'Prêt Scolaire', category: 'sortie' as const, caisse: 'scolaire' as const },
  interet_pret: { label: 'Intérêt Prêt', category: 'entree' as const, caisse: 'scolaire' as const },
  don: { label: 'Don', category: 'entree' as const, caisse: 'generale' as const },
  seance_entretien: { label: 'Entretien Salle', category: 'sortie' as const, caisse: 'generale' as const },
  seance_repas: { label: 'Repas Séance', category: 'sortie' as const, caisse: 'generale' as const },
  seance_boisson: { label: 'Boisson Séance', category: 'sortie' as const, caisse: 'generale' as const },
  depense_bureau: { label: 'Dépense Bureau', category: 'sortie' as const, caisse: 'generale' as const },
  depense_statutaire: { label: 'Dépense Statutaire', category: 'sortie' as const, caisse: 'generale' as const },
};

export function Finances({ userRole }: FinancesProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterCaisse, setFilterCaisse] = useState<'all' | 'generale' | 'scolaire'>('all');
  const [seances, setSeances] = useState<Seance[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [formData, setFormData] = useState({
    seance_id: '',
    membre_id: '',
    type: '',
    amount: '',
    date_transaction: '',
    description: '',
    mode_paiement: '',
  });

  // Charger les données depuis Appwrite
  useEffect(() => {
    loadSeances();
    loadMembres();
    loadTransactions();
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

  const loadTransactions = async () => {
    try {
      const response = await databaseService.listDocuments(DATABASE_ID, TRANSACTIONS_COLLECTION);
      setTransactions(response.documents as Transaction[]);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    }
  };

  const handleAddTransaction = async () => {
    try {
      const typeInfo = transactionTypes[formData.type as keyof typeof transactionTypes];
      
      const transactionData: any = {
        seances: formData.seance_id,
        type: formData.type,
        montant: parseFloat(formData.amount),
        date_transaction: formData.date_transaction,
        description: formData.description,
        caisse: typeInfo.caisse,
        mode_paiement: formData.mode_paiement,
      };

      // Ajouter le membre si nécessaire
      if (formData.membre_id) {
        transactionData.membres = formData.membre_id;
      }

      await databaseService.createDocument(DATABASE_ID, TRANSACTIONS_COLLECTION, transactionData);
      
      setFormData({
        seance_id: '',
        membre_id: '',
        type: '',
        amount: '',
        date_transaction: '',
        description: '',
        mode_paiement: '',
      });
      setIsAddDialogOpen(false);
      loadTransactions();
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
    }
  };

  const filteredTransactions = filterCaisse === 'all' 
    ? transactions 
    : transactions.filter(t => t.caisse === filterCaisse);

  // Calculs des statistiques
  const caisseGenerale = transactions
    .filter(t => t.caisse === 'generale')
    .reduce((sum, t) => {
      const typeInfo = transactionTypes[t.type as keyof typeof transactionTypes];
      return typeInfo.category === 'entree' ? sum + t.montant : sum - t.montant;
    }, 0);

  const caisseScolaire = transactions
    .filter(t => t.caisse === 'scolaire')
    .reduce((sum, t) => {
      const typeInfo = transactionTypes[t.type as keyof typeof transactionTypes];
      return typeInfo.category === 'entree' ? sum + t.montant : sum - t.montant;
    }, 0);

  const totalEntrees = transactions
    .filter(t => {
      const typeInfo = transactionTypes[t.type as keyof typeof transactionTypes];
      return typeInfo.category === 'entree';
    })
    .reduce((sum, t) => sum + t.montant, 0);

  const totalSorties = transactions
    .filter(t => {
      const typeInfo = transactionTypes[t.type as keyof typeof transactionTypes];
      return typeInfo.category === 'sortie';
    })
    .reduce((sum, t) => sum + t.montant, 0);

  // Obtenir le nom d'un membre
  const getMembreName = (membreId: string) => {
    const membre = membres.find(m => m.$id === membreId);
    return membre ? `${membre.prenoms} ${membre.nom}` : 'Non spécifié';
  };

  // Obtenir les détails d'une séance
  const getSeanceDetails = (seanceId: string) => {
    return seances.find(s => s.$id === seanceId);
  };

  // Données pour les graphiques (basées sur les transactions réelles)
  const getMonthlyFlowData = () => {
    const monthlyData: { [key: string]: { entrees: number; sorties: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date_transaction);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthLabel = date.toLocaleDateString('fr-FR', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { entrees: 0, sorties: 0, month: monthLabel };
      }
      
      const typeInfo = transactionTypes[transaction.type as keyof typeof transactionTypes];
      if (typeInfo.category === 'entree') {
        monthlyData[monthKey].entrees += transaction.montant;
      } else {
        monthlyData[monthKey].sorties += transaction.montant;
      }
    });

    return Object.values(monthlyData).slice(-6); // 6 derniers mois
  };

  const getBalanceData = () => {
    const balanceData: { [key: string]: { generale: number; scolaire: number } } = {};
    let generaleCumul = 0;
    let scolaireCumul = 0;
    
    transactions
      .sort((a, b) => new Date(a.date_transaction).getTime() - new Date(b.date_transaction).getTime())
      .forEach(transaction => {
        const date = new Date(transaction.date_transaction);
        const monthKey = date.toLocaleDateString('fr-FR', { month: 'short' });
        
        const typeInfo = transactionTypes[transaction.type as keyof typeof transactionTypes];
        const montant = typeInfo.category === 'entree' ? transaction.montant : -transaction.montant;
        
        if (transaction.caisse === 'generale') {
          generaleCumul += montant;
        } else {
          scolaireCumul += montant;
        }
        
        balanceData[monthKey] = { 
          generale: generaleCumul, 
          scolaire: scolaireCumul,
          month: monthKey
        };
      });

    return Object.values(balanceData).slice(-6);
  };

  const getExpenseTypeData = () => {
    const expenseData: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      const typeInfo = transactionTypes[transaction.type as keyof typeof transactionTypes];
      if (typeInfo.category === 'sortie') {
        if (!expenseData[typeInfo.label]) {
          expenseData[typeInfo.label] = 0;
        }
        expenseData[typeInfo.label] += transaction.montant;
      }
    });

    return Object.entries(expenseData).map(([name, value], index) => ({
      name,
      value,
      color: ['#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899'][index] || '#6b7280'
    }));
  };

  const getRevenueTypeData = () => {
    const revenueData: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      const typeInfo = transactionTypes[transaction.type as keyof typeof transactionTypes];
      if (typeInfo.category === 'entree') {
        if (!revenueData[typeInfo.label]) {
          revenueData[typeInfo.label] = 0;
        }
        revenueData[typeInfo.label] += transaction.montant;
      }
    });

    return Object.entries(revenueData).map(([name, value], index) => ({
      name,
      value,
      color: ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index] || '#6b7280'
    }));
  };

  const monthlyFlowData = getMonthlyFlowData();
  const balanceData = getBalanceData();
  const expenseTypeData = getExpenseTypeData();
  const revenueTypeData = getRevenueTypeData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Gestion Financière</h1>
          <p className="text-slate-600">Vue complète des finances de l'association</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="size-4" />
            Exporter
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg">
                <Plus className="size-4 mr-2" />
                Nouvelle Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle className="text-xl">Enregistrer une transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-700">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date_transaction}
                    onChange={(e) => setFormData({ ...formData, date_transaction: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seance" className="text-slate-700">Séance liée</Label>
                  <Select value={formData.seance_id} onValueChange={(value) => setFormData({ ...formData, seance_id: value })}>
                    <SelectTrigger className="h-11">
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
                  <Label htmlFor="type" className="text-slate-700">Type de transaction *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(transactionTypes).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value.label} ({value.caisse === 'generale' ? 'Caisse Générale' : 'Caisse Scolaire'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(formData.type === 'tontine_maintenance' || formData.type === 'aide_accordee' || 
                  formData.type === 'aide_recouvree' || formData.type === 'pret_scolaire' || 
                  formData.type === 'interet_pret') && (
                  <div className="space-y-2">
                    <Label htmlFor="membre" className="text-slate-700">Membre concerné</Label>
                    <Select value={formData.membre_id} onValueChange={(value) => setFormData({ ...formData, membre_id: value })}>
                      <SelectTrigger className="h-11">
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

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-slate-700">Montant (€) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="100"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode_paiement" className="text-slate-700">Mode de paiement *</Label>
                  <Select value={formData.mode_paiement} onValueChange={(value) => setFormData({ ...formData, mode_paiement: value })}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Mode de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="espèces">Espèce</SelectItem>
                      <SelectItem value="Mbway">Mbway</SelectItem>
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-700">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la transaction..."
                    rows={3}
                  />
                </div>

                {formData.type && (
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="grid grid-cols-2 gap-2 text-sm text-indigo-800">
                      <div>
                        <p className="text-indigo-600">Type</p>
                        <p>{transactionTypes[formData.type as keyof typeof transactionTypes].label}</p>
                      </div>
                      <div>
                        <p className="text-indigo-600">Catégorie</p>
                        <p>{transactionTypes[formData.type as keyof typeof transactionTypes].category === 'entree' ? 'Entrée' : 'Sortie'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-indigo-600">Caisse</p>
                        <p>{transactionTypes[formData.type as keyof typeof transactionTypes].caisse === 'generale' ? 'Générale' : 'Scolaire'}</p>
                      </div>
                    </div>
                  </div>
                )}
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
                  onClick={handleAddTransaction}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!formData.type || !formData.amount || !formData.date_transaction || !formData.description || !formData.mode_paiement}
                >
                  Enregistrer la transaction
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Le reste du code reste identique pour les stats cards, graphiques, et tableau */}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Caisse Générale</p>
                <p className="text-3xl text-emerald-600">{caisseGenerale.toFixed(2)}€</p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-lg">
                <Wallet className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Caisse Scolaire</p>
                <p className="text-3xl text-purple-600">{caisseScolaire.toFixed(2)}€</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <DollarSign className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Entrées</p>
                <p className="text-3xl text-emerald-600">{totalEntrees.toFixed(2)}€</p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-lg">
                <TrendingUp className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Sorties</p>
                <p className="text-3xl text-red-600">{totalSorties.toFixed(2)}€</p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <TrendingDown className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="size-5 text-indigo-600" />
              Flux de Trésorerie Mensuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyFlowData}>
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
                  formatter={(value) => `${value}€`}
                />
                <Legend />
                <Bar dataKey="entrees" fill="#10b981" radius={[8, 8, 0, 0]} name="Entrées (€)" />
                <Bar dataKey="sorties" fill="#ef4444" radius={[8, 8, 0, 0]} name="Sorties (€)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Wallet className="size-5 text-indigo-600" />
              Évolution des Caisses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={balanceData}>
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
                  formatter={(value) => `${value}€`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="generale" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Caisse Générale (€)"
                  dot={{ fill: '#10b981', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="scolaire" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Caisse Scolaire (€)"
                  dot={{ fill: '#8b5cf6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingDown className="size-5 text-red-600" />
              Répartition des Dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseTypeData.map((entry, index) => (
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
                  formatter={(value) => `${value}€`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="size-5 text-emerald-600" />
              Répartition des Revenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueTypeData.map((entry, index) => (
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
                  formatter={(value) => `${value}€`}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="size-5 text-slate-400" />
            <Select value={filterCaisse} onValueChange={(value: any) => setFilterCaisse(value)}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les caisses</SelectItem>
                <SelectItem value="generale">Caisse Générale</SelectItem>
                <SelectItem value="scolaire">Caisse Scolaire</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Wallet className="size-5 text-indigo-600" />
            Historique des Transactions
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
                  <TableHead>Description</TableHead>
                  <TableHead>Membre</TableHead>
                  <TableHead>Caisse</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const typeInfo = transactionTypes[transaction.type as keyof typeof transactionTypes];
                  const seance = getSeanceDetails(transaction.seance_id);
                  
                  return (
                    <TableRow key={transaction.$id} className="hover:bg-slate-50">
                      <TableCell>
                        {new Date(transaction.date_transaction).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {seance ? `${new Date(seance.date_seance).toLocaleDateString('fr-FR')} - ${seance.lieu_seance}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {typeInfo.label}
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-xs truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {transaction.membre_id ? getMembreName(transaction.membre_id) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            transaction.caisse === 'generale'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }
                        >
                          {transaction.caisse === 'generale' ? 'Générale' : 'Scolaire'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            typeInfo.category === 'entree'
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }
                        >
                          {typeInfo.category === 'entree' ? 'Entrée' : 'Sortie'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            typeInfo.category === 'entree' ? 'text-emerald-600' : 'text-red-600'
                          }
                        >
                          {typeInfo.category === 'entree' ? '+' : '-'}
                          {transaction.montant.toFixed(2)}€
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="p-6">
          <h3 className="text-indigo-900 font-semibold mb-4">Structure Financière</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-indigo-800">
            <div className="space-y-2">
              <p className="text-indigo-600 font-medium">Caisse Générale :</p>
              <ul className="space-y-1 ml-4">
                <li>• Frais de maintenance des tontines</li>
                <li>• Recouvrements des aides</li>
                <li>• Dons</li>
                <li>• Dépenses de séances (entretien, repas, boisson)</li>
                <li>• Dépenses du bureau</li>
                <li>• Dépenses statutaires</li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-indigo-600 font-medium">Caisse Scolaire :</p>
              <ul className="space-y-1 ml-4">
                <li>• Prêts scolaires (sorties)</li>
                <li>• Intérêts des prêts (entrées)</li>
                <li>• Séparée de la caisse générale</li>
                <li>• Gestion indépendante</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
