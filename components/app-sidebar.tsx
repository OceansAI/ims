'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Package,
  Box,
  BarChart3,
  Settings,
  Users,
  ClipboardCheck,
  DollarSign,
  ChevronRight,
  Plus,
  ListFilter,
  Move
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from '@/components/auth/auth-provider';
import { SignOutButton } from '@/components/auth/sign-out-button';

const navigation = [
  {
    title: "Overview",
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard }
    ]
  },
  {
    title: "Inventory Management",
    items: [
      {
        name: 'Products',
        icon: Package,
        subitems: [
          { name: 'All Products', href: '/products', icon: ListFilter },
          { name: 'Add Product', href: '/products/new', icon: Plus },
        ]
      },
      {
        name: 'Inventory',
        icon: Box,
        subitems: [
          { name: 'Current Stock', href: '/inventory', icon: Box },
          { name: 'Movements', href: '/inventory/movements', icon: Move },
          { name: 'Audits', href: '/inventory/audits', icon: ClipboardCheck },
        ]
      },
    ]
  },
  {
    title: "Reports & Settings",
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Storage Rates', href: '/reports/storage-rates', icon: DollarSign },
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Customers', href: '/customers', icon: Users },
    ]
  }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-72 flex-col fixed left-0 top-0 border-r bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-bold">IMS</h2>
        <span className="text-sm text-muted-foreground">{user?.email}</span>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-3">
                {section.title}
              </h3>
              
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.name}>
                    {item.subitems ? (
                      <Collapsible>
                        <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1 text-left">{item.name}</span>
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="mt-1 space-y-1 px-6">
                            {item.subitems.map((subitem) => (
                              <li key={subitem.name}>
                                <Link
                                  href={subitem.href}
                                  className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                    pathname === subitem.href
                                      ? 'bg-primary text-primary-foreground'
                                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                  )}
                                >
                                  <subitem.icon className="h-4 w-4" />
                                  {subitem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Link
                        href={item.href!}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          pathname === item.href
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t">
        <SignOutButton />
      </div>
    </div>
  );
}