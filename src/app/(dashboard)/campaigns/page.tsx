'use client';

import React, { useState } from 'react';
import { Card, Table, Input, Select, Button, Toggle, TextArea } from '@/components/ui';
import {
  Plus,
  ChevronRight,
  Upload,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// Mock advertiser data
const mockAdvertisers = [
  {
    id: '1',
    name: 'Conta Premium 01',
    accountId: 'ACC-001',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Conta Premium 02',
    accountId: 'ACC-002',
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'Conta Standard 01',
    accountId: 'ACC-003',
    status: 'ACTIVE',
  },
];

type Step = 'campaign' | 'adgroup' | 'creative';

export default function CampaignsPage() {
  const [currentStep, setCurrentStep] = useState<Step>('campaign');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Campaign Level Form
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    objective: 'CONVERSIONS',
    campaignType: 'MANUAL',
    budgetOptimize: false,
  });

  // AdGroup Level Form
  const [adgroupForm, setAdgroupForm] = useState({
    budget: 100,
    budgetMode: 'BUDGET_MODE_DAY',
    bidStrategy: 'BID_TYPE_NO_BID',
    bidPrice: 0,
    billing: 'OCPM',
    deliveryPace: 'PACING_MODE_SMOOTH',
    country: 'BR',
    languages: [],
    gender: 'GENDER_UNLIMITED',
    ageGroups: [] as string[],
    os: [] as string[],
  });

  // Creative Level Form
  const [creativeForm, setCreativeForm] = useState({
    format: 'SINGLE_VIDEO',
    cta: 'LEARN_MORE',
    adText: '',
    landingUrl: '',
    urlParams: '',
    impressionUrl: '',
    clickUrl: '',
  });

  const [campaignTree, setCampaignTree] = useState({
    campaigns: ['Nova Campanha'],
    adgroups: ['Conjunto 1'],
    creatives: ['Criativo 1'],
  });

  const handleSelectAccount = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSelectAllAccounts = () => {
    if (selectedAccounts.length === mockAdvertisers.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(mockAdvertisers.map((a) => a.id));
    }
  };

  const handleNextStep = () => {
    if (selectedAccounts.length === 0) {
      toast.error('Selecione ao menos uma conta de anunciante');
      return;
    }

    if (currentStep === 'campaign') {
      if (!campaignForm.name.trim()) {
        toast.error('Nome da campanha é obrigatório');
        return;
      }
      setCurrentStep('adgroup');
    } else if (currentStep === 'adgroup') {
      if (adgroupForm.budget < 20) {
        toast.error('Orçamento mínimo é R$ 20');
        return;
      }
      setCurrentStep('creative');
    }
  };

  const handlePublish = async () => {
    if (!creativeForm.landingUrl.trim()) {
      toast.error('URL de destino é obrigatória');
      return;
    }

    try {
      toast.loading('Publicando campanhas...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.dismiss();
      toast.success(`${selectedAccounts.length} campanha(s) publicada(s) com sucesso!`);

      // Reset form
      setCurrentStep('campaign');
      setSelectedAccounts([]);
      setCampaignForm({ name: '', objective: 'CONVERSIONS', campaignType: 'MANUAL', budgetOptimize: false });
      setAdgroupForm({
        budget: 100,
        budgetMode: 'BUDGET_MODE_DAY',
        bidStrategy: 'BID_TYPE_NO_BID',
        bidPrice: 0,
        billing: 'OCPM',
        deliveryPace: 'PACING_MODE_SMOOTH',
        country: 'BR',
        languages: [],
        gender: 'GENDER_UNLIMITED',
        ageGroups: [],
        os: [],
      });
      setCreativeForm({
        format: 'SINGLE_VIDEO',
        cta: 'LEARN_MORE',
        adText: '',
        landingUrl: '',
        urlParams: '',
        impressionUrl: '',
        clickUrl: '',
      });
    } catch (error) {
      toast.error('Erro ao publicar campanhas');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Campanhas</h1>
        <p className="text-gray-400 mt-1">Criador em lote de campanhas TikTok</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Tree Navigation */}
        <div className="lg:col-span-1">
          <Card title="Estrutura" className="sticky top-20">
            <div className="space-y-3 text-sm">
              {/* Campaign Level */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-200 flex items-center gap-2">
                    <Plus size={16} /> Nova Campanha
                  </p>
                </div>
                <div className="space-y-1 pl-4">
                  {campaignTree.campaigns.map((campaign, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded transition-all text-xs',
                        'hover:bg-dark-200',
                        'text-gray-300'
                      )}
                    >
                      📋 {campaign}
                    </button>
                  ))}
                </div>
              </div>

              {/* AdGroup Level */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-200 flex items-center gap-2">
                    <ChevronRight size={16} /> Conjuntos
                  </p>
                  <button className="hover:bg-dark-200 p-1 rounded">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-1 pl-4">
                  {campaignTree.adgroups.map((adgroup, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded transition-all text-xs',
                        'hover:bg-dark-200',
                        'text-gray-300'
                      )}
                    >
                      📊 {adgroup}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creative Level */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-200 flex items-center gap-2">
                    <ChevronRight size={16} /> Criativos
                  </p>
                  <button className="hover:bg-dark-200 p-1 rounded">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-1 pl-4">
                  {campaignTree.creatives.map((creative, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded transition-all text-xs',
                        'hover:bg-dark-200',
                        'text-gray-300'
                      )}
                    >
                      🎨 {creative}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Content - Steps */}
        <div className="lg:col-span-3 space-y-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                  currentStep === 'campaign'
                    ? 'bg-brand-500 text-dark-500'
                    : 'bg-dark-300 text-gray-300'
                )}
              >
                1
              </div>
              <span className="text-sm text-gray-300">Campanha</span>
            </div>

            <div className="h-1 flex-1 mx-4 bg-dark-300 rounded">
              <div
                className="h-full bg-brand-500 rounded transition-all"
                style={{
                  width: currentStep === 'campaign' ? '0%' : currentStep === 'adgroup' ? '50%' : '100%',
                }}
              />
            </div>

            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                currentStep === 'adgroup'
                  ? 'bg-brand-500 text-dark-500'
                  : currentStep === 'campaign'
                  ? 'bg-dark-400 text-gray-400'
                  : 'bg-dark-300 text-gray-300'
              )}
            >
              2
            </div>
            <span className="text-sm text-gray-300">Conjuntos</span>

            <div className="h-1 flex-1 mx-4 bg-dark-300 rounded">
              <div
                className="h-full bg-brand-500 rounded transition-all"
                style={{
                  width: currentStep === 'creative' ? '100%' : '0%',
                }}
              />
            </div>

            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                currentStep === 'creative'
                  ? 'bg-brand-500 text-dark-500'
                  : 'bg-dark-400 text-gray-400'
              )}
            >
              3
            </div>
            <span className="text-sm text-gray-300">Criativos</span>
          </div>

          {/* Campaign Step */}
          {currentStep === 'campaign' && (
            <div className="space-y-6">
              <Card title="Selecionar Contas de Anunciantes">
                <Table
                  columns={[
                    {
                      key: 'name' as const,
                      header: 'Nome da Conta',
                    },
                    {
                      key: 'accountId' as const,
                      header: 'ID da Conta',
                    },
                    {
                      key: 'status' as const,
                      header: 'Status',
                      render: (value: string) => (
                        <span className="text-green-400 font-medium">
                          {value === 'ACTIVE' ? 'Ativa' : value}
                        </span>
                      ),
                    },
                  ]}
                  data={mockAdvertisers}
                  selectable
                  onSelectionChange={(selected) =>
                    setSelectedAccounts(
                      selected.map((id) => id.toString())
                    )
                  }
                  rowIdKey="id"
                />
              </Card>

              <Card title="Configurar Campanha">
                <div className="space-y-4">
                  <Input
                    label="Nome da Campanha"
                    value={campaignForm.name}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Ex: Campanha Verão 2024"
                    required
                  />

                  <Select
                    label="Objetivo da Campanha"
                    options={[
                      { value: 'CONVERSIONS', label: 'Conversões Web' },
                      { value: 'TRAFFIC', label: 'Tráfego' },
                      { value: 'REACH', label: 'Alcance' },
                      { value: 'VIDEO_VIEWS', label: 'Visualizações de Vídeo' },
                      { value: 'LEAD_GENERATION', label: 'Geração de Leads' },
                    ]}
                    value={campaignForm.objective}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        objective: e.target.value,
                      })
                    }
                    required
                  />

                  <Select
                    label="Tipo de Campanha"
                    options={[
                      { value: 'MANUAL', label: 'Manual' },
                      { value: 'SMART_PLUS', label: 'Smart+' },
                    ]}
                    value={campaignForm.campaignType}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        campaignType: e.target.value,
                      })
                    }
                  />

                  <Toggle
                    label="Otimizar Orçamento"
                    description="Deixar o TikTok otimizar o orçamento automaticamente"
                    checked={campaignForm.budgetOptimize}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        budgetOptimize: e.target.checked,
                      })
                    }
                  />
                </div>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={handleNextStep}
                  size="lg"
                  disabled={selectedAccounts.length === 0}
                >
                  PRÓXIMO: CONJUNTOS
                </Button>
              </div>
            </div>
          )}

          {/* AdGroup Step */}
          {currentStep === 'adgroup' && (
            <div className="space-y-6">
              <Card title="Configurar Conjunto de Anúncios">
                <div className="space-y-4">
                  <Input
                    label="Orçamento Diário (R$)"
                    type="number"
                    min="20"
                    value={adgroupForm.budget}
                    onChange={(e) =>
                      setAdgroupForm({
                        ...adgroupForm,
                        budget: parseFloat(e.target.value),
                      })
                    }
                    required
                  />

                  <Select
                    label="Estratégia de Oferta"
                    options={[
                      { value: 'BID_TYPE_NO_BID', label: 'Custo Mais Baixo' },
                      { value: 'BID_TYPE_CUSTOM', label: 'Bid Cap' },
                      { value: 'COST_CAP', label: 'Cost Cap' },
                    ]}
                    value={adgroupForm.bidStrategy}
                    onChange={(e) =>
                      setAdgroupForm({
                        ...adgroupForm,
                        bidStrategy: e.target.value,
                      })
                    }
                  />

                  {adgroupForm.bidStrategy !== 'BID_TYPE_NO_BID' && (
                    <Input
                      label="Valor da Oferta (R$)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={adgroupForm.bidPrice}
                      onChange={(e) =>
                        setAdgroupForm({
                          ...adgroupForm,
                          bidPrice: parseFloat(e.target.value),
                        })
                      }
                    />
                  )}

                  <Select
                    label="Evento de Faturamento"
                    options={[
                      { value: 'OCPM', label: 'oCPM' },
                      { value: 'CPM', label: 'CPM' },
                      { value: 'CPC', label: 'CPC' },
                    ]}
                    value={adgroupForm.billing}
                    onChange={(e) =>
                      setAdgroupForm({
                        ...adgroupForm,
                        billing: e.target.value,
                      })
                    }
                  />

                  <Select
                    label="Ritmo de Entrega"
                    options={[
                      {
                        value: 'PACING_MODE_SMOOTH',
                        label: 'Padrão',
                      },
                      {
                        value: 'PACING_MODE_FAST',
                        label: 'Acelerado',
                      },
                    ]}
                    value={adgroupForm.deliveryPace}
                    onChange={(e) =>
                      setAdgroupForm({
                        ...adgroupForm,
                        deliveryPace: e.target.value,
                      })
                    }
                  />
                </div>
              </Card>

              <Card title="Direcionamento">
                <div className="space-y-4">
                  <Select
                    label="País"
                    options={[
                      { value: 'BR', label: 'Brasil' },
                      { value: 'US', label: 'Estados Unidos' },
                    ]}
                    value={adgroupForm.country}
                    onChange={(e) =>
                      setAdgroupForm({
                        ...adgroupForm,
                        country: e.target.value,
                      })
                    }
                  />

                  <Select
                    label="Gênero"
                    options={[
                      { value: 'GENDER_UNLIMITED', label: 'Todos' },
                      { value: 'GENDER_MALE', label: 'Homem' },
                      { value: 'GENDER_FEMALE', label: 'Mulher' },
                    ]}
                    value={adgroupForm.gender}
                    onChange={(e) =>
                      setAdgroupForm({
                        ...adgroupForm,
                        gender: e.target.value,
                      })
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Faixa Etária
                    </label>
                    <div className="space-y-2">
                      {['13-17', '18-24', '25-34', '35-44', '45-54', '55+'].map((age) => (
                        <label
                          key={age}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={adgroupForm.ageGroups.includes(age)}
                            onChange={(e) =>
                              setAdgroupForm({
                                ...adgroupForm,
                                ageGroups: e.target.checked
                                  ? [...adgroupForm.ageGroups, age]
                                  : adgroupForm.ageGroups.filter((a) => a !== age),
                              })
                            }
                            className="w-4 h-4 rounded border border-dark-100 bg-dark-300 cursor-pointer accent-brand-500"
                          />
                          <span className="text-sm text-gray-300">{age} anos</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Sistema Operacional
                    </label>
                    <div className="space-y-2">
                      {['iOS', 'Android'].map((os) => (
                        <label
                          key={os}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={adgroupForm.os.includes(os)}
                            onChange={(e) =>
                              setAdgroupForm({
                                ...adgroupForm,
                                os: e.target.checked
                                  ? [...adgroupForm.os, os]
                                  : adgroupForm.os.filter((o) => o !== os),
                              })
                            }
                            className="w-4 h-4 rounded border border-dark-100 bg-dark-300 cursor-pointer accent-brand-500"
                          />
                          <span className="text-sm text-gray-300">{os}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setCurrentStep('campaign')}
                >
                  VOLTAR
                </Button>
                <Button
                  onClick={handleNextStep}
                  size="lg"
                >
                  PRÓXIMO: CRIATIVOS
                </Button>
              </div>
            </div>
          )}

          {/* Creative Step */}
          {currentStep === 'creative' && (
            <div className="space-y-6">
              <Card title="Configurar Criativo">
                <div className="space-y-4">
                  <Select
                    label="Formato"
                    options={[
                      { value: 'SINGLE_VIDEO', label: 'Vídeo' },
                      { value: 'SINGLE_IMAGE', label: 'Imagem' },
                      { value: 'CAROUSEL', label: 'Carrossel' },
                    ]}
                    value={creativeForm.format}
                    onChange={(e) =>
                      setCreativeForm({
                        ...creativeForm,
                        format: e.target.value,
                      })
                    }
                  />

                  <Select
                    label="Call-to-Action"
                    options={[
                      { value: 'LEARN_MORE', label: 'Saiba Mais' },
                      { value: 'SHOP_NOW', label: 'Compre Agora' },
                      { value: 'DOWNLOAD', label: 'Baixar' },
                      { value: 'SIGN_UP', label: 'Cadastre-se' },
                      { value: 'CONTACT_US', label: 'Entre em Contato' },
                    ]}
                    value={creativeForm.cta}
                    onChange={(e) =>
                      setCreativeForm({
                        ...creativeForm,
                        cta: e.target.value,
                      })
                    }
                  />

                  <TextArea
                    label="Texto do Anúncio"
                    value={creativeForm.adText}
                    onChange={(e) =>
                      setCreativeForm({
                        ...creativeForm,
                        adText: e.target.value,
                      })
                    }
                    placeholder="Escreva o texto que será exibido no anúncio..."
                    rows={3}
                  />

                  <Input
                    label="URL de Destino"
                    type="url"
                    value={creativeForm.landingUrl}
                    onChange={(e) =>
                      setCreativeForm({
                        ...creativeForm,
                        landingUrl: e.target.value,
                      })
                    }
                    placeholder="https://seu-site.com"
                    required
                  />

                  <Input
                    label="Parâmetros de URL"
                    value={creativeForm.urlParams}
                    onChange={(e) =>
                      setCreativeForm({
                        ...creativeForm,
                        urlParams: e.target.value,
                      })
                    }
                    placeholder="utm_source=tiktok&utm_medium=cpc"
                  />
                </div>
              </Card>

              <Card title="Arquivo Criativo">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-dark-100 rounded-lg p-8 text-center hover:border-brand-500 transition-colors cursor-pointer">
                    <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-300 font-medium mb-1">
                      Selecione ou arraste seu {creativeForm.format === 'SINGLE_IMAGE' ? 'imagem' : 'vídeo'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {creativeForm.format === 'SINGLE_IMAGE'
                        ? 'Formatos suportados: JPG, PNG'
                        : 'Formatos suportados: MP4, MOV'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card title="URLs de Rastreamento">
                <div className="space-y-4">
                  <Input
                    label="URL de Impressão"
                    type="url"
                    value={creativeForm.impressionUrl}
                    onChange={(e) =>
                      setCreativeForm({
                        ...creativeForm,
                        impressionUrl: e.target.value,
                      })
                    }
                    placeholder="https://seu-tracker.com/impression"
                  />

                  <Input
                    label="URL de Clique"
                    type="url"
                    value={creativeForm.clickUrl}
                    onChange={(e) =>
                      setCreativeForm({
                        ...creativeForm,
                        clickUrl: e.target.value,
                      })
                    }
                    placeholder="https://seu-tracker.com/click"
                  />
                </div>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setCurrentStep('adgroup')}
                >
                  VOLTAR
                </Button>
                <Button
                  onClick={handlePublish}
                  size="lg"
                >
                  PUBLICAR LOTES DE CAMPANHAS
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <Card className="bg-dark-400/50 border-dark-100 sticky bottom-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-500">Contas Selecionadas</p>
              <p className="text-lg font-bold text-brand-500">{selectedAccounts.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Conjuntos</p>
              <p className="text-lg font-bold text-gray-100">{campaignTree.adgroups.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Anúncios</p>
              <p className="text-lg font-bold text-gray-100">{campaignTree.creatives.length}</p>
            </div>
          </div>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <AlertCircle size={16} />
            Total de campanhas a criar: {selectedAccounts.length * campaignTree.adgroups.length * campaignTree.creatives.length}
          </div>
        </div>
      </Card>
    </div>
  );
}
