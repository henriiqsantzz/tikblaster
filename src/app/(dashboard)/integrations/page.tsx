'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { Sliders } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Integrações</h1>
        <p className="text-gray-400 mt-1">Gerencie suas integrações</p>
      </div>

      <Card
        title="Integrações"
        icon={<Sliders size={24} />}
      >
        <div className="text-center py-12">
          <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
        </div>
      </Card>
    </div>
  );
}
