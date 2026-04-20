'use client';

import React, { useState } from 'react';
import { Card, Input, Select, Button } from '@/components/ui';
import { Building2, User, Phone, Mail, Hash, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AccountsPage() {
  const router = useRouter();
  const { activeBC } = useAppStore();
  const [formData, setFormData] = useState({
    companyName: '', cnpj: '', industryId: '', contactName: '',
    contactEmail: '', contactPhone: '', quantity: 1, namePrefix: 'ACC',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBC?.bc_id) { toast.error('Selecione um Business Center'); return; }
    if (!formData.companyName.trim()) { toast.error('Nome da empresa é obrigatório'); return; }
    if (!formData.contactName.trim()) { toast.error('Nome do contato é obrigatório'); return; }
    if (!formData.contactEmail.trim()) { toast.error('Email do contato é obrigatório'); return; }
    if (!formData.contactPhone.trim()) { toast.error('Telefone do contato é obrigatório'); return; }
    if (formData.quantity < 1 || formData.quantity > 100) { toast.error('Quantidade deve estar entre 1 e 100'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('/api/accounts/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bc_id: activeBC.bc_id,
          company_name: formData.companyName,
          cnpj: formData.cnpj || undefined,
          industry_id: formData.industryId,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          quantity: parseInt(formData.quantity as any),
          name_prefix: formData.namePrefix,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao criar contas');
      }

      const result = await res.json();
      toast.success(`Lote criado! Job: ${result.job_id}. ${result.total_accounts} contas em processamento.`);
      router.push('/history');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar contas');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeBC) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Criação de Contas</h1>
          <p className="text-gray-500 mt-1">Crie contas de anunciantes em lote</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16 px-6">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Conta TikTok não conectada</h2>
          <p className="text-gray-500 mb-6">Conecte sua conta para criar contas de anunciantes.</p>
          <Link href="/settings"><Button size="lg">Ir para Configurações</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Criação de Contas</h1>
        <p className="text-gray-500 mt-1">Crie contas de anunciantes em lote</p>
      </div>

      <Card title="Novo Lote de Contas" icon={<Building2 size={24} />}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Business Center</p>
            <p className="text-lg font-semibold text-gray-800">{activeBC.name || activeBC.bc_id}</p>
            <p className="text-xs text-gray-500 font-mono mt-1">{activeBC.bc_id}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Informações da Empresa</h3>
            <Input label="Nome da Empresa" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Ex: Minha Empresa LTDA" icon={<Building2 size={18} />} required />
            <Input label="CNPJ" name="cnpj" value={formData.cnpj} onChange={handleInputChange} placeholder="XX.XXX.XXX/0001-XX" maxLength={18} />
            <Select label="Segmento Comercial" name="industryId" value={formData.industryId} onChange={handleInputChange} options={[
              { value: '', label: 'Selecione um segmento' },
              { value: '292701', label: 'E-commerce' },
              { value: '292801', label: 'Varejo' },
              { value: '292901', label: 'Serviços' },
              { value: '293001', label: 'Financeiro' },
              { value: '293101', label: 'Tecnologia' },
              { value: '293201', label: 'Outro' },
            ]} required />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Informações de Contato</h3>
            <Input label="Nome do Contato" name="contactName" value={formData.contactName} onChange={handleInputChange} placeholder="Ex: João Silva" icon={<User size={18} />} required />
            <Input label="Email" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleInputChange} placeholder="email@empresa.com" icon={<Mail size={18} />} required />
            <Input label="Telefone" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="+5511987654321" icon={<Phone size={18} />} required />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Configuração de Lote</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Quantidade de Contas" name="quantity" type="number" min="1" max="100" value={formData.quantity} onChange={handleInputChange} icon={<Hash size={18} />} required />
              <Input label="Prefixo de Nome" name="namePrefix" value={formData.namePrefix} onChange={handleInputChange} placeholder="Ex: ACC" maxLength={10} />
            </div>
            <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
              As contas serão criadas com nomes como: {formData.namePrefix}-001, {formData.namePrefix}-002, etc.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button type="submit" size="lg" className="flex-1" loading={isLoading} disabled={isLoading}>
              {isLoading ? 'CRIANDO...' : 'CRIAR CONTAS EM LOTE'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
