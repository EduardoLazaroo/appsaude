'use client';

import { useEffect, useState } from 'react';

type Idea = {
  id: string;
  theme: string;
  subtheme: string;
  status: string;
  type: string;
  text: string;
  tags: string[];
  date: string | null;
};

type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  contentSnippet: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'ideias' | 'noticias'>('ideias');
  
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const [toasts, setToasts] = useState<{id: number, message: string}[]>([]);

  function showToast(message: string) {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  async function loadIdeas() {
    setLoading(true);
    try {
      const res = await fetch('/api/ideas');
      if (!res.ok) throw new Error('Falha');
      setIdeas(await res.json());
    } catch (error) {
      showToast('⚠️ Erro ao carregar as ideias do Notion.');
    } finally {
      setLoading(false);
    }
  }

  async function loadNews() {
    setLoadingNews(true);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Falha');
      setNews(await res.json());
    } catch (error) {
      showToast('⚠️ Erro ao buscar Notícias do RSS.');
    } finally {
      setLoadingNews(false);
    }
  }

  useEffect(() => {
    loadIdeas();
  }, []);

  useEffect(() => {
    if (activeTab === 'noticias' && news.length === 0) {
      loadNews();
    }
  }, [activeTab]);

  async function handleGenerate(pageId: string) {
    setGeneratingId(pageId);
    showToast('⏳ Gerando conteúdo com IA...');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });
      if (!res.ok) throw new Error('Falha');
      await loadIdeas();
      showToast('✨ Conteúdo gerado com sucesso!');
    } catch (error) {
      showToast('❌ Ocorreu um erro ao gerar o texto.');
    } finally {
      setGeneratingId(null);
    }
  }

  async function handleApprove(pageId: string) {
    setApprovingId(pageId);
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });
      if (!res.ok) throw new Error('Falha');
      await loadIdeas();
      showToast('✅ Aprovado! Agora é só publicar no LinkedIn.');
    } catch (error) {
      showToast('❌ Erro ao aprovar conteúdo.');
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(pageId: string) {
    if (!window.confirm('Tem certeza que deseja reprovar e excluir esta ideia?')) return;
    
    setRejectingId(pageId);
    try {
      const res = await fetch('/api/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });
      if (!res.ok) throw new Error('Falha');
      await loadIdeas();
      showToast('🗑️ Ideia reprovida e removida da lista.');
    } catch (error) {
      showToast('❌ Erro ao reprovar conteúdo.');
    } finally {
      setRejectingId(null);
    }
  }

  async function handleSeedAutomated() {
    setSeeding(true);
    showToast('🤖 Robô Seeder trabalhando... (Isso pode demorar um pouco)');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Falha na geração em massa');
      const data = await res.json();
      await loadIdeas();
      showToast(`🎉 Robô finalizou e injetou ${data.count || 2} novas ideias!`);
    } catch (error) {
      showToast('❌ Ocorreu um erro ao acionar o Robô.');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div>
          <span className="eyebrow">Corporate Health Manager</span>
          <h1>Central Preventiva</h1>
          <p className="subtitle">
            Gerencie o calendário da sua Newsletter corporativa com orientações práticas.
          </p>
        </div>
      </section>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <button 
          className={activeTab === 'ideias' ? 'primary' : 'secondary'} 
          onClick={() => setActiveTab('ideias')}
        >
          💡 Painel de Ideias
        </button>
        <button 
          className={activeTab === 'noticias' ? 'primary' : 'secondary'} 
          onClick={() => setActiveTab('noticias')}
        >
          📰 Mural de Notícias (RSS)
        </button>
      </div>

      <div className="board-header">
        <h2>{activeTab === 'ideias' ? 'Ideias de Base (Notion)' : 'Notícias Mais Recentes (RSS)'}</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {activeTab === 'ideias' && !loading && (
            <button className="primary" onClick={handleSeedAutomated} disabled={seeding}>
               {seeding ? <div className="spinner"></div> : '🤖 Autogerar 2 Ideias Inéditas'}
            </button>
          )}
          <button 
            className="secondary" 
            onClick={activeTab === 'ideias' ? loadIdeas : loadNews} 
            disabled={activeTab === 'ideias' ? loading : loadingNews}
          >
            {(activeTab === 'ideias' ? loading : loadingNews) ? <div className="spinner dark"></div> : '🔄 Atualizar'}
          </button>
        </div>
      </div>

      <section className="grid">
        {activeTab === 'ideias' && (
          ideas.length === 0 && !loading && !seeding ? (
            <div className="card empty">Acesse o seu Notion e adicione novas ideias, ou clique no botão do Robô ali em cima para injetar conteúdo.</div>
          ) : (
            ideas.map((idea) => (
              <article key={idea.id} className="card">
                <div className="card-header">
                  <div>
                    <p className="type">{idea.type || 'Pilar Básico'}</p>
                    <h2 style={{fontSize: '1.1rem'}}>{idea.theme}</h2>
                    {idea.subtheme ? <p className="subtheme">{idea.subtheme}</p> : null}
                  </div>
                  <span className={`status ${idea.status.toLowerCase()}`}>{idea.status}</span>
                </div>

                <div className="card-body" style={{overflowY: 'auto', maxHeight: '200px'}}>
                  {idea.text ? <pre>{idea.text}</pre> : <p className="placeholder">Ainda não gerado.</p>}
                </div>

                <div className="card-footer">
                  {idea.status === 'Ideia' && (
                    <button className="primary" onClick={() => handleGenerate(idea.id)} disabled={generatingId === idea.id}>
                      {generatingId === idea.id ? <div className="spinner"></div> : '🤖 Escrever'}
                    </button>
                  )}
                  {idea.status === 'Gerado' && (
                    <button className="primary" onClick={() => handleApprove(idea.id)} disabled={approvingId === idea.id}>
                      {approvingId === idea.id ? <div className="spinner"></div> : '✅ Aprovar'}
                    </button>
                  )}
                  {idea.status === 'Aprovado' && (
                    <button className="secondary" onClick={() => { navigator.clipboard.writeText(idea.text); showToast('📋 Texto copiado!'); }}>
                      📋 Copiar
                    </button>
                  )}
                  
                  {/* Botão de Reprovar que arquiva a página do Notion */}
                  <button 
                    className="secondary" 
                    style={{ marginLeft: 'auto', color: '#c2410c', borderColor: '#ffedd5' }}
                    onClick={() => handleReject(idea.id)} 
                    disabled={rejectingId === idea.id}
                  >
                    {rejectingId === idea.id ? <div className="spinner dark"></div> : '✖️ Reprovar'}
                  </button>
                </div>
              </article>
            ))
          )
        )}

        {activeTab === 'noticias' && (
          news.length === 0 && !loadingNews ? (
            <div className="card empty">Carregando mural de notícias...</div>
          ) : (
            news.map((item) => (
              <article key={item.id} className="card">
                <div className="card-header">
                  <div>
                    <p className="type">{item.source}</p>
                    <h2 style={{fontSize: '1.1rem'}}>{item.title}</h2>
                    <p className="subtheme">{new Date(item.pubDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="card-body">
                  <p className="placeholder" style={{color: '#334155', textAlign: 'left', fontStyle: 'normal'}}>
                    {item.contentSnippet.length > 150 ? item.contentSnippet.substring(0, 150) + '...' : item.contentSnippet}
                  </p>
                </div>

                <div className="card-footer">
                  <a href={item.link} target="_blank" rel="noreferrer" style={{textDecoration: 'none'}}>
                    <button className="secondary">Ler Notícia Oficial</button>
                  </a>
                </div>
              </article>
            ))
          )
        )}
      </section>

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">{toast.message}</div>
        ))}
      </div>
    </main>
  );
}
