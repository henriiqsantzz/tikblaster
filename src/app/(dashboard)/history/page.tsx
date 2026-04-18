'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge } from '@/components/ui';
import { CheckCircle, AlertCircle, Clock, XCircle, Loader2 } from 'lucide-react';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED': return <CheckCircle size={24} className="text-green-400" />;
    case 'PROCESSING': return <Clock size={24} className="text-blue-400 animate-spin" />;
    case 'PARTIAL': return <AlertCircle size={24} className="text-yellow-400" />;
    case 'FAILED': return <XCircle size={24} className="text-red-400" />;
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
    // Auto-refresh every 10s if there are processing jobs
    intervalRef.current = setInterval(() => {
      if (jobs.some(j => j.status === 'PROCESSING' || j.status === 'PENDING')) {
        fetchJobs();
      }
    }, 10000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Re-setup interval when jobs change
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
          <h1 className="text-3xl font-bold text-gray-50">Histórico de Lotes</h1>
          <p className="text-gray-400 mt-1">Carregando...</p>
        </div>
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-dark-300 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Histórico de Lotes</h1>
        <p className="text-gray-400 mt-1">Acompanhe o histórico de criação de campanhas e contas em lote</p>
      </div>

      {error && (
        <Card className="border-red-900/50 bg-red-900/10">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      {jobs.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">Nenhum lote encontrado</p>
          <p className="text-gray-500 text-sm">Crie campanhas ou contas em lote para ver o histórico aqui.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => {
            const total = job.total_campaigns || job.total_accounts || 0;
            const completed = job.completed_campaigns || job.created_accounts || 0;
            const failed = job.failed_campaigns || job.failed_accounts || 0;
            const successRate = total > 0 ? ((completed / total) * 100) : 0;

            return (
              <Card key={job.id} className="hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">{getStatusIcon(job.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100">
                          Lote {job.id.substring(0, 12)}...
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Criado em {new Date(job.created_at).toLocaleString('pt-BR')}
                        </p>
                        {job.completed_at && (
                          <p className="text-xs text-gray-500">
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
                      <div className="bg-dark-400/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-lg font-bold text-gray-100">{total}</p>
                      </div>
                      <div className="bg-dark-400/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Concluídos</p>
                        <p className="text-lg font-bold text-green-400">{completed}</p>
                      </div>
                      <div className="bg-dark-400/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Falhados</p>
                        <p className="text-lg font-bold text-red-400">{failed}</p>
                      </div>
                      <div className="bg-dark-400/50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Taxa de Sucesso</p>
                        <p className="text-lg font-bold text-brand-400">{successRate.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-400">Progresso</p>
                        <p className="text-xs text-gray-500">{completed + failed}/{total}</p>
                      </div>
                      <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300"
                          style={{ width: `${total > 0 ? ((completed + failed) / total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Show results if available */}
                    {job.results && job.results.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-dark-100">
                        <p className="text-xs text-gray-400 mb-2">Detalhes:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {job.results.map((r: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-gray-300">{r.advertiser_name || r.advertiser_id}</span>
                              <span className={r.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>
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
