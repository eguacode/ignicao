import React, { useState, useEffect } from 'react';
import { Save, Loader2, AlertCircle, LayoutTemplate } from 'lucide-react';
import { triggerToast } from './CmsToaster';
import { githubApi } from '../../lib/adminApi';

type HeroConfig = {
    badge: string;
    titlePrefix: string;
    titleHighlight: string;
    description: string;
    btn1Text: string;
    btn1Link: string;
    btn2Text: string;
    btn2Link: string;
    image: string;
};

const DEFAULT: HeroConfig = {
    badge: "Construa sua Liberdade Financeira com Suporte Profissional",
    titlePrefix: "Acelere o seu Sucesso com uma ",
    titleHighlight: "Mentoria Exclusiva de Negócios",
    description: "Tenha direcionamento passo a passo com quem já conhece o caminho para o topo...",
    btn1Text: "Quero Ser Mentorado",
    btn1Link: "#",
    btn2Text: "Conhecer o Modelo de Negócio",
    btn2Link: "#",
    image: "/images/hero.png"
};

export default function HeroEditor() {
    const [config, setConfig] = useState<HeroConfig>(DEFAULT);
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const configData = await githubApi('read', 'src/data/hero.json').catch(() => null);
                if (configData && configData.content) {
                    const parsed = JSON.parse(configData.content);
                    setConfig({ ...DEFAULT, ...parsed });
                    setFileSha(configData.sha);
                } else {
                    // Try to initialize it if not found
                    await githubApi('write', 'src/data/hero.json', {
                        content: JSON.stringify(DEFAULT, null, 4),
                        sha: ''
                    });
                    const fresh = await githubApi('read', 'src/data/hero.json');
                    setFileSha(fresh.sha);
                    setConfig(DEFAULT);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function save() {
        setSaving(true);
        try {
            await githubApi('write', 'src/data/hero.json', {
                content: JSON.stringify(config, null, 4),
                sha: fileSha,
            });
            const fresh = await githubApi('read', 'src/data/hero.json');
            setFileSha(fresh.sha);
            triggerToast('success', 'Hero atualizada com sucesso!');
        } catch (err: any) {
            triggerToast('error', err.message);
        } finally {
            setSaving(false);
        }
    }

    const handleChange = (key: keyof HeroConfig, value: string) => {
        setConfig(c => ({ ...c, [key]: value }));
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            <span className="text-sm">Carregando dados da Hero...</span>
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 max-w-lg">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
        </div>
    );

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                        <LayoutTemplate className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">Hero da Home</h2>
                        <p className="text-sm text-slate-500">Altere a chamada principal do site</p>
                    </div>
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-500 disabled:opacity-60 transition-all shadow-sm"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Texto do Selo (Badge)
                    </label>
                    <input
                        type="text"
                        value={config.badge}
                        onChange={e => handleChange('badge', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Prefixo do Título (Texto Normal)
                        </label>
                        <input
                            type="text"
                            value={config.titlePrefix}
                            onChange={e => handleChange('titlePrefix', e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Destaque do Título (Colorido)
                        </label>
                        <input
                            type="text"
                            value={config.titleHighlight}
                            onChange={e => handleChange('titleHighlight', e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Descrição
                    </label>
                    <textarea
                        rows={4}
                        value={config.description}
                        onChange={e => handleChange('description', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Texto do Botão 1 (Primário)
                        </label>
                        <input
                            type="text"
                            value={config.btn1Text}
                            onChange={e => handleChange('btn1Text', e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 mb-3"
                        />
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Link do Botão 1 (WhatsApp)
                        </label>
                        <input
                            type="text"
                            value={config.btn1Link}
                            onChange={e => handleChange('btn1Link', e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Texto do Botão 2 (Secundário)
                        </label>
                        <input
                            type="text"
                            value={config.btn2Text}
                            onChange={e => handleChange('btn2Text', e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 mb-3"
                        />
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Link do Botão 2
                        </label>
                        <input
                            type="text"
                            value={config.btn2Link}
                            onChange={e => handleChange('btn2Link', e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Caminho da Imagem Principal
                    </label>
                    <input
                        type="text"
                        value={config.image}
                        onChange={e => handleChange('image', e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                    />
                </div>

            </div>
        </div>
    );
}
