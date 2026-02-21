import React from 'react';
import { View, Text } from 'react-native';

function MapView({ style, children }) {
  return (
    <View style={[{ backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }, style]}>
      <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Mapa disponível apenas no app mobile</Text>
      {children}
    </View>
  );
}

function Marker() { return null; }
function Callout() { return null; }

export default MapView;
export { Marker, Callout };
