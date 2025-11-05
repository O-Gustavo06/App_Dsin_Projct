import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RegistrationScreen from './RegistrationScreen';
import MapScreen from './MapScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      
      <Stack.Navigator 
        initialRouteName="Registration" 
      >
        
        <Stack.Screen 
          name="Registration" // Apelido da tela
          component={RegistrationScreen} 
          options={{ title: 'Crie sua Conta' }} // Título no cabeçalho
        />
        

        <Stack.Screen 
          name="Map" // Apelido da tela
          component={MapScreen} // O componente que ela renderiza
          options={{ 
            // Esconde o cabeçalho padrão, pois sua tela de mapa já tem um
            headerShown: false 
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
