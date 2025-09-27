import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import 'primereact/resources/primereact.min.css';
//import 'primereact/resources/themes/md-dark-deeppurple/theme.css';
import 'primereact/resources/themes/bootstrap4-light-purple/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.css';



createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,


)
