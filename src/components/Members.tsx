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
  Plus, Search, Edit, Trash2, UserCircle, Mail, Phone,
  Calendar, Loader2, MapPin, User, Image, X,
  ChevronUp, ChevronDown, TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { databaseService, storageService } from './../lib/appwrite-service';
import { Query } from 'appwrite';

/* ----------------------------- Interfaces ----------------------------- */
interface Member {
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
  const handlePhotoInput = (file?: File | null) => {
    if (!file) { setPhotoFile(null); setPhotoPreview(''); return; }
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) { setError('Format non supporté'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Trop volumineux'); return; }
    setError(null); setPhotoFile(file);
    const reader = new FileReader(); reader.onload = (ev) => setPhotoPreview(ev.target?.result as string); reader.readAsDataURL(file);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Gestion des Membres</h1>
          <p className="text-sm text-slate-500">{members.length} membre(s)</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>Liste</Button>
            <Button variant={viewMode === 'gallery' ? 'default' : 'outline'} onClick={() => setViewMode('gallery')}>Galerie</Button>
          </div>

          {userRole === 'admin' && (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleOpenAdd}>
              <Plus className="size-4 mr-2" /> Nouveau
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Membres Actifs</p>
                <p className="text-3xl text-emerald-600">{activeMembers}</p>
                <p className="text-xs text-slate-500 mt-1">{Math.round((activeMembers / members.length) * 100) || 0}% du total</p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-lg">
                <UserCircle className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Membres Inactifs</p>
                <p className="text-3xl text-red-600">{inactiveMembers + suspendusMembers + exclusMembers + demissionnairesMembers}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {suspendusMembers} susp. • {exclusMembers} excl. • {demissionnairesMembers} démi. • {inactiveMembers} désac.
                </p>
              </div>
              <div className="p-3 bg-red-500 rounded-lg">
                <UserCircle className="size-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte Total Membres cliquable */}
        <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
          <DialogTrigger asChild>
            <Card className="border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Membres</p>
                    <p className="text-3xl text-indigo-600">{members.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Cliquez pour voir les stats</p>
                  </div>
                  <div className="p-3 bg-indigo-500 rounded-lg">
                    <UserCircle className="size-6 text-white" />
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

      {/* Search */}
      <div className="w-full max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input className="pl-10" placeholder="Rechercher un membre..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
      </div>

      {/* Main content */}
      {loading ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="size-8 animate-spin text-indigo-600" /><span className="ml-3 text-slate-600">Chargement...</span></div>
      ) : (
        <>
          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"> <UserCircle className="size-5 text-indigo-600" /> Liste des Membres <Badge variant="outline">{filteredMembers.length}</Badge></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Photo</TableHead>
                        <SortableHeader field="prenoms">Nom</SortableHeader>
                        <SortableHeader field="email">Email</SortableHeader>
                        <SortableHeader field="role">Rôle</SortableHeader>
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
                            <TableCell>
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                                {m.photo ? <img src={getPhotoUrl(m.photo) || getPhotoUrl('692866cc002216f8739b')} alt={`${m.prenoms} ${m.noms}`} className="w-full h-full object-cover" /> : <User className="size-5 text-slate-400" />}
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-900 font-medium">{m.prenoms} {m.noms}</TableCell>
                            <TableCell className="text-slate-600">{m.email || '—'}</TableCell>
                            <TableCell><Badge className={getRoleBadgeColor(m.role)}>{m.role || 'membre'}</Badge></TableCell>
                            <TableCell><Badge className={getStatusBadgeColor(m.statut)}>{getStatusDisplayName(m.statut)}</Badge></TableCell>
                            {userRole === 'admin' && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Edit className="size-4 text-indigo-600" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => openDelete(m)}><Trash2 className="size-4 text-red-600" /></Button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedMembers.map((m) => (
                <div key={m.$id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-3">
                  <div className="w-full h-40 bg-slate-100 rounded-md overflow-hidden">
                    {m.photo ? <img src={getPhotoUrl(m.photo)} alt={`${m.prenoms} ${m.noms}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="size-10 text-slate-400" /></div>}
                  </div>

                  <div className="mt-3">
                    <h3 className="font-semibold text-lg text-slate-900 truncate">{m.prenoms} {m.noms}</h3>
                    <p className="text-sm text-slate-500 truncate">{m.email || '—'}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge className={getRoleBadgeColor(m.role)}>{m.role || 'membre'}</Badge>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(m)}><Edit className="size-4 text-indigo-600" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => openDelete(m)}><Trash2 className="size-4 text-red-600" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Précédent</Button>
              <div className="text-sm text-slate-700">Page {currentPage} / {totalPages}</div>
              <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Suivant</Button>
            </div>
          )}
        </>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">Ajouter un membre <Button variant="ghost" size="sm" onClick={() => setIsAddDialogOpen(false)}><X className="size-4" /></Button></DialogTitle>
            <DialogDescription className="text-slate-600">Renseignez les informations du membre.</DialogDescription>
          </DialogHeader>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mt-3">{error}</div>}

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Photo</Label>
              <label className="mt-2 flex items-center gap-4 p-3 border border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handlePhotoInput(e.target.files?.[0])} />
                <div className="flex items-center gap-3">
                  <Image className="size-5 text-indigo-600" />
                  <div>
                    <div className="text-sm font-medium">Cliquer pour importer</div>
                    <div className="text-xs text-slate-500">PNG / JPG / WEBP — max 5MB</div>
                  </div>
                </div>
                {photoPreview && <img src={photoPreview} className="ml-auto w-16 h-16 object-cover rounded-md" alt="preview" />}
              </label>
            </div>

            <div>
              <Label>Prénom *</Label>
              <Input value={formData.prenoms} onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })} />
            </div>
            <div>
              <Label>Nom *</Label>
              <Input value={formData.noms} onChange={(e) => setFormData({ ...formData, noms: e.target.value })} />
            </div>

            <div>
              <Label>Téléphone</Label>
              <Input value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div>
              <Label>Rôle</Label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as Member['role'] })} className="w-full h-11 rounded border px-3">
                <option value="membre">Membre</option>
                <option value="président">Président</option>
                <option value="trésorier">Trésorier</option>
                <option value="secrétaire général">Secrétaire Général</option>
                <option value="commissaire aux comptes">Commissaire aux Comptes</option>
              </select>
            </div>
            <div>
              <Label>Date d'inscription *</Label>
              <Input type="date" value={formData.date_inscription} onChange={(e) => setFormData({ ...formData, date_inscription: e.target.value })} />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>Annuler</Button>
              <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">{saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />} {saving ? 'Enregistrement...' : 'Ajouter'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) { resetForm(); } }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">Modifier le membre <Button variant="ghost" size="sm" onClick={() => setIsEditDialogOpen(false)}><X className="size-4" /></Button></DialogTitle>
            <DialogDescription className="text-slate-600">Mettez à jour les informations du membre.</DialogDescription>
          </DialogHeader>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mt-3">{error}</div>}

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Photo</Label>
              <label className="mt-2 flex items-center gap-4 p-3 border border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handlePhotoInput(e.target.files?.[0])} />
                <div className="flex items-center gap-3">
                  <Image className="size-5 text-indigo-600" />
                  <div>
                    <div className="text-sm font-medium">Cliquer pour remplacer</div>
                    <div className="text-xs text-slate-500">PNG / JPG / WEBP — max 5MB</div>
                  </div>
                </div>
                {photoPreview && <img src={photoPreview} className="ml-auto w-16 h-16 object-cover rounded-md" alt="preview" />}
              </label>
            </div>

            <div>
              <Label>Prénom *</Label>
              <Input value={formData.prenoms} onChange={(e) => setFormData({ ...formData, prenoms: e.target.value })} />
            </div>
            <div>
              <Label>Nom *</Label>
              <Input value={formData.noms} onChange={(e) => setFormData({ ...formData, noms: e.target.value })} />
            </div>

            <div>
              <Label>Téléphone</Label>
              <Input value={formData.telephone} onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>

            <div>
              <Label>Rôle</Label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as Member['role'] })} className="w-full h-11 rounded border px-3">
                <option value="membre">Membre</option>
                <option value="président">Président</option>
                <option value="trésorier">Trésorier</option>
                <option value="secrétaire général">Secrétaire Général</option>
                <option value="commissaire aux comptes">Commissaire aux Comptes</option>
              </select>
            </div>
            <div>
              <Label>Date d'inscription *</Label>
              <Input type="date" value={formData.date_inscription} onChange={(e) => setFormData({ ...formData, date_inscription: e.target.value })} />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white">{saving ? <Loader2 className="size-4 animate-spin mr-2" /> : 'Enregistrer'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[420px] animate-in zoom-in duration-150">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirmer la suppression</DialogTitle>
            <DialogDescription>Cette action est irréversible.</DialogDescription>
          </DialogHeader>

          {memberToDelete && (
            <div className="p-3 bg-slate-50 border rounded mt-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {memberToDelete.photo ? <img src={getPhotoUrl(memberToDelete.photo)} className="w-full h-full object-cover" /> : <User className="size-5 text-slate-400" />}
                </div>
                <div>
                  <div className="font-medium">{memberToDelete.prenoms} {memberToDelete.noms}</div>
                  <div className="text-xs text-slate-500">{memberToDelete.email || '—'}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Annuler</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete}>{saving ? <Loader2 className="size-4 animate-spin mr-2" /> : 'Supprimer'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error banner */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div>}

    </div>
  );
}