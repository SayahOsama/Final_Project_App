import ReactDOM from 'react-dom/client';
import {App} from './App';
import { MantineProvider } from '@mantine/core';
import React from 'react';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <MantineProvider defaultColorScheme='light'>
      {/* <React.StrictMode> */}
        <App />
      {/* </React.StrictMode> */}
    </MantineProvider>
);
