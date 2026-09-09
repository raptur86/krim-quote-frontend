import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { QueryProvider } from "./app/providers/QueryProvider";
import { AppRouter } from "./app/router/AppRouter";
import { AuthProvider } from "./features/auth/AuthProvider";

import "./styles/global.css";
import "./styles/utilities.css";
import "./styles/variables.css";


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider><AppRouter /></AuthProvider>
    </QueryProvider>
  </StrictMode>,
);
