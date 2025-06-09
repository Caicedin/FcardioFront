import ClientInfo from './clientinfo';
import { Suspense } from 'react';

export default function Page() {  return (
    <Suspense fallback={<div>Cargando cliente...</div>}>
      <ClientInfo />
    </Suspense>
  );
}
