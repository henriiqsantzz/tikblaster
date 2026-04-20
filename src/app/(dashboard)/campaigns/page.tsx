'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Select, Button, Toggle, TextArea } from '@/components/ui';
import { Plus, ChevronRight, Upload, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Step = 'campaign' | 'adgroup' | 'creative';

export default function CampaignsPage() {
  const router = useRouter();
  const { activeBC, advertisers } = useAppStore();
  const [loadingAdvs, setLoadingAdvs] = useState(true);
  const [realAdvertisers, setRealAdvertisers] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>('campaign');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [publishing, setPublishing] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    name: '', objective: 'CONVERSIONS', campaignType: 'MANUAL', budgetOptimize: false,
  });
  const [adgroupForm, setAdgroupForm] = useState({
    budget: 100, budgetMode: 'BUDGET_MODE_DAY', bidStrategy: 'BID_TYPE_NO_BID', bidPrice: 0,
    billing: 'OCPM', deliveryPace: 'PACING_MODE_SMOOTH', country: 'BR', gender: 'GENDER_UNLIMITED',
    ageGroups: [] as string[], os: [] as string[],
  });
  const [creativeForm, setCreativeForm] = useState({
    format: 'SINGLE_VIDEO', cta: 'LEARN_MORE', adText: '', landingUrl: '', urlParams: '',
    impressionUrl: '', clickUrl: '',
  });

  useEffect(() => {
    if (!activeBC?.bc_id) { setLoadingAdvs(false); return; }
    setLoadingAdvs(true);
    fetch(`/api/tiktok/advertisers?bc_id=${activeBC.bc_id}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const advs = (Array.isArray(data) ? data : []).map((a: any) => ({
          id: a.advertiser_id,
          name: a.advertiser_name || a.name,
          accountId: a.advertiser_id,
          status: a.status || 'ACTIVE',
          balance: a.balance || 0,
          currency: a.currency || 'BRL',
        }));
        setRealAdvertisers(advs);
      })
      .catch(console.error)
      .finally(() => setLoadingAdvs(false));
  }, [activeBC?.bc_id]);

  const handleNextStep = () => {
    if (selectedAccounts.length === 0) { toast.error('Selecione ao menos uma conta de anunciante'); return; }
    if (currentStep === 'campaign') {
      if (!campaignForm.name.trim()) { toast.error('Nome da campanha é obrigatório'); return; }
      setCurrentStep('adgroup');
    } else if (currentStep === 'adgroup') {
      if (adgroupForm.budget < 20) { toast.error('Orçamento mínimo é R$ 20'); return; }
      setCurrentStep('creative');
    }
  };

  const handlePublish = async () => {
    if (!creativeForm.landingUrl.trim()) { toast.error('URL de destino é obrigatória'); return; }
    if (!creativeForm.adText.trim()) { toast.error('Texto do anúncio é obrigatório'); return; }

    setPublishing(true);
    try {
      const payload = {
        target_accounts: selectedAccounts,
        campaign_config: {
          campaign_name: campaignForm.name,
          objective_type: campaignForm.objective,
          campaign_type: campaignForm.campaignType,
          budget_mode: adgroupForm.budgetMode,
          budget: adgroupForm.budget,
          budget_optimize_on: campaignForm.budgetOptimize,
        },
        adgroup_config: {
          name: `${campaignForm.name} - Conjunto`,
          budget: adgroupForm.budget,
          budget_mode: adgroupForm.budgetMode,
          bid_type: adgroupForm.bidStrategy,
          bid_price: adgroupForm.bidPrice,
          billing_event: adgroupForm.billing,
          pacing: adgroupForm.deliveryPace,
          optimization_goal: campaignForm.objective === 'CONVERSIONS' ? 'CONVERT' : campaignForm.objective === 'TRAFFIC' ? 'CLICK' : 'REACH',
          schedule_type: 'SCHEDULE_FROM_NOW',
          targeting: {
            location_ids: [adgroupForm.country],
            gender: adgroupForm.gender,
            age_groups: adgroupForm.ageGroups.length > 0 ? adgroupForm.ageGroups.map(a => `AGE_${a.replace('-', '_').replace('+', '_ABOVE')}`) : undefined,
            operating_systems: adgroupForm.os.length > 0 ? adgroupForm.os.map(o => o.toUpperCase()) : undefined,
          },
        },
        creative_config: {
          format: creativeForm.format,
          call_to_action: creativeForm.cta,
          ad_text: creativeForm.adText,
          landing_page_url: creativeForm.landingUrl,
          url_params: creativeForm.urlParams || undefined,
          impression_tracking_url: creativeForm.impressionUrl || undefined,
          click_tracking_url: creativeForm.clickUrl || undefined,
        },
      };

      const res = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao criar campanhas');
      }

      const result = await res.json();
      toast.success(`Lote criado! Job ID: ${result.job_id}. ${result.total_campaigns} campanhas em processamento.`);
      router.push('/history');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao publicar campanhas');
    } finally {
      setPublishing(false);
    }
  };

  if (!activeBC) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Campanhas</h1>
          <p className="text-gray-500 mt-1">Criador em lote de campanhas TikTok</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16 px-6">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Conta TikTok não conectada</h2>
          <p className="text-gray-500 mb-6">Conecte sua conta para criar campanhas em lote.</p>
          <Link href="/settings">
            <button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-lg shadow-pink-500/20">
              Ir para Configurações
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Campanhas</h1>
        <p className="text-gray-500 mt-1">Criador em lote de campanhas TikTok - BC: {activeBC.name || activeBC.bc_id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Tree */}
        <div className="lg:col-span-1">
          <Card title="Estrutura" className="sticky top-20">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><Plus size={16} /> Campanha</p>
                <div className="pl-4">
                  <div className="px-3 py-2 rounded bg-gray-50 text-xs text-gray-600 border border-gray-100">
                    {campaignForm.name || 'Nova Campanha'}
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><ChevronRight size={16} /> Conjunto</p>
                <div className="pl-4">
                  <div className="px-3 py-2 rounded bg-gray-50 text-xs text-gray-600 border border-gray-100">Conjunto 1</div>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><ChevronRight size={16} /> Criativo</p>
                <div className="pl-4">
                  <div className="px-3 py-2 rounded bg-gray-50 text-xs text-gray-600 border border-gray-100">Criativo 1</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold', currentStep === 'campaign' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400')}>1</div>
              <span className="text-sm text-gray-600">Campanha</span>
            </div>
            <div className="h-1 flex-1 mx-4 bg-gray-100 rounded">
              <div className="h-full bg-pink-500 rounded transition-all" style={{ width: currentStep === 'campaign' ? '0%' : currentStep === 'adgroup' ? '50%' : '100%' }} />
            </div>
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold', currentStep === 'adgroup' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400')}>2</div>
            <span className="text-sm text-gray-600">Conjuntos</span>
            <div className="h-1 flex-1 mx-4 bg-gray-100 rounded">
              <div className="h-full bg-pink-500 rounded transition-all" style={{ width: currentStep === 'creative' ? '100%' : '0%' }} />
            </div>
            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center font-bold', currentStep === 'creative' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400')}>3</div>
            <span className="text-sm text-gray-600">Criativos</span>
          </div>

          {/* Campaign Step */}
          {currentStep === 'campaign' && (
            <div className="space-y-6">
              <Card title="Selecionar Contas de Anunciantes">
                {loadingAdvs ? (
                  <div className="py-8 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" size={24} />Carregando anunciantes...</div>
                ) : realAdvertisers.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <p>Nenhum anunciante encontrado neste BC.</p>
                    <p className="text-sm mt-2">Sincronize os anunciantes na página de Business Centers.</p>
                  </div>
                ) : (
                  <Table
                    columns={[
                      { key: 'name' as const, header: 'Nome da Conta' },
                      { key: 'accountId' as const, header: 'ID da Conta' },
                      { key: 'status' as const, header: 'Status', render: (value: string) => (
                        <span className={cn('font-medium', value === 'ACTIVE' ? 'text-green-600' : 'text-red-500')}>{value === 'ACTIVE' ? 'Ativa' : value}</span>
                      )},
                      { key: 'balance' as const, header: 'Saldo', render: (value: number, row: any) => (
                        <span className="text-gray-600">{row.currency} {parseFloat(value as any || 0).toFixed(2)}</span>
                      )},
                    ]}
                    data={realAdvertisers}
                    selectable
                    onSelectionChange={(selected) => setSelectedAccounts(selected.map(id => id.toString()))}
                    rowIdKey="id"
                  />
                )}
              </Card>
              <Card title="Configurar Campanha">
                <div className="space-y-4">
                  <Input label="Nome da Campanha" value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })} placeholder="Ex: Campanha Verão 2024" required />
                  <Select label="Objetivo da Campanha" options={[
                    { value: 'CONVERSIONS', label: 'Conversões Web' },
                    { value: 'TRAFFIC', label: 'Tráfego' },
                    { value: 'REACH', label: 'Alcance' },
                    { value: 'VIDEO_VIEWS', label: 'Visualizações de Vídeo' },
                    { value: 'LEAD_GENERATION', label: 'Geração de Leads' },
                  ]} value={campaignForm.objective} onChange={(e) => setCampaignForm({ ...campaignForm, objective: e.target.value })} required />
                  <Select label="Tipo de Campanha" options={[
                    { value: 'MANUAL', label: 'Manual' },
                    { value: 'SMART_PLUS', label: 'Smart+' },
                  ]} value={campaignForm.campaignType} onChange={(e) => setCampaignForm({ ...campaignForm, campaignType: e.target.value })} />
                  <Toggle label="Otimizar Orçamento" description="Deixar o TikTok otimizar o orçamento automaticamente" checked={campaignForm.budgetOptimize} onChange={(e) => setCampaignForm({ ...campaignForm, budgetOptimize: e.target.checked })} />
                </div>
              </Card>
              <div className="flex justify-end">
                <Button onClick={handleNextStep} size="lg" disabled={selectedAccounts.length === 0}>PRÓXIMO: CONJUNTOS</Button>
              </div>
            </div>
          )}

          {/* AdGroup Step */}
          {currentStep === 'adgroup' && (
            <div className="space-y-6">
              <Card title="Configurar Conjunto de Anúncios">
                <div className="space-y-4">
                  <Input label="Orçamento Diário (R$)" type="number" min="20" value={adgroupForm.budget} onChange={(e) => setAdgroupForm({ ...adgroupForm, budget: parseFloat(e.target.value) })} required />
                  <Select label="Estratégia de Oferta" options={[
                    { value: 'BID_TYPE_NO_BID', label: 'Custo Mais Baixo' },
                    { value: 'BID_TYPE_CUSTOM', label: 'Bid Cap' },
                  ]} value={adgroupForm.bidStrategy} onChange={(e) => setAdgroupForm({ ...adgroupForm, bidStrategy: e.target.value })} />
                  {adgroupForm.bidStrategy !== 'BID_TYPE_NO_BID' && (
                    <Input label="Valor da Oferta (R$)" type="number" min="0" step="0.01" value={adgroupForm.bidPrice} onChange={(e) => setAdgroupForm({ ...adgroupForm, bidPrice: parseFloat(e.target.value) })} />
                  )}
                  <Select label="Evento de Faturamento" options={[
                    { value: 'OCPM', label: 'oCPM' }, { value: 'CPM', label: 'CPM' }, { value: 'CPC', label: 'CPC' },
                  ]} value={adgroupForm.billing} onChange={(e) => setAdgroupForm({ ...adgroupForm, billing: e.target.value })} />
                  <Select label="Ritmo de Entrega" options={[
                    { value: 'PACING_MODE_SMOOTH', label: 'Padrão' }, { value: 'PACING_MODE_FAST', label: 'Acelerado' },
                  ]} value={adgroupForm.deliveryPace} onChange={(e) => setAdgroupForm({ ...adgroupForm, deliveryPace: e.target.value })} />
                </div>
              </Card>
              <Card title="Direcionamento">
                <div className="space-y-4">
                  <Select label="País" options={[{ value: 'BR', label: 'Brasil' }, { value: 'US', label: 'Estados Unidos' }]} value={adgroupForm.country} onChange={(e) => setAdgroupForm({ ...adgroupForm, country: e.target.value })} />
                  <Select label="Gênero" options={[
                    { value: 'GENDER_UNLIMITED', label: 'Todos' }, { value: 'GENDER_MALE', label: 'Homem' }, { value: 'GENDER_FEMALE', label: 'Mulher' },
                  ]} value={adgroupForm.gender} onChange={(e) => setAdgroupForm({ ...adgroupForm, gender: e.target.value })} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Faixa Etária</label>
                    <div className="space-y-2">
                      {['13-17', '18-24', '25-34', '35-44', '45-54', '55+'].map(age => (
                        <label key={age} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={adgroupForm.ageGroups.includes(age)} onChange={(e) => setAdgroupForm({ ...adgroupForm, ageGroups: e.target.checked ? [...adgroupForm.ageGroups, age] : adgroupForm.ageGroups.filter(a => a !== age) })} className="w-4 h-4 rounded border border-gray-300 bg-white cursor-pointer accent-pink-500" />
                          <span className="text-sm text-gray-600">{age} anos</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sistema Operacional</label>
                    <div className="space-y-2">
                      {['iOS', 'Android'].map(os => (
                        <label key={os} className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={adgroupForm.os.includes(os)} onChange={(e) => setAdgroupForm({ ...adgroupForm, os: e.target.checked ? [...adgroupForm.os, os] : adgroupForm.os.filter(o => o !== os) })} className="w-4 h-4 rounded border border-gray-300 bg-white cursor-pointer accent-pink-500" />
                          <span className="text-sm text-gray-600">{os}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
              <div className="flex justify-between">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep('campaign')}>VOLTAR</Button>
                <Button onClick={handleNextStep} size="lg">PRÓXIMO: CRIATIVOS</Button>
              </div>
            </div>
          )}

          {/* Creative Step */}
          {currentStep === 'creative' && (
            <div className="space-y-6">
              <Card title="Configurar Criativo">
                <div className="space-y-4">
                  <Select label="Formato" options={[
                    { value: 'SINGLE_VIDEO', label: 'Vídeo' }, { value: 'SINGLE_IMAGE', label: 'Imagem' },
                  ]} value={creativeForm.format} onChange={(e) => setCreativeForm({ ...creativeForm, format: e.target.value })} />
                  <Select label="Call-to-Action" options={[
                    { value: 'LEARN_MORE', label: 'Saiba Mais' }, { value: 'SHOP_NOW', label: 'Compre Agora' },
                    { value: 'DOWNLOAD', label: 'Baixar' }, { value: 'SIGN_UP', label: 'Cadastre-se' },
                    { value: 'CONTACT_US', label: 'Entre em Contato' },
                  ]} value={creativeForm.cta} onChange={(e) => setCreativeForm({ ...creativeForm, cta: e.target.value })} />
                  <TextArea label="Texto do Anúncio" value={creativeForm.adText} onChange={(e) => setCreativeForm({ ...creativeForm, adText: e.target.value })} placeholder="Escreva o texto que será exibido no anúncio..." rows={3} />
                  <Input label="URL de Destino" type="url" value={creativeForm.landingUrl} onChange={(e) => setCreativeForm({ ...creativeForm, landingUrl: e.target.value })} placeholder="https://seu-site.com" required />
                  <Input label="Parâmetros de URL" value={creativeForm.urlParams} onChange={(e) => setCreativeForm({ ...creativeForm, urlParams: e.target.value })} placeholder="utm_source=tiktok&utm_medium=cpc" />
                </div>
              </Card>
              <Card title="Arquivo Criativo">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">
                    Para o criativo (vídeo/imagem), faça o upload diretamente na plataforma TikTok Ads Manager e use o video_id ou image_id gerado.
                  </p>
                  <p className="text-xs text-gray-500">
                    O ShadowAds irá criar a campanha, conjunto e anúncio com as configurações acima. O criativo será vinculado automaticamente ao anúncio.
                  </p>
                </div>
              </Card>
              <Card title="URLs de Rastreamento">
                <div className="space-y-4">
                  <Input label="URL de Impressão" type="url" value={creativeForm.impressionUrl} onChange={(e) => setCreativeForm({ ...creativeForm, impressionUrl: e.target.value })} placeholder="https://seu-tracker.com/impression" />
                  <Input label="URL de Clique" type="url" value={creativeForm.clickUrl} onChange={(e) => setCreativeForm({ ...creativeForm, clickUrl: e.target.value })} placeholder="https://seu-tracker.com/click" />
                </div>
              </Card>
              <div className="flex justify-between">
                <Button variant="secondary" size="lg" onClick={() => setCurrentStep('adgroup')}>VOLTAR</Button>
                <Button onClick={handlePublish} size="lg" loading={publishing} disabled={publishing}>
                  {publishing ? 'PUBLICANDO...' : `PUBLICAR EM ${selectedAccounts.length} CONTA(S)`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 sticky bottom-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-500">Contas Selecionadas</p>
              <p className="text-lg font-bold text-pink-600">{selectedAccounts.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Campanhas a Criar</p>
              <p className="text-lg font-bold text-gray-800">{selectedAccounts.length}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <AlertCircle size={16} />
            Cada conta receberá 1 campanha + 1 conjunto + 1 anúncio
          </div>
        </div>
      </div>
    </div>
  );
}
