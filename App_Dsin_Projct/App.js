// App.js
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';


export default function App() {
  // O App agora só carrega o Navegador.
  // O Navegador decide qual tela (Login ou Home) mostrar.
  return <AppNavigator />;
}