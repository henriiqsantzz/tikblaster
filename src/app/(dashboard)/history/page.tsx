'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge } from '@/components/ui';
import { CheckCircle, AlertCircle, Clock, XCircle, Loader2 } from 'lucide-react';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED': return <CheckCircle size={24} className="text-green-500" />;
    case 'PROCESSING': return <Clock size={24} className="text-blue-500 animate-spin" />;
    case 'PARTIAL': return <AlertCircle size={24} className="text-yellow-500" />;
    case 'FAILED': return <XCircle size={24} className="text-red-500" />;
    case 'PENDING': return <Clock size={24} className="text-gray-400" />;
    default: return null;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'Concluído';
    case 'PROCESSING': return 'Processando';
    case 'PARTIAL': return 'Parcial';
    case 'FAILED': return 'Falhou';
    case 'PENDING': return 'Pendente';
    default: return status;
  }
};

export default function HistoryPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Falha ao buscar histórico');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    intervalRef.current = setInterval(() => {
      if (jobs.some(j => j.status === 'PROCESSING' || j.status === 'PENDING')) {
        fetchJobs();
      }
    }, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (jobs.some(j => j.status === 'PROCESSING' || j.status === 'PENDING')) {
      intervalRef.current = setInterval(fetchJobs, 10000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [jobs]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Histórico de Lotes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Carregando...</p>
        </div>
        {[1, 2, 3].map(i => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Lotes</h1>
        <p className="text-sm text-gray-500 mt-0.5">Acompanhe o histórico de criação de campanhas e contas em lote</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#f0e4e9] shadow-card hover-glow text-center py-12 px-6">
          <p className="text-gray-500 text-lg mb-2">Nenhum lote encontrado</p>
          <p className="text-gray-400 text-sm">Crie campanhas ou contas em lote para ver o histórico aqui.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const total = job.total_campaigns || job.total_accounts || 0;
            const completed = job.completed_campaigns || job.created_accounts || 0;
            const failed = job.failed_campaigns || job.failed_accounts || 0;
            const successRate = total > 0 ? ((completed / total) * 100) : 0;

            return (
              <Card key={job.id} className="hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getStatusIcon(job.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Lote {job.id.substring(0, 12)}...
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Criado em {new Date(job.created_at).toLocaleString('pt-BR')}
                        </p>
                        {job.completed_at && (
                          <p className="text-xs text-gray-400">
                            Finalizado em {new Date(job.completed_at).toLocaleString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <Badge variant={
                        job.status === 'COMPLETED' ? 'success' :
                        job.status === 'PROCESSING' || job.status === 'PENDING' ? 'warning' :
                        job.status === 'PARTIAL' ? 'warning' : 'danger'
                      }>
                        {getStatusLabel(job.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3 border border-[#f0e4e9]">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-lg font-bold text-gray-900">{total}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-[#f0e4e9]">
                        <p className="text-xs text-gray-500 mb-1">Concluídos</p>
                        <p className="text-lg font-bold text-green-600">{completed}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-[#f0e4e9]">
                        <p className="text-xs text-gray-500 mb-1">Falhados</p>
                        <p className="text-lg font-bold text-red-500">{failed}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-[#f0e4e9]">
                        <p className="text-xs text-gray-500 mb-1">Taxa de Sucesso</p>
                        <p className="text-lg font-bold text-accent-500">{successRate.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">Progresso</p>
                        <p className="text-xs text-gray-400">{completed + failed}/{total}</p>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-500 transition-all duration-300"
                          style={{ width: `${total > 0 ? ((completed + failed) / total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {job.results && job.results.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#f0e4e9]">
                        <p className="text-xs text-gray-500 mb-2">Detalhes:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {job.results.map((r: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{r.advertiser_name || r.advertiser_id}</span>
                              <span className={r.status === 'SUCCESS' ? 'text-green-600' : 'text-red-500'}>
                                {r.status === 'SUCCESS' ? 'Sucesso' : r.error_message || 'Falhou'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
