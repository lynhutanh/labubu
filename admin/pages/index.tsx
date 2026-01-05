import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { storage } from '../src/utils/storage';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    const user = storage.getUser();
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return null;
}

