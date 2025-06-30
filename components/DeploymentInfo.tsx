import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

export function DeploymentInfo() {
  const deployedAt = process.env.EXPO_PUBLIC_DEPLOYED_AT;
  const buildNumber = Constants.expoConfig?.extra?.buildNumber;

  if (!deployedAt) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Deployed: {deployedAt}</Text>
      {buildNumber && <Text style={styles.text}>Build: {buildNumber}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    marginTop: 8,
  },
  text: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});