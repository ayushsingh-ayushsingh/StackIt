'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminPanel from '@/components/admin/AdminPanel';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AdminPanel />;
} 