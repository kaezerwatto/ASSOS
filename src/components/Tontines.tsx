import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Coins, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Tontine {
  id: string;
  listNumber: 1 | 2 | 3;
  beneficiary: string;
  amount: number;
  maintenanceFee: number;
  date: string;
  sessionDate: string;
}

interface TontinesProps {
  userRole: 'admin' | 'tresorier';
}

export function Tontines({ userRole }: TontinesProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [tontines, setTontines] = useState<Tontine[]>([
    {
      id: '1',
      listNumber: 1,
      beneficiary: 'Marie Dupont',
      amount: 500,
      maintenanceFee: 10,
      date: '2025-11-15',
      sessionDate: '2025-11-15',
    },
    {
      id: '2',
      listNumber: 2,
      beneficiary: 'Jean Martin',
      amount: 500,
      maintenanceFee: 10,
      date: '2025-11-15',
      sessionDate: '2025-11-15',
    },
    {
      id: '3',
      listNumber: 3,
      beneficiary: 'Sophie Bernard',
      amount: 500,
      maintenanceFee: 10,
      date: '2025-11-15',
      sessionDate: '2025-11-15',
    },
  ]);

  const [formData, setFormData] = useState({
    listNumber: '',
    beneficiary: '',
    amount: '',
    sessionDate: '',
  });

  const handleAddTontine = () => {
    const newTontine: Tontine = {
      id: Date.now().toString(),
      listNumber: parseInt(formData.listNumber) as 1 | 2 | 3,
      beneficiary: formData.beneficiary,
      amount: parseFloat(formData.amount),
      maintenanceFee: 10,
      date: new Date().toISOString().split('T')[0],
      sessionDate: formData.sessionDate,
    };
    setTontines([newTontine, ...tontines]);
    setFormData({ listNumber: '', beneficiary: '', amount: '', sessionDate: '' });
    setIsAddDialogOpen(false);
  };

  const getListBadgeColor = (listNumber: number) => {
    const colors = {
      1: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      2: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      3: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    };
    return colors[listNumber as 1 | 2 | 3];
  };

  const totalMaintenanceFees = tontines.reduce((sum, t) => sum + t.maintenanceFee, 0);
  const totalAmounts = tontines.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-indigo-950 mb-2">Gestion des Tontines</h1>
          <p className="text-slate-600">3 listes de tontines actives</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="size-4 mr-2" />
              Nouveau Bénéficiaire
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enregistrer un bénéficiaire de tontine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="sessionDate">Date de la séance</Label>
                <Input
                  id="sessionDate"
                  type="date"
                  value={formData.sessionDate}
                  onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="listNumber">Liste de tontine</Label>
                <Select value={formData.listNumber} onValueChange={(value) => setFormData({ ...formData, listNumber: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une liste" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Liste 1</SelectItem>
                    <SelectItem value="2">Liste 2</SelectItem>
                    <SelectItem value="3">Liste 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beneficiary">Bénéficiaire</Label>
                <Input
                  id="beneficiary"
                  value={formData.beneficiary}
                  onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                  placeholder="Nom du bénéficiaire"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="500"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Frais de maintenance :</strong> 10€ (automatique)
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Chaque bénéficiaire contribue 10€ pour le traitement de sa fiche
                </p>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleAddTontine}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!formData.listNumber || !formData.beneficiary || !formData.amount || !formData.sessionDate}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Tontines</p>
                <p className="text-2xl text-slate-900">{tontines.length}</p>
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
                <p className="text-sm text-slate-600 mb-1">Frais Maintenance</p>
                <p className="text-2xl text-emerald-600">{totalMaintenanceFees}€</p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-lg">
                <TrendingUp className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Montant Total</p>
                <p className="text-2xl text-slate-900">{totalAmounts}€</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <Coins className="size-6 text-white" />
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
            Historique des Tontines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date Séance</TableHead>
                  <TableHead>Liste</TableHead>
                  <TableHead>Bénéficiaire</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Frais Maintenance</TableHead>
                  <TableHead>Total Reçu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tontines.map((tontine) => (
                  <TableRow key={tontine.id} className="hover:bg-slate-50">
                    <TableCell>
                      {new Date(tontine.sessionDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getListBadgeColor(tontine.listNumber)}>
                        Liste {tontine.listNumber}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-900">{tontine.beneficiary}</TableCell>
                    <TableCell className="text-slate-600">{tontine.amount}€</TableCell>
                    <TableCell className="text-emerald-600">+{tontine.maintenanceFee}€</TableCell>
                    <TableCell>
                      <span className="text-slate-900">{tontine.amount - tontine.maintenanceFee}€</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h3 className="text-blue-900 mb-2">À propos des Tontines</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• 3 listes de tontines actives dans l'association</p>
            <p>• Chaque séance compte 3 bénéficiaires (1 par liste)</p>
            <p>• Frais de maintenance : 10€ par bénéficiaire pour le traitement de la fiche</p>
            <p>• Le montant net reçu = Montant de la tontine - Frais de maintenance</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}