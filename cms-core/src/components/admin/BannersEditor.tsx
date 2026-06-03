import React, { useState, useEffect } from 'react';
import { Save, Loader2, AlertCircle, Image as ImageIcon, Plus, Trash2, GripVertical, Award } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

interface Banner {
    id: string;
    image: string;
    name: string;
}

export default function BannersEditor() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [pendingUploads, setPendingUploads] = useState<Record<string, File>>({});

    useEffect(() => {
        async function load() {
            try {
                const configData = await githubApi('read', 'src/data/banners.json').catch(() => null);
                if (configData && configData.content) {
                    const parsed = JSON.parse(configData.content);
                    setBanners(Array.isArray(parsed) ? parsed : []);
                    setFileSha(configData.sha);
                } else {
                    await githubApi('write', 'src/data/banners.json', { content: '[]', sha: '' });
                    const fresh = await githubApi('read', 'src/data/banners.json');
                    setFileSha(fresh.sha);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });

    async function save() {
        setSaving(true);
        try {
            const finalBanners = [...banners];
            // Process pending uploads
            for (let i = 0; i < finalBanners.length; i++) {
                const b = finalBanners[i];
                if (pendingUploads[b.id]) {
                    const fileObj = pendingUploads[b.id];
                    const base64Content = await fileToBase64(fileObj);
                    const fileExt = fileObj.name.split('.').pop() || 'png';
                    const ghPath = `public/uploads/banner-${Date.now()}-${b.id.substring(0, 4)}.${fileExt}`;
                    await githubApi('write', ghPath, { content: base64Content, isBase64: true });
                    finalBanners[i].image = ghPath.replace('public', '');
                }
            }

            await githubApi('write', 'src/data/banners.json', {
                content: JSON.stringify(finalBanners, null, 4),
                sha: fileSha,
            });
            const fresh = await githubApi('read', 'src/data/banners.json');
            setFileSha(fresh.sha);
            setBanners(finalBanners);
            setPendingUploads({});
            triggerToast('success', 'Banners salvos com sucesso!');
        } catch (err: any) {
            triggerToast('error', err.message);
        } finally {
            setSaving(false);
        }
    }

    const handleAdd = () => {
        setBanners([...banners, { id: Math.random().toString(36).substr(2, 9), image: '', name: '' }]);
    };

    const handleRemove = (id: string) => {
        setBanners(banners.filter(b => b.id !== id));
        const newUploads = { ...pendingUploads };
        delete newUploads[id];
        setPendingUploads(newUploads);
    };

    const handleChange = (id: string, field: string, value: string) => {
        setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingUploads(prev => ({ ...prev, [id]: file }));
        handleChange(id, 'image', URL.createObjectURL(file));
        e.target.value = '';
    };

    const moveBanner = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === banners.length - 1) return;
        const newBanners = [...banners];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const temp = newBanners[index];
        newBanners[index] = newBanners[targetIndex];
        newBanners[targetIndex] = temp;
        setBanners(newBanners);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            <span className="text-sm">Carregando banners...</span>
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 max-w-lg">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
        </div>
    );

    return (
        <div className="max-w-4xl space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                        <Award className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">Banners da Equipe</h2>
                        <p className="text-sm text-slate-500">Adicione banners verticais de qualificação para a página inicial</p>
                    </div>
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-500 disabled:opacity-60 transition-all shadow-sm"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Salvando...' : 'Salvar Banners'}
                </button>
            </div>

            <div className="space-y-4">
                {banners.map((b, i) => (
                    <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex gap-6 items-center">
                        
                        <div className="flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                            <button onClick={() => moveBanner(i, 'up')} disabled={i === 0} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30">▲</button>
                            <button onClick={() => moveBanner(i, 'down')} disabled={i === banners.length - 1} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30">▼</button>
                        </div>

                        {/* Imagem */}
                        <label className="w-24 h-36 shrink-0 group relative border-2 border-dashed border-slate-200 hover:border-violet-400 bg-slate-50 hover:bg-violet-50 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all text-center overflow-hidden">
                            <input type="file" accept="image/*" className="hidden" onChange={e => handleFileSelect(e, b.id)} />
                            {b.image ? (
                                <>
                                    <img src={b.image} alt={b.name} className="absolute inset-0 w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
                                </>
                            ) : (
                                <div className="text-slate-400 group-hover:text-violet-500 transition-colors flex flex-col items-center">
                                    <ImageIcon className="w-6 h-6 mb-1" />
                                    <span className="text-[10px] font-bold">Upload Vertical</span>
                                </div>
                            )}
                        </label>

                        {/* Campos */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Nome / Descrição do Banner
                                </label>
                                <input
                                    type="text"
                                    value={b.name}
                                    onChange={e => handleChange(b.id, 'name', e.target.value)}
                                    placeholder="Ex: Diamante - João Silva"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                                />
                            </div>
                            {pendingUploads[b.id] && <span className="text-xs text-amber-600 font-bold block">Upload pendente...</span>}
                        </div>

                        {/* Excluir */}
                        <button
                            onClick={() => handleRemove(b.id)}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                            title="Remover Banner"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}

                {banners.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Award className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                        <h3 className="text-sm font-bold text-slate-600">Nenhum banner cadastrado</h3>
                        <p className="text-sm text-slate-400 mb-4">Clique abaixo para adicionar o primeiro banner da equipe.</p>
                    </div>
                )}

                <button
                    onClick={handleAdd}
                    className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-violet-400 text-slate-500 hover:text-violet-600 bg-white hover:bg-violet-50 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold text-sm"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Novo Banner
                </button>
            </div>
        </div>
    );
}
