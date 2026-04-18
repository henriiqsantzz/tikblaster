'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import { Sliders } from 'lucide-react';
import Link from 'next/link';

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Integrações</h1>
        <p className="text-gray-400 mt-1">Gerencie suas integrações externas</p>
      </div>
      <Card>
        <div className="text-center py-12">
          <Sliders size={48} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-bold text-gray-100 mb-2">TikTok for Business</h2>
          <p className="text-gray-400 mb-6">Gerencie a conexão com sua conta TikTok nas configurações.</p>
          <Link href="/settings"><Button size="md">Ir para Configurações</Button></Link>
        </div>
      </Card>
    </div>
  );
}
