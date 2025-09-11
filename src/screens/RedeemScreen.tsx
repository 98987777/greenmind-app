import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Linking,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { auth, db } from '../firebaseConfig';

const rewardsData = [
    { id: '1', title: 'Caramel Frapuccino Regular', points: 2000, company: 'Starbucks', validUntil: '30 December 2024', logo: 'https://i.ibb.co/3s7v7j2/starbucks-logo.png', type: 'voucher' as const, value: 'STARBUCKS-GREEN' },
    { id: '2', title: 'Discount 30% all variant pizza', points: 1500, company: "Domino's pizza", validUntil: '30 December 2024', logo: 'https://i.ibb.co/bJCq64v/dominos-logo.png', type: 'link' as const, value: 'https://www.dominos.com' },
    { id: '3', title: '1 Pcs crispy chicken', points: 1000, company: 'KFC', validUntil: '30 December 2024', logo: 'https://i.ibb.co/PQtL9XJ/kfc-logo.png', type: 'voucher' as const, value: 'KFC-REWARD-01' },
    { id: '4', title: '1 Chicken bucket', points: 5000, company: 'KFC', validUntil: '30 December 2024', logo: 'https://i.ibb.co/PQtL9XJ/kfc-logo.png', type: 'voucher' as const, value: 'KFC-BUCKET-GREEN' },
];

type Reward = (typeof rewardsData)[0];
type RedeemedItem = { id: string; title: string; date: string; };

const RedeemScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Voucher');
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [rewardDetailsModalVisible, setRewardDetailsModalVisible] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemedHistory, setRedeemedHistory] = useState<RedeemedItem[]>([]);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const docUnsubscribe = onSnapshot(userDocRef, (doc) => {
                if(doc.exists()) {
                    setUserPoints(doc.data().ecoPoints || 0);
                }
                setLoading(false);
            });
            return () => docUnsubscribe();
        } else {
            setLoading(false);
            router.replace('/login');
        }
    });
    return () => authUnsubscribe();
  }, []);

  const handleRedeemPress = (reward: Reward) => {
    if (userPoints >= reward.points) {
      setSelectedReward(reward);
      setConfirmModalVisible(true);
    } else {
      Alert.alert("Not Enough Points", "You don't have enough Eco-Points to redeem this reward yet.");
    }
  };

  const confirmRedemption = async () => {
    const user = auth.currentUser;
    if (selectedReward && user) {
      const newPoints = userPoints - selectedReward.points;
      
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { ecoPoints: newPoints });

      const newHistoryItem: RedeemedItem = {
          id: `${selectedReward.id}-${Date.now()}`,
          title: selectedReward.title,
          date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
      setRedeemedHistory([newHistoryItem, ...redeemedHistory]);

      setConfirmModalVisible(false);
      setRewardDetailsModalVisible(true);
    }
  };
  
  const copyToClipboard = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied!", "Reward code copied to clipboard.");
  };

  const openLink = (url: string) => Linking.openURL(url);
  const closeDetailsModal = () => {
    setRewardDetailsModalVisible(false);
    setSelectedReward(null);
  }

  const renderRewardDetails = () => {
    if (!selectedReward) return null;
    switch (selectedReward.type) {
        case 'voucher':
            return (
                <>
                    <Text style={styles.rewardCode}>{selectedReward.value}</Text>
                    <TouchableOpacity style={styles.rewardActionButton} onPress={() => copyToClipboard(selectedReward.value)}>
                        <Feather name="copy" size={16} color="#00C851" style={{marginRight: 8}} />
                        <Text style={styles.rewardActionButtonText}>Copy Code</Text>
                    </TouchableOpacity>
                </>
            );
        case 'link':
            return (
                <TouchableOpacity style={styles.rewardActionButton} onPress={() => openLink(selectedReward.value)}>
                    <Feather name="external-link" size={16} color="#00C851" style={{marginRight: 8}}/>
                    <Text style={styles.rewardActionButtonText}>Visit Site</Text>
                </TouchableOpacity>
            );
        default: return null;
    }
  };

  const renderRewardItem = ({ item }: { item: Reward }) => (
    <TouchableOpacity style={styles.ticket} onPress={() => handleRedeemPress(item)}>
        <View style={styles.logoContainer}>
            <Image source={{ uri: item.logo }} style={styles.companyLogo} />
        </View>
        <View style={styles.ticketDetails}>
            <Text style={styles.ticketTitle}>{item.title}</Text>
            <Text style={styles.ticketSubtitle}>valid until {item.validUntil}</Text>
            <View style={styles.pointsContainer}>
                <Text style={styles.pointsText}>{item.points} Point</Text>
            </View>
            <Text style={styles.ticketFinePrint}>Valid at all {item.company} outlet</Text>
        </View>
        <View style={styles.ticketCutoutLeft} />
        <View style={styles.ticketCutoutRight} />
    </TouchableOpacity>
  );

  const renderRedeemedItem = ({ item }: { item: RedeemedItem }) => (
    <View style={[styles.ticket, {opacity: 0.7}]}>
        <View style={styles.logoContainer}>
            <Feather name="check-circle" size={40} color="#8A8A8E" />
        </View>
        <View style={styles.ticketDetails}>
            <Text style={styles.ticketTitle}>{item.title}</Text>
            <Text style={styles.ticketSubtitle}>Redeemed on {item.date}</Text>
        </View>
    </View>
  );
  
  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C851" />
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
        <Modal
            animationType="fade"
            transparent={true}
            visible={confirmModalVisible}
            onRequestClose={() => setConfirmModalVisible(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Confirm Redemption</Text>
                    <Text style={styles.modalText}>
                        Spend {selectedReward?.points} points for "{selectedReward?.title}"?
                    </Text>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setConfirmModalVisible(false)}>
                            <Text style={[styles.modalButtonText, {color: '#1C1C1E'}]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={confirmRedemption}>
                            <Text style={styles.modalButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>

        <Modal
            animationType="slide"
            transparent={true}
            visible={rewardDetailsModalVisible}
            onRequestClose={closeDetailsModal}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Feather name="gift" size={40} color="#00C851" style={{marginBottom: 15}} />
                    <Text style={styles.modalTitle}>Reward Unlocked!</Text>
                    <Text style={[styles.modalText, {fontWeight: 'bold'}]}>{selectedReward?.title}</Text>
                    {renderRewardDetails()}
                    <TouchableOpacity style={[styles.modalButton, styles.confirmButton, {width: '100%', marginTop: 20}]} onPress={closeDetailsModal}>
                        <Text style={styles.modalButtonText}>Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Redeem Voucher</Text>
      </View>

      <View style={styles.pointsBanner}>
          <View>
              <Text style={styles.bannerPointsLabel}>Points</Text>
              <Text style={styles.bannerPointsValue}>{userPoints}</Text>
          </View>
      </View>

      <View style={styles.tabContainer}>
          {['Voucher', 'Redeemed', 'Expired'].map(tab => (
              <TouchableOpacity key={tab} style={styles.tabItem} onPress={() => setActiveTab(tab)}>
                  <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                  {activeTab === tab && <View style={styles.activeTabIndicator} />}
              </TouchableOpacity>
          ))}
      </View>
      
      {/* --- THIS IS THE MAIN FIX --- */}
      {activeTab === 'Voucher' && (
          <FlatList
              data={rewardsData}
              renderItem={renderRewardItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
          />
      )}
      {activeTab === 'Redeemed' && (
          <FlatList
              data={redeemedHistory}
              renderItem={renderRedeemedItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>No redeemed rewards yet.</Text>}
          />
      )}
      {activeTab === 'Expired' && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expired rewards.</Text>
          </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8F9' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    header: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#E8E8E8', backgroundColor: 'white' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
    pointsBanner: {
        height: 100,
        backgroundColor: '#E0F2F1',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 16,
        padding: 20,
        justifyContent: 'center',
    },
    bannerPointsLabel: {
        fontSize: 14,
        color: '#37474F',
    },
    bannerPointsValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00796B',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: 'white',
    },
    tabItem: {
        paddingVertical: 15,
        alignItems: 'center',
        flex: 1,
    },
    tabText: {
        fontSize: 16,
        color: '#8A8A8E',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#00C851',
    },
    activeTabIndicator: {
        height: 3,
        width: '80%',
        backgroundColor: '#00C851',
        borderRadius: 2,
        marginTop: 8,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100
    },
    ticket: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        position: 'relative',
    },
    logoContainer: {
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderStyle: 'dashed',
        borderRightColor: '#E0E0E0',
        width: 100,
    },
    companyLogo: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    ticketDetails: {
        flex: 1,
        padding: 15,
    },
    ticketTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    ticketSubtitle: {
        fontSize: 12,
        color: '#8A8A8E',
        marginVertical: 4,
    },
    pointsContainer: {
        backgroundColor: '#FFF3E0',
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
        marginVertical: 8,
    },
    pointsText: {
        color: '#FF9800',
        fontWeight: 'bold',
        fontSize: 12,
    },
    ticketFinePrint: {
        fontSize: 12,
        color: '#BDBDBD',
    },
    ticketCutoutLeft: {
        position: 'absolute',
        left: 90,
        top: -10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F7F8F9',
    },
    ticketCutoutRight: {
        position: 'absolute',
        left: 90,
        bottom: -10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F7F8F9',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 25,
        color: '#3C3C43',
        lineHeight: 24,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F7F8F9',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        marginRight: 10,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButton: {
        backgroundColor: '#00C851',
        marginLeft: 10,
    },
    rewardCode: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1C1C1E',
        backgroundColor: '#F7F8F9',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        marginBottom: 20,
        textAlign: 'center'
    },
    rewardActionButton: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#00C851',
    },
    rewardActionButtonText: {
        color: '#00C851',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#8A8A8E',
    },
});

export default RedeemScreen;

