import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, GraduationCap, TrendingUp, Wallet } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface Loan {
  id: string;
  borrower: string;
  principal: number;
  interest: number;
  totalAmount: number;
  date: string;
  dueDate: string;
  status: 'en_cours' | 'remboursé';
  notes: string;
}

interface LoansProps {
  userRole: 'admin' | 'tresorier';
}

export function Loans({ userRole }: LoansProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([
    {
      id: '1',
      borrower: 'Sophie Bernard',
      principal: 800,
      interest: 80,
      totalAmount: 880,
      date: '2025-11-10',
      dueDate: '2026-06-10',
      status: 'en_cours',
      notes: 'Frais universitaires',
    },
    {
      id: '2',
      borrower: 'Pierre Durand',
      principal: 600,
      interest: 60,
      totalAmount: 660,
      date: '2025-10-01',
      dueDate: '2026-05-01',
      status: 'remboursé',
      notes: 'Livres et matériel scolaire',
    },
  ]);

  const [formData, setFormData] = useState({
    borrower: '',
    principal: '',
    interestRate: '10',
    date: '',
    dueDate: '',
    notes: '',
  });

  const calculateInterest = (principal: number, rate: number) => {
    return (principal * rate) / 100;
  };

  const handleAddLoan = () => {
    const principal = parseFloat(formData.principal);
    const rate = parseFloat(formData.interestRate);
    const interest = calculateInterest(principal, rate);
    const totalAmount = principal + interest;

    const newLoan: Loan = {
      id: Date.now().toString(),
      borrower: formData.borrower,
      principal,
      interest,
      totalAmount,
      date: formData.date,
      dueDate: formData.dueDate,
      status: 'en_cours',
      notes: formData.notes,
    };
    setLoans([newLoan, ...loans]);
    setFormData({ borrower: '', principal: '', interestRate: '10', date: '', dueDate: '', notes: '' });
    setIsAddDialogOpen(false);
  };

  const toggleStatus = (id: string) => {
    setLoans(loans.map(loan =>
      loan.id === id
        ? { ...loan, status: loan.status === 'en_cours' ? 'remboursé' : 'en_cours' }
        : loan
    ));
  };

  const totalLoaned = loans.reduce((sum, loan) => sum + loan.principal, 0);
  const totalInterest = loans.reduce((sum, loan) => sum + loan.interest, 0);
  const activeLoanAmount = loans.filter(l => l.status === 'en_cours').reduce((sum, loan) => sum + loan.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-slate-600 mb-2">Prêts Scolaires</h1>
          <p className="text-slate-600">{loans.length} prêts enregistrés</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="size-4 mr-2" />
              Nouveau Prêt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Enregistrer un nouveau prêt scolaire</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="borrower">Emprunteur</Label>
                <Input
                  id="borrower"
                  value={formData.borrower}
                  onChange={(e) => setFormData({ ...formData, borrower: e.target.value })}
                  placeholder="Nom de l'emprunteur"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date du prêt</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Date d'échéance</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="principal">Montant du prêt (€)</Label>
                <Input
                  id="principal"
                  type="number"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                  placeholder="800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Taux d'intérêt (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  placeholder="10"
                />
              </div>

              {formData.principal && formData.interestRate && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800 mb-1">
                    <strong>Intérêts :</strong> {calculateInterest(parseFloat(formData.principal), parseFloat(formData.interestRate)).toFixed(2)}€
                  </p>
                  <p className="text-sm text-purple-800">
                    <strong>Montant total à rembourser :</strong> {(parseFloat(formData.principal) + calculateInterest(parseFloat(formData.principal), parseFloat(formData.interestRate))).toFixed(2)}€
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Objet du prêt..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  onClick={handleAddLoan}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!formData.borrower || !formData.principal || !formData.date || !formData.dueDate}
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
                <p className="text-sm text-slate-600 mb-1">Total Prêté</p>
                <p className="text-2xl text-slate-900">{totalLoaned}€</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg">
                <GraduationCap className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Intérêts Totaux</p>
                <p className="text-2xl text-emerald-600">{totalInterest}€</p>
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
                <p className="text-sm text-slate-600 mb-1">Prêts Actifs</p>
                <p className="text-2xl text-orange-600">{activeLoanAmount}€</p>
              </div>
              <div className="p-3 bg-orange-500 rounded-lg">
                <Wallet className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loans Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <GraduationCap className="size-5 text-indigo-600" />
            Historique des Prêts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Emprunteur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Intérêts</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow key={loan.id} className="hover:bg-slate-50">
                    <TableCell className="text-slate-900">{loan.borrower}</TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(loan.date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-slate-600">{loan.principal}€</TableCell>
                    <TableCell className="text-emerald-600">+{loan.interest}€</TableCell>
                    <TableCell className="text-slate-900">{loan.totalAmount}€</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          loan.status === 'remboursé'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }
                      >
                        {loan.status === 'remboursé' ? 'Remboursé' : 'En cours'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">{loan.notes}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(loan.id)}
                        className={
                          loan.status === 'en_cours'
                            ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                        }
                      >
                        {loan.status === 'en_cours' ? 'Marquer remboursé' : 'Marquer en cours'}
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
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <h3 className="text-purple-900 mb-2">À propos des Prêts Scolaires</h3>
          <div className="space-y-2 text-sm text-purple-800">
            <p>• Les prêts scolaires proviennent de la caisse scolaire (séparée de la caisse générale)</p>
            <p>• Des intérêts sont appliqués sur chaque prêt</p>
            <p>• Le montant total à rembourser = Principal + Intérêts</p>
            <p>• Les intérêts générés reviennent à la caisse scolaire</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}