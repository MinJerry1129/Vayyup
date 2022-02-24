import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import Onboarding from 'screens/OnBoarding';
import LoginScreen from 'screens/OnBoarding/LoginScreen';
import SignupScreen from 'screens/OnBoarding/SignupScreen';
import EmailValidationScreen from 'screens/OnBoarding/EmailValidationScreen';
import PhoneNumberVerification from 'screens/OnBoarding/PhoneNumberVerification';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator mode="modal">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      {/* <Stack.Screen
        options={{ headerShown: false }}
        name="SignUp"
        component={SignupScreen}
      /> */}
      <Stack.Screen
        options={{headerShown: false}}
        name="EmailValidation"
        component={EmailValidationScreen}
      />
      <Stack.Screen
        options={{headerShown: false}}
        name="PhoneNumberVerify"
        component={PhoneNumberVerification}
      />
      <Stack.Screen
        name="Onboarding"
        component={Onboarding}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
