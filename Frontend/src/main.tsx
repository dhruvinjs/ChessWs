// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {App} from './App.tsx'
import { StrictMode } from 'react'
import {QueryClientProvider} from "@tanstack/react-query"
import { queryClient } from './lib/reactQueryClient.ts'

createRoot(document.getElementById('root')!).render(
    // <QueryClientProvider client={queryClient}>
  <StrictMode>
<QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>    
  </StrictMode>        
)
