'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { Building2 } from 'lucide-react';

export default function BusinessCentersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-50">Business Centers</h1>
        <p className="text-gray-400 mt-1">Gerencie seus business centers</p>
      </div>

      <Card
        title="Business Centers"
        icon={<Building2 size={24} />}
      >
        <div className="text-center py-12">
          <p className="text-gray-400">Funcionalidade em desenvolvimento...</p>
        </div>
      </Card>
    </div>
  );
}
