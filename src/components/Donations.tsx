import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Gift, TrendingUp } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface Donation {
  id: string;
  donor: string;
  amount: number;
  date: string;
  anonymous: boolean;
  notes: string;
}

interface DonationsProps {
  userRole: 'admin' | 'tresorier';
}

export function Donations({ userRole }: DonationsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([
    {
      id: '1',
      donor: 'Anonyme',
      amount: 200,
      date: '2025-11-08',
      anonymous: true,
      notes: 'Don généreux',
    },
    {
      id: '2',
      donor: 'Jean Martin',
      amount: 150,
      date: '2025-10-25',
      anonymous: false,
      notes: 'Pour soutenir les activités de l\'association',
    },
  ]);

  const [formData, setFormData] = useState({
    donor: '',
    amount: '',
    date: '',
    anonymous: false,
    notes: '',
  });

  const handleAddDonation = () => {
    const newDonation: Donation = {
      id: Date.now().toString(),
      donor: formData.anonymous ? 'Anonyme' : formData.donor,
      amount: parseFloat(formData.amount),
      date: formData.date,
      anonymous: formData.anonymous,
      notes: formData.notes,
    };
    setDonations([newDonation, ...donations]);
    setFormData({ donor: '', amount: '', date: '', anonymous: false, notes: '' });
    setIsAddDialogOpen(false);
  };

  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const thisMonthDonations = donations
    .filter(d => {
      const donationDate = new Date(d.date);
      const now = new Date();
      return donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, donation) => sum + donation.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-slate-600 mb-2">Gestion des Dons</h1>
          <p className="text-slate-600">{donations.length} dons enregistrés</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="size-4 mr-2" />
              Nouveau Don
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enregistrer un nouveau don</DialogTitle>
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

              <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.anonymous}
                  onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  Don anonyme
                </Label>
              </div>

              {!formData.anonymous && (
                <div className="space-y-2">
                  <Label htmlFor="donor">Donateur</Label>
                  <Input
                    id="donor"
                    value={formData.donor}
                    onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
                    placeholder="Nom du donateur"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Montant (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes sur le don..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  onClick={handleAddDonation}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!formData.amount || !formData.date || (!formData.anonymous && !formData.donor)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total des Dons</p>
                <p className="text-2xl text-slate-900">{totalDonations}€</p>
                <p className="text-xs text-slate-500 mt-1">{donations.length} dons</p>
              </div>
              <div className="p-3 bg-pink-500 rounded-lg">
                <Gift className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Ce Mois-ci</p>
                <p className="text-2xl text-emerald-600">{thisMonthDonations}€</p>
                <p className="text-xs text-slate-500 mt-1">
                  {donations.filter(d => {
                    const donationDate = new Date(d.date);
                    const now = new Date();
                    return donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
                  }).length} dons
                </p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-lg">
                <TrendingUp className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donations Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Gift className="size-5 text-indigo-600" />
            Historique des Dons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Donateur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id} className="hover:bg-slate-50">
                    <TableCell>
                      {new Date(donation.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-slate-900">
                      {donation.donor}
                    </TableCell>
                    <TableCell>
                      <span className="text-emerald-600">{donation.amount}€</span>
                    </TableCell>
                    <TableCell>
                      {donation.anonymous ? (
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                          Anonyme
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                          Nominatif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">{donation.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-pink-200 bg-pink-50">
        <CardContent className="p-6">
          <h3 className="text-pink-900 mb-2">À propos des Dons</h3>
          <div className="space-y-2 text-sm text-pink-800">
            <p>• Les dons contribuent au fonds de caisse générale</p>
            <p>• Les donateurs peuvent choisir de rester anonymes</p>
            <p>• Tous les dons sont enregistrés pour la transparence financière</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}