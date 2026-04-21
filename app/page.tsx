'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  StatusBadge,
  TextArea,
  Hero,
  Tabs,
  EmptyState,
  ToastContainer,
} from './components';

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

type Toast = {
  id: number;
  message: string;
  type?: 'default' | 'success' | 'error' | 'warning';
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'ideias' | 'noticias' | 'minha-ideia'>('ideias');

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);

  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Estados para a aba "Minha Ideia"
  const [inputIdea, setInputIdea] = useState('');
  const [transformingIdea, setTransformingIdea] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{ theme: string; text: string } | null>(null);
  const [addingPost, setAddingPost] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(message: string, type: 'default' | 'success' | 'error' | 'warning' = 'default') {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  async function loadIdeas() {
    setLoading(true);
    try {
      const res = await fetch('/api/ideas');
      if (!res.ok) throw new Error('Falha');
      setIdeas(await res.json());
    } catch (error) {
      showToast('⚠️ Erro ao carregar as ideias do Notion.', 'error');
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
      showToast('⚠️ Erro ao buscar Notícias do RSS.', 'error');
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
    showToast('✨ Gerando conteúdo com IA...');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });
      if (!res.ok) throw new Error('Falha');
      await loadIdeas();
      showToast('🎉 Conteúdo gerado com sucesso!', 'success');
    } catch (error) {
      showToast('❌ Ocorreu um erro ao gerar o texto.', 'error');
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
      showToast('✅ Aprovado! Agora é só publicar no LinkedIn.', 'success');
    } catch (error) {
      showToast('❌ Erro ao aprovar conteúdo.', 'error');
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
      showToast('🗑️ Ideia reprovida e removida da lista.', 'success');
    } catch (error) {
      showToast('❌ Erro ao reprovar conteúdo.', 'error');
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
      showToast(`🎉 Robô finalizou e injetou ${data.count || 2} novas ideias!`, 'success');
    } catch (error) {
      showToast('❌ Ocorreu um erro ao acionar o Robô.', 'error');
    } finally {
      setSeeding(false);
    }
  }

  async function handleTransformIdea() {
    if (!inputIdea.trim()) {
      showToast('⚠️ Digite sua ideia antes de transformar.', 'warning');
      return;
    }

    setTransformingIdea(true);
    showToast('✨ Transformando sua ideia em um post...');
    try {
      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputIdea }),
      });

      if (!res.ok) throw new Error('Falha ao transformar');
      const data = await res.json();
      setGeneratedPost(data);
      showToast('✅ Post gerado! Você pode aprová-lo ou cancelar.', 'success');
    } catch (error) {
      showToast('❌ Erro ao transformar sua ideia.', 'error');
    } finally {
      setTransformingIdea(false);
    }
  }

  async function handleAddPost() {
    if (!generatedPost) return;

    setAddingPost(true);
    showToast('💾 Adicionando o post à base...');
    try {
      const res = await fetch('/api/ideas/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedPost),
      });

      if (!res.ok) throw new Error('Falha ao adicionar');
      await loadIdeas();
      setGeneratedPost(null);
      setInputIdea('');
      showToast('🎉 Post adicionado com sucesso à sua base!', 'success');
    } catch (error) {
      showToast('❌ Erro ao adicionar o post.', 'error');
    } finally {
      setAddingPost(false);
    }
  }

  const tabs = [
    { id: 'ideias', label: '💡 Painel de Ideias', icon: '💡' },
    { id: 'noticias', label: '📰 Notícias (RSS)', icon: '📰' },
    { id: 'minha-ideia', label: '✏️ Minha Ideia', icon: '✏️' },
  ];

  return (
    <main className="page-bg">
      <div className="page-content">
        {/* Hero Section */}
        <Hero
          eyebrow="🎨 Central de Saúde Preventiva"
          title="Seu Assistente de Conteúdo para LinkedIn"
          subtitle="Crie, aprove e publique conteúdos sobre saúde preventiva com a ajuda de IA. Organizado, simples e profissional."
        />

        {/* Navigation Tabs */}
        <div className="mb-8">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId as 'ideias' | 'noticias' | 'minha-ideia')}
          />
        </div>

        {/* Section Header */}
        <div className="section-header mb-8">
          <div>
            <h2>
              {activeTab === 'ideias'
                ? '💡 Suas Ideias (Notion)'
                : activeTab === 'noticias'
                ? '📰 Notícias Recentes (RSS)'
                : '✏️ Transforme Sua Ideia'}
            </h2>
            <p className="text-secondary-small">
              {activeTab === 'ideias'
                ? 'Gerencie seus conteúdos em cada etapa da criação'
                : activeTab === 'noticias'
                ? 'Inspire-se com as últimas notícias de saúde'
                : 'Transforme seu pensamento em um post profissional'}
            </p>
          </div>

          <div className="flex-row-reverse" style={{ display: 'flex', gap: '0.75rem' }}>
            {activeTab === 'ideias' && !loading && (
              <Button
                variant="ai"
                onClick={handleSeedAutomated}
                isLoading={seeding}
              >
                🚀 Gerar 2 Ideias Inéditas
              </Button>
            )}
            {(activeTab === 'ideias' || activeTab === 'noticias') && (
              <Button
                variant="secondary"
                onClick={activeTab === 'ideias' ? loadIdeas : loadNews}
                isLoading={activeTab === 'ideias' ? loading : loadingNews}
              >
                🔄 Atualizar
              </Button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <section className="grid-auto">
          {/* Minha Ideia Tab */}
          {activeTab === 'minha-ideia' && (
            <>
              {!generatedPost ? (
                <Card className="md:col-span-full">
                  <CardBody className="space-y-6">
                    <div>
                      <label>
                        📝 Qual é sua ideia de post?
                      </label>
                      <TextArea
                        id="idea-input"
                        placeholder="Ex: Fadiga visual ao trabalhar no computador o dia todo. Ou: A importância de fazer pausas durante o expediente."
                        value={inputIdea}
                        onChange={(e) => setInputIdea(e.target.value)}
                        charLimit={500}
                        disabled={transformingIdea}
                      />
                    </div>

                    <Button
                      variant="ai"
                      onClick={handleTransformIdea}
                      isLoading={transformingIdea}
                      disabled={!inputIdea.trim()}
                    >
                      ✨ Transformar em Post
                    </Button>
                  </CardBody>
                </Card>
              ) : (
                <Card className="md:col-span-full">
                  <CardHeader>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>📋 Seu Post Gerado</h3>
                      <p className="text-secondary-small">Tema: {generatedPost.theme}</p>
                    </div>
                  </CardHeader>

                  <CardBody>
                    <div className="code-preview-bg">
                      <pre className="code-text">
                        {generatedPost.text}
                      </pre>
                    </div>
                  </CardBody>

                  <CardFooter className="flex-row-reverse gap-3">
                    <Button
                      variant="primary"
                      onClick={handleAddPost}
                      isLoading={addingPost}
                    >
                      ✅ Adicionar à Base
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPost.text);
                        showToast('📋 Post copiado!', 'success');
                      }}
                    >
                      📋 Copiar
                    </Button>
                    <Button
                      variant="tertiary"
                      onClick={() => {
                        setGeneratedPost(null);
                        setInputIdea('');
                      }}
                      disabled={addingPost}
                    >
                      ✖️ Cancelar
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </>
          )}

          {/* Ideas Tab */}
          {activeTab === 'ideias' &&
            (ideas.length === 0 && !loading && !seeding ? (
              <EmptyState
                icon="💭"
                title="Nenhuma ideia ainda"
                message="Acesse seu Notion e adicione novas ideias, ou clique no botão de IA para gerar automaticamente."
              />
            ) : (
              ideas.map((idea) => (
                <Card key={idea.id}>
                  <CardHeader>
                    <div className="flex-1">
                      <Badge variant="rose" className="mb-2">
                        {idea.type || 'Pilar'}
                      </Badge>
                      <h3 style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{idea.theme}</h3>
                      {idea.subtheme && <p className="text-secondary-small">{idea.subtheme}</p>}
                    </div>
                    <StatusBadge status={idea.status} />
                  </CardHeader>

                  <CardBody className="code-content-box">
                    {idea.text ? (
                      <pre className="code-text">
                        {idea.text}
                      </pre>
                    ) : (
                      <p className="text-center-muted-italic">Conteúdo ainda não gerado...</p>
                    )}
                  </CardBody>

                  <CardFooter className="gap-2">
                    {idea.status === 'Ideia' && (
                      <Button
                        variant="ai"
                        size="sm"
                        onClick={() => handleGenerate(idea.id)}
                        isLoading={generatingId === idea.id}
                      >
                        🤖 Gerar
                      </Button>
                    )}
                    {idea.status === 'Gerado' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(idea.id)}
                        isLoading={approvingId === idea.id}
                      >
                        ✅ Aprovar
                      </Button>
                    )}
                    {idea.status === 'Aprovado' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(idea.text);
                          showToast('📋 Texto copiado!', 'success');
                        }}
                      >
                        📋 Copiar
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReject(idea.id)}
                      isLoading={rejectingId === idea.id}
                      className="ml-auto btn-icon-rose"
                    >
                      🗑️ Reprovar
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ))}

          {/* News Tab */}
          {activeTab === 'noticias' &&
            (news.length === 0 && !loadingNews ? (
              <EmptyState
                icon="📰"
                title="Carregando notícias..."
                message="As últimas notícias sobre saúde preventiva aparecerão aqui."
              />
            ) : (
              news.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex-1">
                      <Badge variant="rose" className="mb-2">
                        {item.source}
                      </Badge>
                      <h3 style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.title}</h3>
                      <p className="text-xs-secondary">
                        {new Date(item.pubDate).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </CardHeader>

                  <CardBody className="line-clamp-text">
                    {item.contentSnippet}
                  </CardBody>

                  <CardFooter>
                    <a href={item.link} target="_blank" rel="noreferrer" className="flex-1" style={{ flex: 1 }}>
                      <Button variant="secondary" size="sm" className="w-full">
                        📖 Ler Notícia
                      </Button>
                    </a>
                  </CardFooter>
                </Card>
              ))
            ))}
        </section>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
