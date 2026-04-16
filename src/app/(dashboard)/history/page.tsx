'use client';

import React from 'react';
import { Card, Badge } from '@/components/ui';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

// Mock batch jobs
const mockJobs = [
  {
    id: '1',
    status: 'COMPLETED',
    createdAt: '2024-04-16 14:30:00',
    totalCampaigns: 15,
    completedCampaigns: 15,
    failedCampaigns: 0,
    successRate: 100,
  },
  {
    id: '2',
    status: 'PARTIAL',
    createdAt: '2024-04-15 10:15:00',
    totalCampaigns: 12,
    completedCampaigns: 10,
    failedCampaigns: 2,
    successRate: 83.33,
  },
  {
    id: '3',
    status: 'COMPLETED',
    createdAt: '2024-04-14 09:45:00',
    totalCampaigns: 20,
    completedCampaigns: 20,
    failedCampaigns: 0,
    successRate: 100,
  },
  {
    id: '4',
    status: 'PROCESSING',
    createdAt: '2024-04-14 08:20:00',
    totalCampaigns: 8,
    completedCampaigns: 5,
    failedCampaigns: 0,
    successRate: 62.5,
  },
  {
    id: '5',
    status: 'FAILED',
    createdAt: '2024-04-13 16:30:00',
    totalCampaigns: 10,
    completedCampaigns: 0,
    failedCampaigns: 10,
    successRate: 0,
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle size={24} className="text-green-400" />;
    case 'PROCESSING':
      return <Clock size={24} className="text-blue-400 animate-spin" />;
    case 'PARTIAL':
      return <AlertCircle size={24} className="text-yellow-400" />;
    case 'FAILED':
      return <XCircle size={24} className="text-red-400" />;
    default:
      return null;
  }
};

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Histórico de Lotes</h1>
        <p className="text-gray-400 mt-1">Acompanhe o histórico de criação de campanhas em lote</p>
      </div>

      {/* Jobs List */}
      {mockJobs.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-lg">Nenhum lote recente</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mockJobs.map((job) => (
            <Card
              key={job.id}
              className="hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(job.status)}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">
                        Lote #{job.id}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Criado em {job.createdAt}
                      </p>
                    </div>
                    <Badge
                      variant={
                        job.status === 'COMPLETED'
                          ? 'success'
                          : job.status === 'PROCESSING'
                          ? 'warning'
                          : job.status === 'PARTIAL'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {getStatusLabel(job.status)}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-dark-400/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Total de Campanhas</p>
                      <p className="text-lg font-bold text-gray-100">
                        {job.totalCampaigns}
                      </p>
                    </div>
                    <div className="bg-dark-400/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Concluídas</p>
                      <p className="text-lg font-bold text-green-400">
                        {job.completedCampaigns}
                      </p>
                    </div>
                    <div className="bg-dark-400/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Falhadas</p>
                      <p className="text-lg font-bold text-red-400">
                        {job.failedCampaigns}
                      </p>
                    </div>
                    <div className="bg-dark-400/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Taxa de Sucesso</p>
                      <p className="text-lg font-bold text-brand-400">
                        {job.successRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">Progresso</p>
                      <p className="text-xs text-gray-500">
                        {job.completedCampaigns}/{job.totalCampaigns}
                      </p>
                    </div>
                    <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300"
                        style={{
                          width: `${(job.completedCampaigns / job.totalCampaigns) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
