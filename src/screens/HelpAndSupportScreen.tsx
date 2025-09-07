import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

// The UIManager code that caused the warning has been removed from this version.

const faqData = [
    {
        id: '1',
        question: "How does the item scanning work?",
        answer: "Our AI-powered scanner analyzes the item through your camera to identify its material and provide detailed recycling information and its carbon footprint."
    },
    {
        id: '2',
        question: "How are Eco-Points calculated?",
        answer: "You earn Eco-Points for various activities, such as scanning items, dropping off waste at certified centers, and completing challenges. The points vary based on the impact of the action."
    },
    {
        id: '3',
        question: "Where can I find drop-off centers?",
        answer: "You can find a map and list of all nearby certified recycling centers in the 'Drop-off' tab. The app uses your location to show you the closest options."
    },
    {
        id: '4',
        question: "Is my data secure?",
        answer: "Yes, we prioritize your privacy and security. All personal data is encrypted and handled in accordance with our privacy policy. We do not share your personal information with third parties without your consent."
    },
];

const FaqItem = ({ item, isExpanded, onPress }: { item: typeof faqData[0]; isExpanded: boolean; onPress: () => void }) => {
    return (
        <TouchableOpacity style={styles.faqItem} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.faqQuestionContainer}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#00C851" />
            </View>
            {isExpanded && (
                <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const HelpAndSupportScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleEmailPress = () => Linking.openURL('mailto:support@greenmind.app');
  const handleCallPress = () => Linking.openURL('tel:+1234567890');

  const toggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqData.map(item => (
                <FaqItem 
                    key={item.id}
                    item={item}
                    isExpanded={expandedId === item.id}
                    onPress={() => toggleFaq(item.id)}
                />
            ))}
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <TouchableOpacity style={styles.contactButton} onPress={handleEmailPress}>
                <Feather name="mail" size={20} color="#00C851" />
                <Text style={styles.contactButtonText}>Email Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={handleCallPress}>
                <Feather name="phone" size={20} color="#00C851" />
                <Text style={styles.contactButtonText}>Call Us</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  content: {
    padding: 25,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  faqItem: {
    backgroundColor: '#F7F8F9',
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    flex: 1, // Ensure text wraps
    marginRight: 10,
  },
  faqAnswerContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 10,
  },
  faqAnswer: {
    fontSize: 15,
    color: '#3C3C43',
    lineHeight: 22,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8F9',
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  contactButtonText: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 15,
    fontWeight: '500',
  },
});

export default HelpAndSupportScreen;

