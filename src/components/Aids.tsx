import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Heart, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

type AidType = 'maladie' | 'deces_pere' | 'deces_mere' | 'naissance' | 'mariage';

interface Aid {
  id: string;
  type: AidType;
  beneficiary: string;
  amount: number;
  date: string;
  status: 'accordé' | 'recouvré';
  notes: string;
}

const aidTypes = {
  maladie: { label: 'Maladie', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
  deces_pere: { label: 'Décès Père', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  deces_mere: { label: 'Décès Mère', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  naissance: { label: 'Naissance', color: 'bg-pink-100 text-pink-700 hover:bg-pink-200' },
  mariage: { label: 'Mariage', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
};

interface AidsProps {
  userRole: 'admin' | 'tresorier';
}

export function Aids({ userRole }: AidsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [aids, setAids] = useState<Aid[]>([
    {
      id: '1',
      type: 'maladie',
      beneficiary: 'Marie Dupont',
      amount: 150,
      date: '2025-11-15',
      status: 'accordé',
      notes: 'Hospitalisation',
    },
    {
      id: '2',
      type: 'naissance',
      beneficiary: 'Jean Martin',
      amount: 100,
      date: '2025-11-10',
      status: 'recouvré',
      notes: 'Naissance de jumeaux',
    },
  ]);

  const [formData, setFormData] = useState({
    type: '',
    beneficiary: '',
    amount: '',
    date: '',
    notes: '',
  });

  const handleAddAid = () => {
    const newAid: Aid = {
      id: Date.now().toString(),
      type: formData.type as AidType,
      beneficiary: formData.beneficiary,
      amount: parseFloat(formData.amount),
      date: formData.date,
      status: 'accordé',
      notes: formData.notes,
    };
    setAids([newAid, ...aids]);
    setFormData({ type: '', beneficiary: '', amount: '', date: '', notes: '' });
    setIsAddDialogOpen(false);
  };

  const toggleStatus = (id: string) => {
    setAids(aids.map(aid =>
      aid.id === id
        ? { ...aid, status: aid.status === 'accordé' ? 'recouvré' : 'accordé' }
        : aid
    ));
  };

  const totalAccorded = aids.reduce((sum, aid) => sum + aid.amount, 0);
  const totalRecovered = aids.filter(a => a.status === 'recouvré').reduce((sum, aid) => sum + aid.amount, 0);
  const totalPending = aids.filter(a => a.status === 'accordé').reduce((sum, aid) => sum + aid.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-indigo-950 mb-2">Gestion des Aides</h1>
          <p className="text-slate-600">{aids.length} aides enregistrées</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="size-4 mr-2" />
              Nouvelle Aide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enregistrer une nouvelle aide</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type d'aide</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(aidTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.label}
                      </SelectItem>
                    ))}
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
                  placeholder="150"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Détails de l'aide..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  onClick={handleAddAid}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!formData.type || !formData.beneficiary || !formData.amount || !formData.date}
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
                <p className="text-sm text-slate-600 mb-1">Total Accordé</p>
                <p className="text-2xl text-slate-900">{totalAccorded}€</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg">
                <Heart className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Recouvré</p>
                <p className="text-2xl text-emerald-600">{totalRecovered}€</p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-lg">
                <Activity className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">En Attente</p>
                <p className="text-2xl text-orange-600">{totalPending}€</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-lg">
                <Heart className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aids Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Heart className="size-5 text-indigo-600" />
            Historique des Aides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Bénéficiaire</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aids.map((aid) => (
                  <TableRow key={aid.id} className="hover:bg-slate-50">
                    <TableCell>
                      {new Date(aid.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={aidTypes[aid.type].color}>
                        {aidTypes[aid.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-900">{aid.beneficiary}</TableCell>
                    <TableCell className="text-slate-600">{aid.amount}€</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          aid.status === 'recouvré'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }
                      >
                        {aid.status === 'recouvré' ? 'Recouvré' : 'Accordé'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">{aid.notes}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(aid.id)}
                        className={
                          aid.status === 'accordé'
                            ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                        }
                      >
                        {aid.status === 'accordé' ? 'Marquer recouvré' : 'Marquer accordé'}
                      </Button>
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
          <h3 className="text-blue-900 mb-2">Types d'aides disponibles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-blue-800">
            {Object.entries(aidTypes).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>{value.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}