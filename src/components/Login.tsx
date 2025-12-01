// Login.tsx - Version corrigée
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Lock, User, ShieldCheck, Mail } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { authService } from '../lib/appwrite-service';

interface LoginProps {
  onLogin: (role: 'admin' | 'tresorier') => void;
}

type LoginMethod = 'demo' | 'appwrite';

export function Login({ onLogin }: LoginProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    appwritePassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('demo');

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulation d'authentification démo
    setTimeout(() => {
      if (formData.username === 'admin' && formData.password === 'admin123') {
        onLogin('admin'); 
      } else if (formData.username === 'tresorier' && formData.password === 'tresorier123') {
        onLogin('tresorier');
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleAppwriteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { user } = await authService.login(formData.email, formData.appwritePassword);
      const role = await authService.getUserRole(user);
      onLogin(role);
    } catch (error: any) {
      setError(error.message || 'Erreur de connexion avec Appwrite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (loginMethod === 'demo') {
      return handleDemoLogin(e);
    } else {
      return handleAppwriteLogin(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      
      <Card className="w-full max-w-md relative shadow-2xl border-indigo-800/50 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
              <ShieldCheck className="size-12 text-white" />
            </div>
          </div>
          <div className="text-center">
            <CardTitle className="text-3xl text-indigo-950">AssoFi</CardTitle>
            <CardDescription className="text-base mt-2">
              Gestion des Finances d'une Association
            </CardDescription>
          </div>

          {/* Sélecteur de méthode de connexion */}
          <div className="flex space-x-2 mt-4">
            <Button
              type="button"
              variant={loginMethod === 'demo' ? 'default' : 'outline'}
              onClick={() => setLoginMethod('demo')}
              className="flex-1"
            >
              Démo
            </Button>
            <Button
              type="button"
              variant={loginMethod === 'appwrite' ? 'default' : 'outline'}
              onClick={() => setLoginMethod('appwrite')}
              className="flex-1"
            >
              Appwrite
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {loginMethod === 'demo' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700">
                    Nom d'utilisateur
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Entrez votre nom d'utilisateur"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Entrez votre mot de passe"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Entrez votre email"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appwritePassword" className="text-slate-700">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                    <Input
                      id="appwritePassword"
                      type="password"
                      value={formData.appwritePassword}
                      onChange={(e) => setFormData({ ...formData, appwritePassword: e.target.value })}
                      placeholder="Entrez votre mot de passe Appwrite"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          {loginMethod === 'demo' && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-indigo-900 mb-2">Comptes de démonstration :</p>
              <div className="space-y-1 text-xs text-indigo-700">
                <p>• Admin: <code className="bg-white px-2 py-0.5 rounded">admin / admin123</code></p>
                <p>• Trésorier: <code className="bg-white px-2 py-0.5 rounded">tresorier / tresorier123</code></p>
              </div>
            </div>
          )}

          {loginMethod === 'appwrite' && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-900 mb-2">Connexion Appwrite :</p>
              <div className="space-y-1 text-xs text-blue-700">
                <p>• Utilisez vos identifiants Appwrite</p>
                <p>• Les rôles sont déterminés par l'email ou les labels</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}