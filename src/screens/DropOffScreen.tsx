import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

// Define the shape of a single marker
type MarkerData = {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
};

// Define the props that this component accepts
type MapComponentProps = {
  initialRegion: Region;
  markers: MarkerData[];
};

const MapComponent = ({ initialRegion, markers }: MapComponentProps) => {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      showsUserLocation={true}
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={marker.location}
          title={marker.name}
        />
      ))}
    </MapView>
  );
};

export default MapComponent;
