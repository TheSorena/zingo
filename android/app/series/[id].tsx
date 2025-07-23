import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeContext } from '@/contexts/ThemeContext';
import { SeasonsApiService } from '@/services/seasonsApi';
import { Episode, Season, Series } from '@/types/movie';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SeriesDetailScreen() {
  const { seriesData } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [seasonsError, setSeasonsError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [showSeasonPicker, setShowSeasonPicker] = useState(false);
  
  const fetchSeasons = useCallback(async () => {
    if (!seriesData) return;
    
    const series: Series = JSON.parse(seriesData as string);
    setLoadingSeasons(true);
    setSeasonsError(null);
    try {
      const seasonsData = await SeasonsApiService.getSeasons(series.id);
      setSeasons(seasonsData);
      if (seasonsData.length > 0) {
        setSelectedSeason(seasonsData[0]); // Select first season by default
      }
    } catch (error) {
      setSeasonsError(error instanceof Error ? error.message : 'Failed to load episodes');
    } finally {
      setLoadingSeasons(false);
    }
  }, [seriesData]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);
  
  if (!seriesData) {
    return (
      <>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <SafeAreaView style={styles.container}>
          <ThemedView style={[
            styles.errorContainer,
            Platform.OS === 'android' && { paddingTop: Constants.statusBarHeight }
          ]}>
            <ThemedText>Series data not found</ThemedText>
          </ThemedView>
        </SafeAreaView>
      </>
    );
  }

  const series: Series = JSON.parse(seriesData as string);

  const handlePlayVideo = async (episode: Episode) => {
    if (!episode.sources || episode.sources.length === 0) {
      Alert.alert('No Sources', 'No video sources available for this episode');
      return;
    }

    const source = episode.sources[0]; // Use first available source
    const url = source.url;

    // For episodes, give user VLC/Browser/Copy options
    Alert.alert(
      episode.title,
      'Choose how to open this episode:',
      [
        {
          text: 'Open with VLC',
          onPress: async () => {
            try {
              // Try to open with VLC using intent or URL scheme
              const vlcUrl = `vlc://${url}`;
              const canOpenVLC = await Linking.canOpenURL(vlcUrl);
              
              if (canOpenVLC) {
                await Linking.openURL(vlcUrl);
              } else {
                // Fallback: try to open VLC via package name (Android)
                const vlcIntent = `intent:${url}#Intent;package=org.videolan.vlc;type=video/*;end`;
                const canOpenIntent = await Linking.canOpenURL(vlcIntent);
                
                if (canOpenIntent) {
                  await Linking.openURL(vlcIntent);
                } else {
                  Alert.alert(
                    'VLC Not Found', 
                    'VLC Player is not installed. Please install VLC or choose browser option.',
                    [
                      {
                        text: 'Install VLC',
                        onPress: () => {
                          const storeUrl = Platform.OS === 'ios' 
                            ? 'https://apps.apple.com/app/vlc-media-player/id650377962'
                            : 'https://play.google.com/store/apps/details?id=org.videolan.vlc';
                          Linking.openURL(storeUrl);
                        }
                      },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }
              }
            } catch {
              Alert.alert('Error', 'Failed to open VLC Player');
            }
          }
        },
        {
          text: 'Open in Browser',
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert('Error', 'Cannot open episode in browser');
              }
            } catch {
              Alert.alert('Error', 'Failed to open episode in browser');
            }
          }
        },
        {
          text: 'Copy Link',
          onPress: async () => {
            try {
              await Clipboard.setStringAsync(url);
              Alert.alert('Success', 'Episode link copied to clipboard!');
            } catch {
              Alert.alert('Error', 'Failed to copy link');
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <IconSymbol key={i} name="star.fill" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <IconSymbol key="half" name="star.leadinghalf.filled" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <IconSymbol key={`empty-${i}`} name="star" size={16} color="#DDD" />
      );
    }

    return stars;
  };

  const trailerSource = series.sources?.find(source => source.quality === 'تیزر');

  const handlePlayTrailer = async () => {
    if (!trailerSource) return;
    
    Alert.alert(
      'Watch Trailer',
      'Choose how to open this trailer:',
      [
        {
          text: 'Open with VLC',
          onPress: async () => {
            try {
              // Try to open with VLC using intent or URL scheme
              const vlcUrl = `vlc://${trailerSource.url}`;
              const canOpenVLC = await Linking.canOpenURL(vlcUrl);
              
              if (canOpenVLC) {
                await Linking.openURL(vlcUrl);
              } else {
                // Fallback: try to open VLC via package name (Android)
                const vlcIntent = `intent:${trailerSource.url}#Intent;package=org.videolan.vlc;type=video/*;end`;
                const canOpenIntent = await Linking.canOpenURL(vlcIntent);
                
                if (canOpenIntent) {
                  await Linking.openURL(vlcIntent);
                } else {
                  Alert.alert(
                    'VLC Not Found', 
                    'VLC Player is not installed. Please install VLC or choose browser option.',
                    [
                      {
                        text: 'Install VLC',
                        onPress: () => {
                          const storeUrl = Platform.OS === 'ios' 
                            ? 'https://apps.apple.com/app/vlc-media-player/id650377962'
                            : 'https://play.google.com/store/apps/details?id=org.videolan.vlc';
                          Linking.openURL(storeUrl);
                        }
                      },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }
              }
            } catch {
              Alert.alert('Error', 'Failed to open VLC Player');
            }
          }
        },
        {
          text: 'Open in Browser',
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(trailerSource.url);
              if (supported) {
                await Linking.openURL(trailerSource.url);
              } else {
                Alert.alert('Error', 'Cannot open trailer in browser');
              }
            } catch {
              Alert.alert('Error', 'Failed to open trailer in browser');
            }
          }
        },
        {
          text: 'Copy Link',
          onPress: async () => {
            try {
              await Clipboard.setStringAsync(trailerSource.url);
              Alert.alert('Success', 'Trailer link copied to clipboard!');
            } catch {
              Alert.alert('Error', 'Failed to copy link');
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleSeasonSelect = (season: Season) => {
    setSelectedSeason(season);
    setShowSeasonPicker(false);
  };

  const renderSeasonPicker = () => (
    <Modal
      visible={showSeasonPicker}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSeasonPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          { backgroundColor: colorScheme === 'dark' ? '#1F1F1F' : '#FFF' }
        ]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Select Season</ThemedText>
            <TouchableOpacity 
              onPress={() => setShowSeasonPicker(false)}
              style={styles.closeButton}
            >
              <IconSymbol name="xmark.circle.fill" size={24} color="#888" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.seasonsScrollView}>
            {seasons.map((season) => (
              <TouchableOpacity
                key={season.id}
                style={[
                  styles.seasonOption,
                  {
                    backgroundColor: selectedSeason?.id === season.id 
                      ? (colorScheme === 'dark' ? '#2C5282' : '#007AFF')
                      : (colorScheme === 'dark' ? '#333' : '#F8F9FA'),
                  }
                ]}
                onPress={() => handleSeasonSelect(season)}
              >
                <ThemedText style={[
                  styles.seasonOptionText,
                  {
                    color: selectedSeason?.id === season.id 
                      ? '#FFF' 
                      : (colorScheme === 'dark' ? '#FFF' : '#333')
                  }
                ]}>
                  {season.title}
                </ThemedText>
                {selectedSeason?.id === season.id && (
                  <IconSymbol name="star.fill" size={16} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container}>
        <ThemedView style={[
          styles.container,
          Platform.OS === 'android' && { paddingTop: Constants.statusBarHeight }
        ]}>
          {/* Header with back button */}
          <View style={[
            styles.header,
            { borderBottomColor: colorScheme === 'dark' ? '#444' : '#E0E0E0' }
          ]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color="#FF6B6B" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Series Details</ThemedText>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Cover Image */}
            <View style={styles.coverContainer}>
              <Image
                source={{ uri: series.cover }}
                style={styles.coverImage}
                contentFit="cover"
              />
              <View style={styles.coverOverlay}>
                {trailerSource && (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayTrailer}
                  >
                    <IconSymbol name="play.fill" size={32} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.content}>
              {/* Series Info */}
              <View style={styles.seriesInfo}>
                <View style={styles.posterAndDetails}>
                  <Image
                    source={{ uri: series.image }}
                    style={styles.poster}
                    contentFit="cover"
                  />
                  
                  <View style={styles.seriesDetails}>
                    <ThemedText style={styles.title}>{series.title}</ThemedText>
                    
                    <View style={styles.ratingContainer}>
                      <View style={styles.stars}>
                        {renderStars(series.rating)}
                      </View>
                      <ThemedText style={[
                        styles.ratingText,
                        { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                      ]}>
                        {series.rating.toFixed(1)}/5
                      </ThemedText>
                      <ThemedText style={[
                        styles.imdbText,
                        { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                      ]}>
                        IMDB: {series.imdb.toFixed(1)}/10
                      </ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                      <ThemedText style={[
                        styles.infoLabel,
                        { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                      ]}>Year:</ThemedText>
                      <ThemedText style={styles.infoValue}>{series.year}</ThemedText>
                    </View>

                    {series.duration && (
                      <View style={styles.infoRow}>
                        <ThemedText style={[
                          styles.infoLabel,
                          { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                        ]}>Seasons:</ThemedText>
                        <ThemedText style={styles.infoValue}>{series.duration}</ThemedText>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <ThemedText style={[
                        styles.infoLabel,
                        { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                      ]}>Type:</ThemedText>
                      <ThemedText style={styles.infoValue}>TV Series</ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              {/* Genres */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Genres</ThemedText>
                <View style={styles.genresContainer}>
                  {series.genres.map((genre) => (
                    <View key={genre.id} style={styles.genreTag}>
                      <ThemedText style={styles.genreText}>{genre.title}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              {/* Countries */}
              {series.country.length > 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Countries</ThemedText>
                  <View style={styles.countriesContainer}>
                    {series.country.map((country) => (
                      <View key={country.id} style={styles.countryItem}>
                        {country.image && (
                          <Image
                            source={{ uri: country.image }}
                            style={styles.countryFlag}
                            contentFit="cover"
                          />
                        )}
                        <ThemedText style={styles.countryText}>{country.title}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Description */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Description</ThemedText>
                <ThemedText 
                  style={[
                    styles.description,
                    { color: colorScheme === 'dark' ? '#E0E0E0' : '#333' }
                  ]}
                >
                  {series.description}
                </ThemedText>
              </View>

              {/* Episodes */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Episodes</ThemedText>
                
                {loadingSeasons ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B6B" />
                    <ThemedText style={styles.loadingText}>Loading episodes...</ThemedText>
                  </View>
                ) : seasonsError ? (
                  <View style={styles.errorContainer}>
                    <IconSymbol name="exclamationmark.triangle" size={24} color="#FF3B30" />
                    <ThemedText style={styles.errorText}>{seasonsError}</ThemedText>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchSeasons}>
                      <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : seasons.length > 0 ? (
                  <>
                    {/* Season Selector */}
                    {seasons.length > 1 && (
                      <View style={styles.seasonSelector}>
                        <ThemedText style={styles.seasonSelectorLabel}>Select Season:</ThemedText>
                        <TouchableOpacity
                          style={[
                            styles.seasonDropdown,
                            { 
                              backgroundColor: colorScheme === 'dark' ? '#333' : '#F0F0F0',
                              borderColor: colorScheme === 'dark' ? '#555' : '#E0E0E0'
                            }
                          ]}
                          onPress={() => setShowSeasonPicker(true)}
                        >
                          <ThemedText style={[
                            styles.seasonDropdownText,
                            { color: colorScheme === 'dark' ? '#FFF' : '#333' }
                          ]}>
                            {selectedSeason?.title || 'Select Season'}
                          </ThemedText>
                          <IconSymbol name="chevron.down" size={16} color="#888" />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Episodes List */}
                    {selectedSeason && (
                      <View style={styles.episodesContainer}>
                        {selectedSeason.episodes.map((episode, index) => (
                          <TouchableOpacity
                            key={episode.id}
                            style={[
                              styles.episodeButton,
                              { backgroundColor: colorScheme === 'dark' ? '#333' : '#F8F9FA' }
                            ]}
                            onPress={() => handlePlayVideo(episode)}
                          >
                            <View style={styles.episodeInfo}>
                              <View style={styles.episodeNumber}>
                                <ThemedText style={styles.episodeNumberText}>
                                  {index + 1}
                                </ThemedText>
                              </View>
                              <View style={styles.episodeDetails}>
                                <ThemedText style={styles.episodeTitle}>
                                  {episode.title}
                                </ThemedText>
                                {episode.description && (
                                  <ThemedText style={[
                                    styles.episodeDescription,
                                    { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                                  ]} numberOfLines={2}>
                                    {episode.description}
                                  </ThemedText>
                                )}
                              </View>
                            </View>
                            <IconSymbol name="play.circle" size={24} color="#FF6B6B" />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.noEpisodesContainer}>
                    <IconSymbol name="tv" size={48} color="#888" />
                    <ThemedText style={styles.noEpisodesText}>No episodes available</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
          
          {/* Season Picker Modal */}
          {renderSeasonPicker()}
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    padding: 8,
  },
  content: {
    padding: 16,
  },
  seriesInfo: {
    marginBottom: 24,
  },
  posterAndDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  seriesDetails: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    marginBottom: 2,
  },
  imdbText: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    width: 70,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  countriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryFlag: {
    width: 24,
    height: 16,
    borderRadius: 2,
  },
  countryText: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  trailerButton: {
    borderColor: '#FF6B35',
    borderWidth: 1,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourceDetails: {
    flex: 1,
  },
  sourceQuality: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  trailerText: {
    color: '#FF6B35',
  },
  sourceType: {
    fontSize: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#888',
  },
  errorText: {
    marginTop: 10,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FF6B6B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  seasonSelector: {
    marginBottom: 16,
  },
  seasonSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#FF6B6B',
  },
  seasonDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  seasonDropdownText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  episodesContainer: {
    marginTop: 10,
  },
  episodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  episodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  episodeNumber: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  episodeDetails: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  episodeDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  noEpisodesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEpisodesText: {
    marginTop: 10,
    color: '#888',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  seasonsScrollView: {
    maxHeight: 400,
  },
  seasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  seasonOptionText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
}); 