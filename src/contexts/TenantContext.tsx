import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Tenant {
  id: string;
  shop_name: string;
  logo_url?: string;
  schema_name?: string;
  business_type?: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended' | 'inactive';
}

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tenant from localStorage on initial mount
    const storedTenant = localStorage.getItem('tenant');
    if (storedTenant) {
      try {
        setTenant(JSON.parse(storedTenant));
      } catch (error) {
        console.error('Failed to parse tenant data:', error);
        localStorage.removeItem('tenant');
      }
    }
    setLoading(false);
  }, []);

  const handleSetTenant = (newTenant: Tenant | null) => {
    setTenant(newTenant);
    if (newTenant) {
      localStorage.setItem('tenant', JSON.stringify(newTenant));
    } else {
      localStorage.removeItem('tenant');
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, setTenant: handleSetTenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export default TenantContext;
