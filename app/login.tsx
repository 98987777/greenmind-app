import React from 'react';
import LoginScreen from '../src/screens/LoginScreen';

// This file simply tells the router:
// "When the user navigates to the /login path, render the LoginScreen component."
export default function LoginPage() {
  return <LoginScreen />;
}
