// This file manually declares the types for Firebase Auth in React Native.
// It solves the error where 'getReactNativePersistence' cannot be found.
import { Persistence, ReactNativeAsyncStorage } from "firebase/auth";

declare module "firebase/auth" {
  export function getReactNativePersistence(
    storage: ReactNativeAsyncStorage
  ): Persistence;
}
