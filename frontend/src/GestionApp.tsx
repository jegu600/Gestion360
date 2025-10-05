import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';

export const GestionApp = () => {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
};

