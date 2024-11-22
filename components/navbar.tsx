'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Package,
  BoxSeam,
  ClipboardList,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', Icon: BarChart3 },
  { name: 'Products', href: '/products', Icon: Package },
  { name: 'Inventory', href: '/inventory', Icon: BoxSeam },
  { name: 'Reports', href: '/reports', Icon: ClipboardList },
  { name: 'Settings', href: '/settings', Icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">IMS</h1>
            <div className="ml-10 flex items-center space-x-4">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={pathname === item.href ? 'default' : 'ghost'}
                    className={cn(
                      'flex items-center space-x-2',
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    <item.Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}