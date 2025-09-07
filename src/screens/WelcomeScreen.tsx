import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import * as Progress from "react-native-progress";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

// Data for all three screens
const onboardingScreens = [
  {
    id: 1,
    image: "https://plus.unsplash.com/premium_photo-1681987448179-4a93b7975018?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Welcome to",
    title2: "GreenMind",
    subtitle: "Together we create a cleaner and greener environment by managing waste efficiently.",
  },
  {
    id: 2,
    image: "https://plus.unsplash.com/premium_photo-1683072005067-455d56d323b4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Easy Items",
    title2: "Handover",
    subtitle: "Drop off your recyclable items directly at the nearest recycling centers.",
  },
  {
    id: 3,
    image: "https://cdn.prod.website-files.com/623c248befc1ff5d00294b60/625425175f12562a7eb24e08_Sorting%20Overview.png",
    title: "Scan Items &",
    title2: "Know More",
    subtitle: "Scan Items to decode recycling, carbon footprint, and sustainability with a single scan.",
  },
];

const WelcomeScreen: React.FC = () => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (currentScreenIndex < onboardingScreens.length - 1) {
      setCurrentScreenIndex(currentScreenIndex + 1);
    } else {
      router.push('/login');
    }
  };
  
  const handlePrevious = () => {
    if (currentScreenIndex > 0) {
      setCurrentScreenIndex(currentScreenIndex - 1);
    }
  };

  const handleSkip = () => {
    setCurrentScreenIndex(onboardingScreens.length - 1);
  };

  const currentScreen = onboardingScreens[currentScreenIndex];
  const responsiveStyles = createResponsiveStyles(width, height);

  return (
    <SafeAreaView style={responsiveStyles.container}>
      <View style={responsiveStyles.topRow}>
        <Progress.Bar
          progress={(currentScreenIndex + 1) / onboardingScreens.length}
          width={width * 0.7}
          height={5}
          color="#00C851"
          unfilledColor="#E5E5E5"
          borderWidth={0}
          style={{ marginTop: 5 }}
        />
        <TouchableOpacity style={responsiveStyles.skipButton} onPress={handleSkip}>
          <Text style={responsiveStyles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={responsiveStyles.imageContainer}>
        <Image source={{ uri: currentScreen.image }} style={responsiveStyles.image} />
      </View>

      <Text style={responsiveStyles.title}>{currentScreen.title}</Text>
      {currentScreen.title2 ? <Text style={responsiveStyles.title2}>{currentScreen.title2}</Text> : null}
      <Text style={responsiveStyles.subtitle}>{currentScreen.subtitle}</Text>
      
      <View style={responsiveStyles.bottomContainer}>
        {currentScreenIndex === 0 ? (
          <TouchableOpacity style={responsiveStyles.nextButtonCentered} onPress={handleNext}>
            <Text style={responsiveStyles.nextText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={responsiveStyles.previousButton} onPress={handlePrevious}>
              <Text style={responsiveStyles.previousText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={responsiveStyles.nextButton} onPress={handleNext}>
              <Text style={responsiveStyles.nextText}>
                {currentScreenIndex === onboardingScreens.length - 1 ? "Get Started" : "Next"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const createResponsiveStyles = (width: number, height: number) => {
  const scale = (size: number) => (width / 375) * size;
  const fontScale = (size: number) => {
    const scaleFactor = Math.min(width / 375, 1.2);
    return size * scaleFactor;
  }

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: "# fff", alignItems: "center" },
    topRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "center", paddingHorizontal: 20, marginTop: 10 },
    skipButton: { padding: 8 },
    skipText: { fontSize: fontScale(15), color: "#323232" },
    imageContainer: { marginTop: scale(30), borderRadius: 20, overflow: "hidden", width: width - 40, height: height * 0.4 },
    image: { width: "100%", height: "100%", resizeMode: "cover" },
    title: { fontSize: fontScale(22), fontWeight: "bold", textAlign: "center", color: "#000", marginTop: scale(20) },
    title2: { fontSize: fontScale(30), fontWeight: "bold", textAlign: "center", color: "#000" },
    subtitle: { fontSize: fontScale(16), textAlign: "center", color: "#323232", marginTop: scale(15), paddingHorizontal: 20, lineHeight: fontScale(24) },
    bottomContainer: { position: 'absolute', bottom: 40, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
    
    // --- CHANGED STYLES START HERE ---
    previousButton: {
      backgroundColor: '#fff',
      paddingVertical: scale(14),
      borderRadius: 30,
      borderWidth: 1,
      borderColor: '#00C851',
      width: '48%', // Use a percentage width
      alignItems: 'center'
    },
    nextButton: {
      backgroundColor: "#00C851",
      paddingVertical: scale(14),
      borderRadius: 30,
      width: '48%', // Use a percentage width
      alignItems: 'center',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 3.84,
      elevation: 5,
    },
    // --- CHANGED STYLES END HERE ---
    
    previousText: { color: '#00C851', fontSize: fontScale(16), fontWeight: 'bold' },
    nextButtonCentered: {
      backgroundColor: "#00C851",
      paddingVertical: scale(14),
      borderRadius: 30,
      width: '100%',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 3.84,
      elevation: 5,
    },
    nextText: {
      color: "#fff",
      fontSize: fontScale(16),
      fontWeight: "bold",
    },
  });
}

export default WelcomeScreen;
