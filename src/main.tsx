import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './index.css';
if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark');
createRoot(document.getElementById('root')!).render(<App/>);
