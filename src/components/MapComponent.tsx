import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Define the structure of the props this component will receive
interface MapComponentProps {
  mapRef: React.Ref<MapView>;
  recyclingCenters: Array<{
    id: string;
    name: string;
    coordinate: { latitude: number; longitude: number };
  }>;
  selectedCenter: { id: string };
  userLocationMarkerStyle: any;
}

const MapComponent: React.FC<MapComponentProps> = ({
  mapRef,
  recyclingCenters,
  selectedCenter,
  userLocationMarkerStyle,
}) => {
  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: 19.09,
        longitude: 72.99,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }}
    >
      {recyclingCenters.map(center => (
        <Marker
          key={center.id}
          coordinate={center.coordinate}
          title={center.name}
          pinColor={selectedCenter.id === center.id ? '#00B879' : '#FF6347'}
        />
      ))}
      <Marker
        coordinate={{ latitude: 19.0760, longitude: 72.8777 }} // Mock user location
        title="Your Location"
      >
        <View style={userLocationMarkerStyle} />
      </Marker>
    </MapView>
  );
};

export default MapComponent;
