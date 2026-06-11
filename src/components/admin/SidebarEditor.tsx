import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';
import { githubApi } from '../../lib/adminApi';

export default function SidebarEditor() {
    const [config, setConfig] = useState({
        author: {
            name: '',
            description: '',
            avatar: ''
        }
    });
    const [fileSha, setFileSha] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const configData = await githubApi('read', 'src/data/sidebar.json').catch(() => null);
                if (configData && configData.content) {
                    const parsed = JSON.parse(configData.content);
                    setConfig(parsed);
                    setFileSha(configData.sha);
                } else {
                    // Fallback para tentar ler do siteConfig se o sidebar.json não existir
                    const siteDataRaw = await githubApi('read', 'src/data/siteConfig.json').catch(() => null);
                    if (siteDataRaw && siteDataRaw.content) {
                        const siteData = JSON.parse(siteDataRaw.content);
                        setConfig({
                            author: {
                                name: siteData.name || 'MEU BLOG',
                                description: siteData.description || '',
                                avatar: ''
                            }
                        });
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
        load();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await githubApi('write', 'src/data/sidebar.json', {
                content: JSON.stringify(config, null, 4),
                sha: fileSha
            });
            const fresh = await githubApi('read', 'src/data/sidebar.json');
            setFileSha(fresh.sha);
            alert('Configurações da barra lateral salvas com sucesso!');
        } catch (error) {
            alert('Erro ao salvar as configurações.');
        }
        setLoading(false);
    };

    const updateAuthor = (field: string, value: string) => {
        setConfig(prev => ({
            ...prev,
            author: { ...prev.author, [field]: value }
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Barra Lateral (Sidebar)</h2>
                    <p className="text-slate-500 text-sm mt-1">Configure o widget "Sobre o Autor / Meu Blog" da barra lateral dos artigos.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50 font-medium"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Caixa do Autor / Destaque</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Imagem / Avatar (Formato redondo)</label>
                        <div className="flex items-center gap-4 mb-3">
                            {config.author.avatar ? (
                                <img src={config.author.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover shadow-sm border border-slate-200" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                    <ImageIcon className="w-6 h-6 opacity-50" />
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                    Caminho da Imagem
                                </label>
                                <input
                                    type="text"
                                    value={config.author.avatar}
                                    onChange={e => updateAuthor('avatar', e.target.value)}
                                    placeholder="Ex: /images/autor.jpg ou https://..."
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Título (ex: MEU BLOG ou Nome do Autor)</label>
                        <input
                            type="text"
                            value={config.author.name}
                            onChange={e => updateAuthor('name', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
                        <textarea
                            value={config.author.description}
                            onChange={e => updateAuthor('description', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-slate-800 resize-none"
                            placeholder="Escreva uma pequena biografia ou descrição sobre o seu blog..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
