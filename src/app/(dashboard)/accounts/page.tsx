'use client';

import React, { useState } from 'react';
import { Card, Input, Select, Button, TextArea } from '@/components/ui';
import { Building2, User, Phone, Mail, Hash } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AccountsPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    industryId: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    quantity: 1,
    namePrefix: 'ACC',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.companyName.trim()) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }
    if (!formData.contactName.trim()) {
      toast.error('Nome do contato é obrigatório');
      return;
    }
    if (!formData.contactEmail.trim()) {
      toast.error('Email do contato é obrigatório');
      return;
    }
    if (!formData.contactPhone.trim()) {
      toast.error('Telefone do contato é obrigatório');
      return;
    }
    if (formData.quantity < 1 || formData.quantity > 100) {
      toast.error('Quantidade deve estar entre 1 e 100');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(
        `Lote de ${formData.quantity} conta(s) criada(s) com sucesso!`
      );

      setFormData({
        companyName: '',
        cnpj: '',
        industryId: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        quantity: 1,
        namePrefix: 'ACC',
      });
    } catch (error) {
      toast.error('Erro ao criar contas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Criação de Contas</h1>
        <p className="text-gray-400 mt-1">Crie contas de anunciantes em lote</p>
      </div>

      {/* Form Card */}
      <Card title="Novo Lote de Contas" icon={<Building2 size={24} />}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Center Info */}
          <div className="bg-dark-400/50 rounded-lg p-4 border border-dark-100">
            <p className="text-sm text-gray-400 mb-2">Business Center</p>
            <p className="text-lg font-semibold text-gray-100">BC-2024-001</p>
            <p className="text-xs text-gray-500 mt-1">Contexto selecionado</p>
          </div>

          {/* Company Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              Informações da Empresa
            </h3>

            <Input
              label="Nome da Empresa"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Ex: Minha Empresa LTDA"
              icon={<Building2 size={18} />}
              required
            />

            <Input
              label="CNPJ"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleInputChange}
              placeholder="XX.XXX.XXX/0001-XX"
              maxLength="18"
            />

            <Select
              label="Segmento Comercial"
              name="industryId"
              value={formData.industryId}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Selecione um segmento' },
                { value: 'retail', label: 'Varejo' },
                { value: 'ecommerce', label: 'E-commerce' },
                { value: 'services', label: 'Serviços' },
                { value: 'finance', label: 'Financeiro' },
                { value: 'saas', label: 'SaaS' },
                { value: 'other', label: 'Outro' },
              ]}
              required
            />
          </div>

          {/* Contact Section */}
          <div className="space-y-4 pt-4 border-t border-dark-100">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              Informações de Contato
            </h3>

            <Input
              label="Nome do Contato"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              placeholder="Ex: João Silva"
              icon={<User size={18} />}
              required
            />

            <Input
              label="Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleInputChange}
              placeholder="email@empresa.com"
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Telefone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              placeholder="(11) 98765-4321"
              icon={<Phone size={18} />}
              required
            />
          </div>

          {/* Batch Settings */}
          <div className="space-y-4 pt-4 border-t border-dark-100">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              Configuração de Lote
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantidade de Contas"
                name="quantity"
                type="number"
                min="1"
                max="100"
                value={formData.quantity}
                onChange={handleInputChange}
                icon={<Hash size={18} />}
                required
              />

              <Input
                label="Prefixo de Nome"
                name="namePrefix"
                value={formData.namePrefix}
                onChange={handleInputChange}
                placeholder="Ex: ACC"
                maxLength="10"
              />
            </div>

            <p className="text-xs text-gray-400 bg-dark-400/50 p-3 rounded-lg">
              As contas serão criadas com nomes como: {formData.namePrefix}-001, {formData.namePrefix}-002, etc.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4 border-t border-dark-100">
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              loading={isLoading}
              disabled={isLoading}
            >
              CRIAR CONTAS EM LOTE
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center p-6">
          <div className="text-brand-500 text-3xl font-bold mb-2">10-100</div>
          <p className="text-sm text-gray-400">Contas por lote (recomendado)</p>
        </Card>
        <Card className="text-center p-6">
          <div className="text-green-400 text-3xl font-bold mb-2">5 min</div>
          <p className="text-sm text-gray-400">Tempo médio de processamento</p>
        </Card>
        <Card className="text-center p-6">
          <div className="text-blue-400 text-3xl font-bold mb-2">24h</div>
          <p className="text-sm text-gray-400">Suporte técnico disponível</p>
        </Card>
      </div>
    </div>
  );
}
