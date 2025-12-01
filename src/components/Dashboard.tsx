import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, Wallet, CalendarDays, TrendingUp, Heart, GraduationCap, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { databaseService } from '../lib/appwrite-service';

interface DashboardProps {
  userRole: 'admin' | 'tresorier';
}

// IDs de la base de données Appwrite
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '69243fec00044331ef75';
const MEMBRES_COLLECTION = 'membres';
const SEANCES_COLLECTION = 'seances';
const ENTREES_COLLECTION = 'entrees';
const SORTIES_COLLECTION = 'sorties';
const EMPRUNTS_SCOLAIRES_COLLECTION = 'emprunt_scolaire';
const ENTREES_SCOLAIRES_COLLECTION = 'entrees_scolaire';
const TONTINES_COLLECTION = 'tontines';
const SEANCES_TONTINES_COLLECTION = 'seances_tontines';

interface Membre {
  $id: string;
  nom: string;
  prenoms: string;
  statut: 'actif(ve)' | 'suspendu(e)' | 'exclu(e)' | 'demissionnaire' | 'desactive(e)';
  role: string;
  $createdAt: string;
}

interface Seance {
  $id: string;
  date_seance: string;
  lieu_seance: string;
  type: 'inaugurale' | 'ordinaire' | 'extraordinaire';
  $createdAt: string;
}

interface Entree {
  $id: string;
  montant: number;
  $createdAt: string;
}

interface Sortie {
  $id: string;
  montant: number;
  $createdAt: string;
}

interface EmpruntScolaire {
  $id: string;
  montant: number;
  valeur_interet: number;
  $createdAt: string;
}

interface EntreeScolaire {
  $id: string;
  montant: number;
  $createdAt: string;
}

interface Tontine {
  $id: string;
  montant_individuel: number;
  nombre_participants: number;
  $createdAt: string;
}

interface SeanceTontine {
  $id: string;
  montant_percu: number;
  $createdAt: string;
}

export function Dashboard({ userRole }: DashboardProps) {
  const [stats, setStats] = useState({
    membresActifs: 0,
    caisseGenerale: 0,
    caisseScolaire: 0,
    prochaineSeance: 'Aucune séance planifiée',
    tontinesTraitees: 0,
    aidesAccordees: 0,
    pretsScolaires: 0
  });

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis Appwrite
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle
      const [
        membresRes,
        seancesRes,
        entreesRes,
        sortiesRes,
        empruntsRes,
        entreesScolairesRes,
        tontinesRes,
        seancesTontinesRes
      ] = await Promise.all([
        databaseService.listDocuments(DATABASE_ID, MEMBRES_COLLECTION),
        databaseService.listDocuments(DATABASE_ID, SEANCES_COLLECTION),
        databaseService.listDocuments(DATABASE_ID, ENTREES_COLLECTION),
        databaseService.listDocuments(DATABASE_ID, SORTIES_COLLECTION),
        databaseService.listDocuments(DATABASE_ID, EMPRUNTS_SCOLAIRES_COLLECTION),
        databaseService.listDocuments(DATABASE_ID, ENTREES_SCOLAIRES_COLLECTION),
        databaseService.listDocuments(DATABASE_ID, TONTINES_COLLECTION),
        databaseService.listDocuments(DATABASE_ID, SEANCES_TONTINES_COLLECTION)
      ]);

      const membres = membresRes.documents as Membre[];
      const seances = seancesRes.documents as Seance[];
      const entrees = entreesRes.documents as Entree[];
      const sorties = sortiesRes.documents as Sortie[];
      const emprunts = empruntsRes.documents as EmpruntScolaire[];
      const entreesScolaires = entreesScolairesRes.documents as EntreeScolaire[];
      const tontines = tontinesRes.documents as Tontine[];
      const seancesTontines = seancesTontinesRes.documents as SeanceTontine[];

      // Calculer les statistiques
      const membresActifs = membres.filter(m => m.statut === 'actif(ve)').length;
      
      const totalEntrees = entrees.reduce((sum, e) => sum + e.montant, 0);
      const totalSorties = sorties.reduce((sum, s) => sum + s.montant, 0);
      const caisseGenerale = totalEntrees - totalSorties;

      const totalEntreesScolaires = entreesScolaires.reduce((sum, e) => sum + e.montant, 0);
      const totalEmpruntsScolaires = emprunts.reduce((sum, e) => sum + e.montant, 0);
      const caisseScolaire = totalEntreesScolaires - totalEmpruntsScolaires;

      // Trouver la prochaine séance
      const now = new Date();
      const prochainesSeances = seances
        .filter(s => new Date(s.date_seance) > now)
        .sort((a, b) => new Date(a.date_seance).getTime() - new Date(b.date_seance).getTime());
      
      const prochaineSeance = prochainesSeances.length > 0 
        ? `Dans ${Math.ceil((new Date(prochainesSeances[0].date_seance).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} jours`
        : 'Aucune séance planifiée';

      // Calculer les activités récentes
      const activities = [
        ...sorties.map(s => ({
          type: 'Aide',
          description: 'Aide accordée',
          amount: `-${s.montant}€`,
          date: new Date(s.$createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
        })),
        ...seancesTontines.map(st => ({
          type: 'Tontine',
          description: 'Bénéficiaire tontine',
          amount: `+${st.montant_percu}€`,
          date: new Date(st.$createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
        })),
        ...emprunts.map(e => ({
          type: 'Prêt',
          description: 'Prêt scolaire accordé',
          amount: `-${e.montant}€`,
          date: new Date(e.$createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
        })),
        ...entrees.filter(e => !e.seance_id).map(e => ({
          type: 'Don',
          description: 'Don reçu',
          amount: `+${e.montant}€`,
          date: new Date(e.$createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      // Générer les données mensuelles (6 derniers mois)
      const monthlyFlowData = generateMonthlyData(entrees, sorties, entreesScolaires, emprunts);
      
      // Générer les données par catégorie
      const categoryDistribution = generateCategoryData(entrees, sorties, tontines, emprunts);
      
      // Générer les données de présence (simulées pour l'exemple)
      const attendanceRate = generateAttendanceData();

      setStats({
        membresActifs,
        caisseGenerale,
        caisseScolaire,
        prochaineSeance,
        tontinesTraitees: seancesTontines.length,
        aidesAccordees: sorties.length,
        pretsScolaires: emprunts.length
      });

      setMonthlyData(monthlyFlowData);
      setCategoryData(categoryDistribution);
      setAttendanceData(attendanceRate);
      setRecentActivities(activities);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires pour générer les données
  const generateMonthlyData = (entrees: Entree[], sorties: Sortie[], entreesScolaires: EntreeScolaire[], emprunts: EmpruntScolaire[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('fr-FR', { month: 'short' });
      
      // Filtrer les données pour le mois donné (simplifié)
      const monthEntrees = entrees.filter(e => 
        new Date(e.$createdAt).getMonth() === date.getMonth() &&
        new Date(e.$createdAt).getFullYear() === date.getFullYear()
      ).reduce((sum, e) => sum + e.montant, 0);
      
      const monthSorties = sorties.filter(s => 
        new Date(s.$createdAt).getMonth() === date.getMonth() &&
        new Date(s.$createdAt).getFullYear() === date.getFullYear()
      ).reduce((sum, s) => sum + s.montant, 0);

      months.push({
        month: monthKey,
        entrees: monthEntrees,
        sorties: monthSorties,
        net: monthEntrees - monthSorties
      });
    }
    
    return months;
  };

  const generateCategoryData = (entrees: Entree[], sorties: Sortie[], tontines: Tontine[], emprunts: EmpruntScolaire[]) => {
    const tontinesTotal = tontines.reduce((sum, t) => sum + (t.montant_individuel * t.nombre_participants), 0);
    const aidesTotal = sorties.reduce((sum, s) => sum + s.montant, 0);
    const pretsTotal = emprunts.reduce((sum, e) => sum + e.montant, 0);
    const donsTotal = entrees.filter(e => !e.seance_id).reduce((sum, e) => sum + e.montant, 0);
    const seancesTotal = entrees.filter(e => e.seance_id).reduce((sum, e) => sum + e.montant, 0);

    return [
      { name: 'Tontines', value: tontinesTotal, color: '#8b5cf6' },
      { name: 'Aides', value: aidesTotal, color: '#ef4444' },
      { name: 'Prêts', value: pretsTotal, color: '#f59e0b' },
      { name: 'Dons', value: donsTotal, color: '#ec4899' },
      { name: 'Séances', value: seancesTotal, color: '#06b6d4' },
    ].filter(item => item.value > 0);
  };

  const generateAttendanceData = () => {
    // Données simulées pour le taux de présence
    const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin'];
    return months.map(month => ({
      month,
      taux: Math.floor(Math.random() * 20) + 80 // Entre 80% et 100%
    }));
  };

  const statsCards = [
    {
      title: 'Membres Actifs',
      value: stats.membresActifs.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+3 ce mois',
      trend: 'up'
    },
    {
      title: 'Caisse Générale',
      value: `${stats.caisseGenerale.toFixed(0)}€`,
      icon: Wallet,
      color: 'bg-emerald-500',
      change: '+850€ ce mois',
      trend: 'up'
    },
    {
      title: 'Caisse Scolaire',
      value: `${stats.caisseScolaire.toFixed(0)}€`,
      icon: GraduationCap,
      color: 'bg-purple-500',
      change: '+400€ ce mois',
      trend: 'up'
    },
    {
      title: 'Prochaine Séance',
      value: stats.prochaineSeance,
      icon: CalendarDays,
      color: 'bg-orange-500',
      change: 'Samedi 22 Nov',
      trend: 'neutral'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Tableau de bord</h1>
          <p className="text-slate-600">Vue d'ensemble de votre association</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Rôle actuel</p>
          <p className="text-indigo-600 font-medium">
            {userRole === 'admin' ? 'Administrateur' : 'Trésorier'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-2xl text-slate-900 mb-2">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      {stat.trend === 'up' && <ArrowUpRight className="size-4 text-emerald-600" />}
                      {stat.trend === 'down' && <ArrowDownRight className="size-4 text-red-600" />}
                      <p className={`text-xs ${stat.trend === 'up' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="size-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Finance Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="size-5 text-indigo-600" />
              Évolution Financière Mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorEntrees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSorties" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="entrees" stroke="#10b981" fillOpacity={1} fill="url(#colorEntrees)" name="Entrées (€)" />
                <Area type="monotone" dataKey="sorties" stroke="#ef4444" fillOpacity={1} fill="url(#colorSorties)" name="Sorties (€)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Coins className="size-5 text-indigo-600" />
              Répartition par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Users className="size-5 text-indigo-600" />
              Taux de Présence aux Séances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value) => `${value}%`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="taux" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  name="Taux de présence (%)"
                  dot={{ fill: '#6366f1', r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="size-5 text-indigo-600" />
              Activités Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{activity.description}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${activity.amount.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>
                      {activity.amount}
                    </p>
                    <span className="text-xs text-slate-500">{activity.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900">Statistiques Détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-900">Membres Actifs</p>
                  <p className="text-xl text-blue-800">{stats.membresActifs}</p>
                </div>
              </div>
              <span className="text-sm text-blue-600">100%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Coins className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-900">Tontines traitées</p>
                  <p className="text-xl text-blue-800">{stats.tontinesTraitees}</p>
                </div>
              </div>
              <span className="text-sm text-purple-600">Actives</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Heart className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-900">Aides accordées</p>
                  <p className="text-xl text-blue-800">{stats.aidesAccordees}</p>
                </div>
              </div>
              <span className="text-sm text-emerald-600">Ce mois</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <GraduationCap className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-900">Prêts scolaires</p>
                  <p className="text-xl text-blue-800">{stats.pretsScolaires}</p>
                </div>
              </div>
              <span className="text-sm text-orange-600">En cours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}