import { createContext, ReactNode } from 'react';
export const AuthContext = createContext({});
export function AuthProvider({ children }: { children: ReactNode }) { return <>{children}</>; }