import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogDescription
} from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Plus, Search, Edit, Trash2, UserCircle, Mail, Phone,
  Calendar, Loader2, MapPin, User, Image, X,
  ChevronUp, ChevronDown, TrendingUp, Upload, CheckCircle2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { databaseService, storageService } from './../lib/appwrite-service';
import { Query } from 'appwrite';
import { MemberForm } from './MemberForm';

/* ----------------------------- Interfaces ----------------------------- */
export interface Member {
  $id: string;
  prenoms: string;
  noms: string;
  telephone?: string;
  email?: string;
  statut: 'actif(ve)' | 'suspendu(e)' | 'démissionnaire' | 'exclu(e)' | 'inactif(ve)';
  date_inscription: string;
  lieu_residence?: string;
  role?: 'président' | 'trésorier' | 'secrétaire général' | 'commissaire aux comptes' | 'membre';
  photo?: string;
  $createdAt: string;
  $updatedAt: string;
}

interface MembersProps { userRole: 'admin' | 'tresorier' }

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '69243fec00044331ef75';
const MEMBERS_COLLECTION_ID = 'membres';
const PHOTOS_BUCKET_ID = '69283dc90029fb33c10c';

export function Members({ userRole }: MembersProps) {
  /* ----------------------------- États ----------------------------- */
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recherche
  const [searchQuery, setSearchQuery] = useState('');

  // Vue (liste / galerie)
  const [viewMode, setViewMode] = useState<'list' | 'gallery'>('list');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPageListe = 10;
  const itemsPerPageGallery = 6;
  let itemsPerPage = itemsPerPageListe;

  // Modales et formulaires
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Stepper pour les formulaires
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Tri
  const [sortField, setSortField] = useState<keyof Member>('$createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [formData, setFormData] = useState({
    prenoms: '',
    noms: '',
    telephone: '',
    email: '',
    lieu_residence: '',
    role: 'membre' as Member['role'],
    date_inscription: new Date().toISOString().split('T')[0],
    statut: 'actif(ve)' as Member['statut']
  });

  /* ----------------------------- Load members ----------------------------- */
  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await databaseService.listDocuments(DATABASE_ID, MEMBERS_COLLECTION_ID, [Query.orderDesc('$createdAt')]);
      setMembers(res.documents as Member[]);
    } catch (err: any) {
      console.error(err);
      setError('Impossible de charger les membres');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadMembers(); }, []);

  /* ----------------------------- Upload image ----------------------------- */
  const uploadPhoto = async (file: File) => {
    try {
      // validations client
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) throw new Error('Format non supporté');
      if (file.size > 5 * 1024 * 1024) throw new Error('Fichier trop lourd (max 5MB)');

      const res = await storageService.uploadFile(PHOTOS_BUCKET_ID, file);
      return res.$id;
    } catch (err: any) {
      console.error('Upload photo error', err);
      setError(err.message || 'Erreur upload');
      return null;
    }
  };

  const getPhotoUrl = (fileId?: string) => fileId ? storageService.getFileView(PHOTOS_BUCKET_ID, fileId) : '';

  /* ----------------------------- Tri ----------------------------- */
  const handleSort = (field: keyof Member) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  /* ----------------------------- Filtrage & Pagination ----------------------------- */
  const filteredMembers = sortedMembers.filter((m) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (`${m.prenoms} ${m.noms}`.toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q) || (m.telephone || '').toLowerCase().includes(q));
  });

  itemsPerPage = viewMode === 'list' ? itemsPerPageListe : itemsPerPageGallery;

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  // Clamp currentPage
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [totalPages]);

  const paginatedMembers = filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  /* ----------------------------- Handlers CRUD ----------------------------- */
  const resetForm = () => {
    setFormData({ prenoms: '', noms: '', telephone: '', email: '', lieu_residence: '', role: 'membre', date_inscription: new Date().toISOString().split('T')[0], statut: 'actif(ve)' });
    setPhotoFile(null); setPhotoPreview(''); setSelectedMember(null);
    setCurrentStep(1);
    setError(null);
  };

  const handleOpenAdd = () => { resetForm(); setIsAddDialogOpen(true); };

  const handleAdd = async () => {
    if (!formData.prenoms || !formData.noms) { setError('Prénom et nom requis'); return; }
    try {
      setSaving(true); setError(null);
      let pid = null;
      if (photoFile) pid = await uploadPhoto(photoFile);
      await databaseService.createDocument(DATABASE_ID, MEMBERS_COLLECTION_ID, { ...formData, ...(pid && { photo: pid }) });
      setIsAddDialogOpen(false); resetForm(); loadMembers();
    } catch (err: any) {
      console.error(err); setError('Erreur lors de l\'ajout');
    } finally { setSaving(false); }
  };

  const openEdit = (m: Member) => {
    setSelectedMember(m);
    setFormData({ prenoms: m.prenoms, noms: m.noms, telephone: m.telephone || '', email: m.email || '', lieu_residence: m.lieu_residence || '', role: m.role || 'membre', date_inscription: m.date_inscription, statut: m.statut });
    setPhotoPreview(getPhotoUrl(m.photo)); setPhotoFile(null);
    setIsEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedMember) return;
    try {
      setSaving(true); setError(null);
      let pid = selectedMember.photo;
      if (photoFile) pid = await uploadPhoto(photoFile) || pid;
      await databaseService.updateDocument(DATABASE_ID, MEMBERS_COLLECTION_ID, selectedMember.$id, { ...formData, ...(pid && { photo: pid }) });
      setIsEditDialogOpen(false); resetForm(); loadMembers();
    } catch (err: any) { console.error(err); setError('Erreur mise à jour'); } finally { setSaving(false); }
  };

  const openDelete = (m: Member) => { setMemberToDelete(m); setIsDeleteDialogOpen(true); };
  const handleDelete = async () => {
    if (!memberToDelete) return;
    try {
      setSaving(true); setError(null);
      // Optionnel: delete file via storageService.deleteFile
      await databaseService.deleteDocument(DATABASE_ID, MEMBERS_COLLECTION_ID, memberToDelete.$id);
      setIsDeleteDialogOpen(false); setMemberToDelete(null); loadMembers();
    } catch (err: any) { console.error(err); setError('Erreur suppression'); } finally { setSaving(false); }
  };

  /* ----------------------------- Photo input helper ----------------------------- */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Format non supporté (JPG, PNG, WebP uniquement)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image trop volumineuse (max 5MB)');
        return;
      }
      setError(null);
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setPhotoPreview('');
    setPhotoFile(null);
  };

  /* ----------------------------- Stats ----------------------------- */
  const activeMembers = members.filter(m => m.statut === 'actif(ve)').length;
  const suspendusMembers = members.filter(m => m.statut === 'suspendu(e)').length;
  const exclusMembers = members.filter(m => m.statut === 'exclu(e)').length;
  const demissionnairesMembers = members.filter(m => m.statut === 'démissionnaire').length;
  const inactiveMembers = members.filter(m => m.statut === 'inactif(ve)').length;

  const statusData = [
    { name: 'Actifs', value: activeMembers, color: '#10b981' },
    { name: 'Suspendus', value: suspendusMembers, color: '#f59e0b' },
    { name: 'Exclus', value: exclusMembers, color: '#ef4444' },
    { name: 'Démissionnaires', value: demissionnairesMembers, color: '#8b5cf6' },
    { name: 'Inactifs', value: inactiveMembers, color: '#64748b' },
  ];

  /* ----------------------------- UI helpers ----------------------------- */
  const getRoleBadgeColor = (role?: Member['role']) => {
    switch (role) {
      case 'président': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'trésorier': return 'bg-red-100 text-red-800 border-red-200';
      case 'secrétaire général': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'commissaire aux comptes': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  const getStatusBadgeColor = (statut: Member['statut']) => {
    switch (statut) {
      case 'actif(ve)': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'suspendu(e)': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'exclu(e)': return 'bg-red-100 text-red-800 border-red-200';
      case 'démissionnaire': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusDisplayName = (statut: Member['statut']) => {
    switch (statut) {
      case 'actif(ve)': return 'Actif(ve)';
      case 'suspendu(e)': return 'Suspendu(e)';
      case 'exclu(e)': return 'Exclu(e)';
      case 'démissionnaire': return 'Démissionnaire';
      case 'inactif(ve)': return 'Désactivé(e)';
      default: return statut;
    }
  };

  const SortableHeader = ({
    field,
    children,
    className = ""
  }: {
    field: keyof Member;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead
      className={`cursor-pointer hover:bg-slate-100 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ?
            <ChevronUp className="size-4" /> :
            <ChevronDown className="size-4" />
        )}
      </div>
    </TableHead>
  );

  /* ----------------------------- Rendu ----------------------------- */
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Gestion des Membres</h1>
          <p className="text-sm text-slate-500 mt-1">{members.length} membre(s)</p>
        </div>

        <div className="flex items-center gap-3  sm:w-auto">
          {userRole === 'admin' && (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-none" onClick={handleOpenAdd}>
              <Plus className="size-4 mr-2" /> Nouveau
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 py-2">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Membres Actifs</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{activeMembers}</p>
                <p className="text-xs text-slate-500 mt-1">{Math.round((activeMembers / members.length) * 100) || 0}% du total</p>
              </div>
              <div className="p-2 sm:p-3 bg-emerald-500 rounded-lg">
                <UserCircle className="size-5 sm:size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1">Membres Inactifs</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">{inactiveMembers + suspendusMembers + exclusMembers + demissionnairesMembers}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {suspendusMembers} susp. • {exclusMembers} excl. • {demissionnairesMembers} démi. • {inactiveMembers} désac.
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-red-500 rounded-lg">
                <UserCircle className="size-5 sm:size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte Total Membres cliquable */}
        <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
          <DialogTrigger asChild>
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">Total Membres</p>
                    <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{members.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Cliquez pour voir les stats</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-indigo-500 rounded-lg">
                    <UserCircle className="size-5 sm:size-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-900">
                <User className="size-5 text-indigo-600" />
                Répartition des Membres par Statut
              </DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} membres`, 'Quantité']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Légende détaillée */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {statusData.map((status, index) => (
                  <div key={status.name} className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm text-slate-700">{status.name}</span>
                    <span className="text-sm font-medium text-slate-900 ml-auto">
                      {status.value} ({Math.round((status.value / members.length) * 100) || 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & View Mode */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 py-4 border-y border-slate-200">
        <div className="w-full sm:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 sm:size-5" />
          <Input className="pl-9 sm:pl-10 h-10 sm:h-11" placeholder="Rechercher un membre..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
        </div>

        <div className="flex items-center gap-2 sm:w-auto">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className="flex-1 sm:flex-none"
          >
            Liste
          </Button>
          <Button
            variant={viewMode === 'gallery' ? 'default' : 'outline'}
            onClick={() => setViewMode('gallery')}
            className="flex-1 sm:flex-none"
          >
            Galerie
          </Button>
        </div>
      </div>

      {/* Main content */}
      {loading ? (
        <div className="flex items-center mt-5 justify-center py-10"><Loader2 className="size-8 animate-spin text-indigo-600" /><span className="ml-3 text-slate-600">Chargement...</span></div>
      ) : (
        <>
          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
                  <div className="flex items-center gap-2">
                    <UserCircle className="size-5 text-indigo-600" />
                    <span>Liste des Membres</span>
                  </div>
                  <Badge variant="outline">{filteredMembers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="rounded-none sm:rounded-lg border-0 sm:border border-slate-200 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="hidden sm:table-cell">Photo</TableHead>
                        <SortableHeader field="prenoms">Nom</SortableHeader>
                        <SortableHeader field="email" className="hidden md:table-cell">Email</SortableHeader>
                        <SortableHeader field="role" className="hidden lg:table-cell">Rôle</SortableHeader>
                        <SortableHeader field="statut">Statut</SortableHeader>
                        {userRole === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={userRole === 'admin' ? 6 : 5} className="text-center py-8 text-slate-500">Aucun membre trouvé</TableCell>
                        </TableRow>
                      ) : (
                        paginatedMembers.map((m) => (
                          <TableRow key={m.$id} className="hover:bg-slate-50">
                            <TableCell className="hidden sm:table-cell">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                                {m.photo ? <img src={getPhotoUrl(m.photo) || getPhotoUrl('692866cc002216f8739b')} alt={`${m.prenoms} ${m.noms}`} className="w-full h-full object-cover" /> : <User className="size-5 text-slate-400" />}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-900 font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 sm:hidden rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
                                  {m.photo ? <img src={getPhotoUrl(m.photo) || getPhotoUrl('692866cc002216f8739b')} alt={`${m.prenoms} ${m.noms}`} className="w-full h-full object-cover" /> : <User className="size-4 text-slate-400" />}
                                </div>
                                <div>
                                  <div className="text-sm sm:text-base">{m.prenoms} {m.noms}</div>
                                  <div className="text-xs text-slate-500 md:hidden">{m.email || '—'}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-600 hidden md:table-cell">{m.email || '—'}</TableCell>
                            <TableCell className="hidden lg:table-cell"><Badge className={getRoleBadgeColor(m.role)}>{m.role || 'membre'}</Badge></TableCell>
                            <TableCell><Badge className={`${getStatusBadgeColor(m.statut)} text-xs`}>{getStatusDisplayName(m.statut)}</Badge></TableCell>
                            {userRole === 'admin' && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1 sm:gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Edit className="size-3 sm:size-4 text-indigo-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => openDelete(m)}><Trash2 className="size-3 sm:size-4 text-red-600" /></Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* GALLERY VIEW */}
          {viewMode === 'gallery' && (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {paginatedMembers.map((m) => (
                <div key={m.$id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-3">
                  <div className="w-full h-32 sm:h-40 bg-slate-100 rounded-md overflow-hidden">
                    {m.photo ? <img src={getPhotoUrl(m.photo)} alt={`${m.prenoms} ${m.noms}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="size-8 sm:size-10 text-slate-400" /></div>}
                  </div>

                  <div className="mt-3">
                    <h3 className="font-semibold text-base sm:text-lg text-slate-900 truncate">{m.prenoms} {m.noms}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">{m.email || '—'}</p>
                    <div className="flex items-center justify-between mt-3 gap-2">
                      <Badge className={`${getRoleBadgeColor(m.role)} text-xs truncate`}>{m.role || 'membre'}</Badge>
                      {userRole === 'admin' && (
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(m)} className="h-8 w-8 p-0"><Edit className="size-3 sm:size-4 text-indigo-600" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => openDelete(m)} className="h-8 w-8 p-0"><Trash2 className="size-3 sm:size-4 text-red-600" /></Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-full sm:w-auto"
              >
                Précédent
              </Button>
              <div className="text-sm text-slate-700 whitespace-nowrap">
                Page {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-full sm:w-auto"
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add Dialog - Style Tontine avec Stepper */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open: boolean) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau membre</DialogTitle>
          </DialogHeader>

          {/* Progress Indicator - 3 lignes horizontales */}
          <div className="flex items-center justify-center gap-[5px] mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 max-w-[80px] rounded-full transition-all duration-300 ${currentStep >= step ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mt-2">
              {error}
            </div>
          )}

          <div className="space-y-4 pt-2">
            {/* Étape 1: Identité */}
            {currentStep === 1 && (
              <>
                {/* Profile Photo Upload */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100 bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center shadow-lg">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-16 w-16 text-indigo-300" />
                      )}
                    </div>

                    {photoPreview ? (
                      <button
                        type="button"
                        onClick={removeProfileImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-all hover:scale-110"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2.5 shadow-lg cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110">
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <p className="text-center text-sm text-slate-500">
                  Photo de profil (optionnel)
                </p>

                <div className="space-y-2">
                  <Label htmlFor="prenoms">Prénom *</Label>
                  <Input
                    id="prenoms"
                    value={formData.prenoms}
                    onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })}
                    placeholder="Entrez le prénom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="noms">Nom *</Label>
                  <Input
                    id="noms"
                    value={formData.noms}
                    onChange={(e) => setFormData({ ...formData, noms: e.target.value })}
                    placeholder="Entrez le nom"
                  />
                </div>
              </>
            )}

            {/* Étape 2: Contact */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+225 07 00 00 00 00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemple@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lieu_residence">Lieu de résidence</Label>
                  <Input
                    id="lieu_residence"
                    value={formData.lieu_residence}
                    onChange={(e) => setFormData({ ...formData, lieu_residence: e.target.value })}
                    placeholder="Quartier, Ville"
                  />
                </div>
              </>
            )}

            {/* Étape 3: Adhésion */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: string) => setFormData({ ...formData, role: value as Member['role'] })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="membre">Membre</SelectItem>
                      <SelectItem value="président">Président</SelectItem>
                      <SelectItem value="trésorier">Trésorier</SelectItem>
                      <SelectItem value="secrétaire général">Secrétaire Général</SelectItem>
                      <SelectItem value="commissaire aux comptes">Commissaire aux Comptes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-date_inscription">Date d'inscription *</Label>
                  <Input
                    id="add-date_inscription"
                    type="date"
                    value={formData.date_inscription}
                    onChange={(e) => setFormData({ ...formData, date_inscription: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select
                    value={formData.statut}
                    onValueChange={(value: string) => setFormData({ ...formData, statut: value as Member['statut'] })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="actif(ve)">Actif(ve)</SelectItem>
                      <SelectItem value="suspendu(e)">Suspendu(e)</SelectItem>
                      <SelectItem value="inactif(ve)">Inactif(ve)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <DialogFooter className="flex gap-2 pt-4">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex-1"
                  disabled={saving}
                >
                  Retour
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => { setIsAddDialogOpen(false); resetForm(); }}
                  className="flex-1"
                  disabled={saving}
                >
                  Annuler
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button
                  onClick={() => {
                    if (currentStep === 1 && (!formData.prenoms || !formData.noms)) {
                      setError('Prénom et nom requis');
                      return;
                    }
                    setError(null);
                    setCurrentStep(prev => prev + 1);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleAdd}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={saving || !formData.prenoms || !formData.noms}
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    'Créer le membre'
                  )}
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Style Tontine avec Stepper */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open: boolean) => { setIsEditDialogOpen(open); if (!open) { resetForm(); } }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le membre</DialogTitle>
          </DialogHeader>

          {/* Progress Indicator - 3 lignes horizontales */}
          <div className="flex items-center justify-center gap-[5px] mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 max-w-[80px] rounded-full transition-all duration-300 ${currentStep >= step ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mt-2">
              {error}
            </div>
          )}

          <div className="space-y-4 pt-2">
            {/* Étape 1: Identité */}
            {currentStep === 1 && (
              <>
                {/* Profile Photo Upload */}
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100 bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center shadow-lg">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-16 w-16 text-indigo-300" />
                      )}
                    </div>

                    {photoPreview ? (
                      <button
                        type="button"
                        onClick={removeProfileImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-all hover:scale-110"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2.5 shadow-lg cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110">
                        <Upload className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <p className="text-center text-sm text-slate-500">
                  Photo de profil (optionnel)
                </p>

                <div className="space-y-2">
                  <Label htmlFor="edit-prenoms">Prénom *</Label>
                  <Input
                    id="edit-prenoms"
                    value={formData.prenoms}
                    onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })}
                    placeholder="Entrez le prénom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-noms">Nom *</Label>
                  <Input
                    id="edit-noms"
                    value={formData.noms}
                    onChange={(e) => setFormData({ ...formData, noms: e.target.value })}
                    placeholder="Entrez le nom"
                  />
                </div>
              </>
            )}

            {/* Étape 2: Contact */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-telephone">Téléphone</Label>
                  <Input
                    id="edit-telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+225 07 00 00 00 00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemple@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-lieu_residence">Lieu de résidence</Label>
                  <Input
                    id="edit-lieu_residence"
                    value={formData.lieu_residence}
                    onChange={(e) => setFormData({ ...formData, lieu_residence: e.target.value })}
                    placeholder="Quartier, Ville"
                  />
                </div>
              </>
            )}

            {/* Étape 3: Adhésion */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rôle</Label>
                  <select
                    id="edit-role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as Member['role'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="membre">Membre</option>
                    <option value="président">Président</option>
                    <option value="trésorier">Trésorier</option>
                    <option value="secrétaire général">Secrétaire Général</option>
                    <option value="commissaire aux comptes">Commissaire aux Comptes</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-date_inscription">Date d'inscription *</Label>
                  <Input
                    id="edit-date_inscription"
                    type="date"
                    value={formData.date_inscription}
                    onChange={(e) => setFormData({ ...formData, date_inscription: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-statut">Statut</Label>
                  <select
                    id="edit-statut"
                    value={formData.statut}
                    onChange={(e) => setFormData({ ...formData, statut: e.target.value as Member['statut'] })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="actif(ve)">Actif(ve)</option>
                    <option value="suspendu(e)">Suspendu(e)</option>
                    <option value="inactif(ve)">Inactif(ve)</option>
                  </select>
                </div>
              </>
            )}

            <DialogFooter className="flex gap-2 pt-4">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex-1"
                  disabled={saving}
                >
                  Retour
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => { setIsEditDialogOpen(false); resetForm(); }}
                  className="flex-1"
                  disabled={saving}
                >
                  Annuler
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button
                  onClick={() => {
                    if (currentStep === 1 && (!formData.prenoms || !formData.noms)) {
                      setError('Prénom et nom requis');
                      return;
                    }
                    setError(null);
                    setCurrentStep(prev => prev + 1);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleEdit}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={saving || !formData.prenoms || !formData.noms}
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[420px] animate-in zoom-in duration-150">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-base sm:text-lg">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-sm">Cette action est irréversible.</DialogDescription>
          </DialogHeader>

          {memberToDelete && (
            <div className="p-3 bg-slate-50 border rounded mt-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {memberToDelete.photo ? <img src={getPhotoUrl(memberToDelete.photo)} className="w-full h-full object-cover" /> : <User className="size-4 sm:size-5 text-slate-400" />}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base truncate">{memberToDelete.prenoms} {memberToDelete.noms}</div>
                  <div className="text-xs text-slate-500 truncate">{memberToDelete.email || '—'}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="w-full sm:w-auto">Annuler</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto" onClick={handleDelete}>{saving ? <Loader2 className="size-4 animate-spin mr-2" /> : 'Supprimer'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error banner */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 rounded text-sm">{error}</div>}

    </div>
  );
}