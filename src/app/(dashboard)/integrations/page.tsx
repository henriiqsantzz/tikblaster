'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import { Sliders } from 'lucide-react';
import Link from 'next/link';

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie suas integrações externas</p>
      </div>
      <Card>
        <div className="text-center py-12">
          <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sliders size={20} className="text-accent-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">TikTok for Business</h2>
          <p className="text-sm text-gray-500 mb-6">Gerencie a conexão com sua conta TikTok nas configurações.</p>
          <Link href="/settings"><Button size="md">Ir para Configurações</Button></Link>
        </div>
      </Card>
    </div>
  );
}
