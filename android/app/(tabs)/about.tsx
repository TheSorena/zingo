import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemeSelector } from '@/components/ThemeSelector';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeContext } from '@/contexts/ThemeContext';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Alert,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AboutScreen() {
  const { colorScheme } = useThemeContext();

  const appInfo = {
    name: 'CinemaPlus',
    version: '1.3.0',
    description: 'Discover and watch the latest movies and TV series with CinemaPlus. Browse through our extensive collection, search for your favorites, and enjoy high-quality streaming with multiple viewing options.',
    telegramChannel: 'https://t.me/CinemaPlusApp',
    website: 'https://cinemaplus-app.vercel.app',
  };

  const handleLinkPress = async (url: string, linkName: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${linkName}. Please check if you have the required app installed.`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${linkName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container}>
        <ThemedView style={[
          styles.container,
          Platform.OS === 'android' && { paddingTop: Constants.statusBarHeight }
        ]}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <IconSymbol name="tv" size={48} color="#007AFF" />
                </View>
                <ThemedText style={styles.appName}>
                  {appInfo.name}
                </ThemedText>
                <ThemedText style={[
                  styles.version,
                  { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                ]}>
                  Version {appInfo.version}
                </ThemedText>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  About
                </ThemedText>
                <ThemedText style={[
                  styles.description,
                  { color: colorScheme === 'dark' ? '#E0E0E0' : '#333' }
                ]}>
                  {appInfo.description}
                </ThemedText>
              </View>

              {/* Theme Selection */}
              <View style={styles.section}>
                <ThemeSelector />
              </View>

              {/* Links */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  Connect With Us
                </ThemedText>
                
                <TouchableOpacity
                  style={[
                    styles.linkButton,
                    styles.telegramButton,
                    { backgroundColor: colorScheme === 'dark' ? '#2C5282' : '#4299E1' }
                  ]}
                  onPress={() => handleLinkPress(appInfo.telegramChannel, 'Telegram Channel')}
                >
                  <IconSymbol name="paperplane.fill" size={20} color="#FFF" />
                  <ThemedText style={styles.linkButtonText}>
                    Join Our Telegram Channel
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={16} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.linkButton,
                    styles.websiteButton,
                    { backgroundColor: colorScheme === 'dark' ? '#4A5568' : '#718096' }
                  ]}
                  onPress={() => handleLinkPress(appInfo.website, 'Website')}
                >
                  <IconSymbol name="chevron.left.forwardslash.chevron.right" size={20} color="#FFF" />
                  <ThemedText style={styles.linkButtonText}>
                    Visit Our Website
                  </ThemedText>
                  <IconSymbol name="chevron.right" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* App Info */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>
                  App Information
                </ThemedText>
                <View style={styles.infoGrid}>
                  <View style={[
                    styles.infoCard,
                    { backgroundColor: colorScheme === 'dark' ? '#333' : '#F8F9FA' }
                  ]}>
                    <IconSymbol name="star.fill" size={24} color="#007AFF" />
                    <ThemedText style={styles.infoCardTitle}>
                      Version
                    </ThemedText>
                    <ThemedText style={[
                      styles.infoCardValue,
                      { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                    ]}>
                      {appInfo.version}
                    </ThemedText>
                  </View>

                  <View style={[
                    styles.infoCard,
                    { backgroundColor: colorScheme === 'dark' ? '#333' : '#F8F9FA' }
                  ]}>
                    <IconSymbol name="tv" size={24} color="#28A745" />
                    <ThemedText style={styles.infoCardTitle}>
                      Platform
                    </ThemedText>
                    <ThemedText style={[
                      styles.infoCardValue,
                      { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                    ]}>
                      {Platform.OS === 'ios' ? 'iOS' : 'Android'}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <ThemedText style={[
                  styles.footerText,
                  { color: colorScheme === 'dark' ? '#666' : '#999' }
                ]}>
                  Made with ❤️ for movie lovers
                </ThemedText>
                <ThemedText style={[
                  styles.footerText,
                  { color: colorScheme === 'dark' ? '#666' : '#999' }
                ]}>
                  © 2025 {appInfo.name}
                </ThemedText>
              </View>
            </View>
          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF',
  },
  version: {
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  telegramButton: {
    // Telegram blue color handled by backgroundColor prop
  },
  websiteButton: {
    // Website gray color handled by backgroundColor prop
  },
  linkButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCardValue: {
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 