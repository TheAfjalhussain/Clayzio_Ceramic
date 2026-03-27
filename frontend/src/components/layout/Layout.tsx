import { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
