/** Temporary probe page used to verify the CRM client map renders. */
import React, { useState } from 'react';
import ClientMapDialog from '@/components/admin/ClientMapDialog';

const MapProbe: React.FC = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className="p-6">
      <button onClick={() => setOpen(true)}>open</button>
      <ClientMapDialog
        open={open}
        onOpenChange={setOpen}
        clients={[
          {
            id: '1',
            first_name: 'Test',
            last_name: 'Client',
            email: 't@example.com',
            phone: '239-000-0000',
            status: 'new',
            address_street: '100 Main St',
            address_city: 'Auburndale',
            address_state: 'FL',
            address_zip: '33823',
          },
        ]}
      />
    </div>
  );
};

export default MapProbe;
