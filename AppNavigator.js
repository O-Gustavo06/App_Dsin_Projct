import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import CriacaoScreen from './CriacaoScreen';
import CreditosScreen from './CreditosScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      {/* Otimização: Aplicando 'headerShown: false' aqui,
        todas as telas do Stack.Navigator herdam essa opção.
      */}
      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Stack.Screen 
          name="Criacao" 
          component={CriacaoScreen} 
        />
        <Stack.Screen 
          name="Creditos" // Nome da rota
          component={CreditosScreen} // Componente correto
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}