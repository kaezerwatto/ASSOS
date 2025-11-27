import { useState } from 'react';
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
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

type TransactionType = 
  | 'depot' 
  | 'retrait' 
  | 'tontine_maintenance' 
  | 'aide_accordee' 
  | 'aide_recouvree'
  | 'pret_scolaire'
  | 'interet_pret'
  | 'don'
  | 'seance_entretien'
  | 'seance_repas'
  | 'seance_boisson'
  | 'depense_bureau'
  | 'depense_statutaire';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  category: 'entree' | 'sortie';
  caisse: 'generale' | 'scolaire';
}

interface FinancesProps {
  userRole: 'admin' | 'tresorier';
}

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
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'tontine_maintenance',
      amount: 30,
      date: '2025-11-15',
      description: 'Frais de maintenance - 3 bénéficiaires',
      category: 'entree',
      caisse: 'generale',
    },
    {
      id: '2',
      type: 'seance_entretien',
      amount: 25,
      date: '2025-11-15',
      description: 'Entretien salle - Séance du 15/11',
      category: 'sortie',
      caisse: 'generale',
    },
    {
      id: '3',
      type: 'don',
      amount: 200,
      date: '2025-11-08',
      description: 'Don anonyme',
      category: 'entree',
      caisse: 'generale',
    },
    {
      id: '4',
      type: 'aide_accordee',
      amount: 150,
      date: '2025-11-15',
      description: 'Aide maladie - Marie Dupont',
      category: 'sortie',
      caisse: 'generale',
    },
    {
      id: '5',
      type: 'pret_scolaire',
      amount: 800,
      date: '2025-11-10',
      description: 'Prêt scolaire - Sophie Bernard',
      category: 'sortie',
      caisse: 'scolaire',
    },
    {
      id: '6',
      type: 'interet_pret',
      amount: 60,
      date: '2025-11-12',
      description: 'Intérêts prêt - Pierre Durand',
      category: 'entree',
      caisse: 'scolaire',
    },
  ]);

  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    date: '',
    description: '',
  });

  const handleAddTransaction = () => {
    const typeInfo = transactionTypes[formData.type as TransactionType];
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type as TransactionType,
      amount: parseFloat(formData.amount),
      date: formData.date,
      description: formData.description,
      category: typeInfo.category,
      caisse: typeInfo.caisse,
    };
    setTransactions([newTransaction, ...transactions]);
    setFormData({ type: '', amount: '', date: '', description: '' });
    setIsAddDialogOpen(false);
  };

  const filteredTransactions = filterCaisse === 'all' 
    ? transactions 
    : transactions.filter(t => t.caisse === filterCaisse);

  const caisseGenerale = transactions
    .filter(t => t.caisse === 'generale')
    .reduce((sum, t) => {
      return t.category === 'entree' ? sum + t.amount : sum - t.amount;
    }, 0);

  const caisseScolaire = transactions
    .filter(t => t.caisse === 'scolaire')
    .reduce((sum, t) => {
      return t.category === 'entree' ? sum + t.amount : sum - t.amount;
    }, 0);

  const totalEntrees = transactions
    .filter(t => t.category === 'entree')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSorties = transactions
    .filter(t => t.category === 'sortie')
    .reduce((sum, t) => sum + t.amount, 0);

  // Chart data
  const monthlyFlowData = [
    { month: 'Jan', entrees: 4200, sorties: 3100 },
    { month: 'Fev', entrees: 5100, sorties: 3600 },
    { month: 'Mar', entrees: 4800, sorties: 3900 },
    { month: 'Avr', entrees: 6200, sorties: 4200 },
    { month: 'Mai', entrees: 5800, sorties: 3800 },
    { month: 'Juin', entrees: 6500, sorties: 4100 },
  ];

  const balanceData = [
    { month: 'Jan', generale: 8500, scolaire: 6200 },
    { month: 'Fev', generale: 9400, scolaire: 6500 },
    { month: 'Mar', generale: 10200, scolaire: 6800 },
    { month: 'Avr', generale: 11100, scolaire: 7200 },
    { month: 'Mai', generale: 11800, scolaire: 7800 },
    { month: 'Juin', generale: 12450, scolaire: 8200 },
  ];

  const expenseTypeData = [
    { name: 'Aides', value: 1850, color: '#ef4444' },
    { name: 'Prêts Scolaires', value: 3200, color: '#f59e0b' },
    { name: 'Séances', value: 2100, color: '#06b6d4' },
    { name: 'Bureau', value: 850, color: '#8b5cf6' },
    { name: 'Statutaires', value: 600, color: '#ec4899' },
  ];

  const revenueTypeData = [
    { name: 'Tontines', value: 3500, color: '#8b5cf6' },
    { name: 'Dons', value: 1200, color: '#ec4899' },
    { name: 'Recouvrements', value: 1850, color: '#10b981' },
    { name: 'Intérêts Prêts', value: 920, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-slate-600 mb-2">Gestion Financière</h1>
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
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-11"
                  />
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
                        <p>{transactionTypes[formData.type as TransactionType].label}</p>
                      </div>
                      <div>
                        <p className="text-indigo-600">Catégorie</p>
                        <p>{transactionTypes[formData.type as TransactionType].category === 'entree' ? 'Entrée' : 'Sortie'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-indigo-600">Caisse</p>
                        <p>{transactionTypes[formData.type as TransactionType].caisse === 'generale' ? 'Générale' : 'Scolaire'}</p>
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
                  disabled={!formData.type || !formData.amount || !formData.date || !formData.description}
                >
                  Enregistrer la transaction
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Caisse</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-slate-50">
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-slate-900">
                      {transactionTypes[transaction.type].label}
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">
                      {transaction.description}
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
                          transaction.category === 'entree'
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }
                      >
                        {transaction.category === 'entree' ? 'Entrée' : 'Sortie'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          transaction.category === 'entree' ? 'text-emerald-600' : 'text-red-600'
                        }
                      >
                        {transaction.category === 'entree' ? '+' : '-'}
                        {transaction.amount.toFixed(2)}€
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="p-6">
          <h3 className="text-indigo-900 mb-4">Structure Financière</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-indigo-800">
            <div className="space-y-2">
              <p className="text-indigo-600">Caisse Générale :</p>
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
              <p className="text-indigo-600">Caisse Scolaire :</p>
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
