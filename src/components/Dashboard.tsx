import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, Wallet, CalendarDays, TrendingUp, Heart, GraduationCap, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  userRole: 'admin' | 'tresorier';
}

export function Dashboard({ userRole }: DashboardProps) {
  const stats = [
    {
      title: 'Membres Actifs',
      value: '48',
      icon: Users,
      color: 'bg-blue-500',
      change: '+3 ce mois',
      trend: 'up'
    },
    {
      title: 'Caisse Générale',
      value: '12,450€',
      icon: Wallet,
      color: 'bg-emerald-500',
      change: '+850€ ce mois',
      trend: 'up'
    },
    {
      title: 'Caisse Scolaire',
      value: '8,200€',
      icon: GraduationCap,
      color: 'bg-purple-500',
      change: '+400€ ce mois',
      trend: 'up'
    },
    {
      title: 'Prochaine Séance',
      value: 'Dans 3 jours',
      icon: CalendarDays,
      color: 'bg-orange-500',
      change: 'Samedi 22 Nov',
      trend: 'neutral'
    },
  ];

  const monthlyData = [
    { month: 'Jan', entrees: 4200, sorties: 3100, net: 1100 },
    { month: 'Fev', entrees: 5100, sorties: 3600, net: 1500 },
    { month: 'Mar', entrees: 4800, sorties: 3900, net: 900 },
    { month: 'Avr', entrees: 6200, sorties: 4200, net: 2000 },
    { month: 'Mai', entrees: 5800, sorties: 3800, net: 2000 },
    { month: 'Juin', entrees: 6500, sorties: 4100, net: 2400 },
  ];

  const categoryData = [
    { name: 'Tontines', value: 3500, color: '#8b5cf6' },
    { name: 'Aides', value: 1850, color: '#ef4444' },
    { name: 'Prêts', value: 3200, color: '#f59e0b' },
    { name: 'Dons', value: 1200, color: '#ec4899' },
    { name: 'Séances', value: 2800, color: '#06b6d4' },
  ];

  const attendanceData = [
    { month: 'Jan', taux: 85 },
    { month: 'Fev', taux: 88 },
    { month: 'Mar', taux: 82 },
    { month: 'Avr', taux: 90 },
    { month: 'Mai', taux: 87 },
    { month: 'Juin', taux: 89 },
  ];

  const recentActivities = [
    { type: 'Aide', description: 'Aide maladie - Marie Dupont', amount: '150€', date: '15 Nov 2025' },
    { type: 'Tontine', description: 'Bénéficiaire - Jean Martin', amount: '500€', date: '15 Nov 2025' },
    { type: 'Prêt', description: 'Prêt scolaire - Sophie Bernard', amount: '800€', date: '10 Nov 2025' },
    { type: 'Don', description: 'Don anonyme', amount: '200€', date: '08 Nov 2025' },
    { type: 'Séance', description: 'Entretien salle + repas', amount: '-125€', date: '01 Nov 2025' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-indigo-950 mb-2">Tableau de bord</h1>
          <p className="text-slate-600">Vue d'ensemble de votre association</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Rôle actuel</p>
          <p className="text-indigo-600">
            {userRole === 'admin' ? 'Administrateur' : 'Trésorier'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
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
          <CardTitle className="text-slate-900">Statistiques Mensuelles Détaillées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Présences</p>
                  <p className="text-xl text-slate-900">42/48</p>
                </div>
              </div>
              <span className="text-sm text-blue-600">87.5%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Coins className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Tontines traitées</p>
                  <p className="text-xl text-slate-900">9</p>
                </div>
              </div>
              <span className="text-sm text-purple-600">3 séances</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Heart className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Aides accordées</p>
                  <p className="text-xl text-slate-900">12</p>
                </div>
              </div>
              <span className="text-sm text-emerald-600">1,850€</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <GraduationCap className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Prêts scolaires</p>
                  <p className="text-xl text-slate-900">5</p>
                </div>
              </div>
              <span className="text-sm text-orange-600">3,200€</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}