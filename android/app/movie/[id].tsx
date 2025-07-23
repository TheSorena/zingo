import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeContext } from '@/contexts/ThemeContext';
import { Movie } from '@/types/movie';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

export default function MovieDetailScreen() {
  const { movieData } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme } = useThemeContext();
  
  if (!movieData) {
    return (
      <>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <SafeAreaView style={styles.container}>
          <ThemedView style={[
            styles.errorContainer,
            Platform.OS === 'android' && { paddingTop: Constants.statusBarHeight }
          ]}>
            <ThemedText>Movie data not found</ThemedText>
          </ThemedView>
        </SafeAreaView>
      </>
    );
  }

  const movie: Movie = JSON.parse(movieData as string);

  const handlePlayVideo = async (url: string, quality: string) => {
    // For all videos (including trailers), give user VLC/Browser/Copy options
    Alert.alert(
      `${quality === 'تیزر' ? 'Watch Trailer' : `Watch ${quality}`}`,
      'Choose how to open this video:',
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
                Alert.alert('Error', 'Cannot open video in browser');
              }
            } catch {
              Alert.alert('Error', 'Failed to open video in browser');
            }
          }
        },
        {
          text: 'Copy Link',
          onPress: async () => {
            try {
              await Clipboard.setStringAsync(url);
              Alert.alert('Success', 'Video link copied to clipboard!');
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

  const videoSources = movie.sources.filter(source => source.type !== 'mp4' || source.quality === 'تیزر');
  const trailerSource = movie.sources.find(source => source.quality === 'تیزر');

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
              <IconSymbol name="chevron.left" size={24} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Movie Details</ThemedText>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Cover Image */}
            <View style={styles.coverContainer}>
              <Image
                source={{ uri: movie.cover }}
                style={styles.coverImage}
                contentFit="cover"
              />
              <View style={styles.coverOverlay}>
                {trailerSource && (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => handlePlayVideo(trailerSource.url, trailerSource.quality || 'Trailer')}
                  >
                    <IconSymbol name="play.fill" size={32} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.content}>
              {/* Movie Info */}
              <View style={styles.movieInfo}>
                <View style={styles.posterAndDetails}>
                  <Image
                    source={{ uri: movie.image }}
                    style={styles.poster}
                    contentFit="cover"
                  />
                  
                  <View style={styles.movieDetails}>
                    <ThemedText style={styles.title}>{movie.title}</ThemedText>
                    
                    <View style={styles.ratingContainer}>
                      <View style={styles.stars}>
                        {renderStars(movie.rating)}
                      </View>
                      <ThemedText style={[
                        styles.ratingText,
                        { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                      ]}>
                        {movie.rating.toFixed(1)}/5
                      </ThemedText>
                      <ThemedText style={[
                        styles.imdbText,
                        { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                      ]}>
                        IMDB: {movie.imdb.toFixed(1)}/10
                      </ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                      <ThemedText style={[
                        styles.infoLabel,
                        { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                      ]}>Year:</ThemedText>
                      <ThemedText style={styles.infoValue}>{movie.year}</ThemedText>
                    </View>

                    {movie.duration && (
                      <View style={styles.infoRow}>
                        <ThemedText style={[
                          styles.infoLabel,
                          { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                        ]}>Duration:</ThemedText>
                        <ThemedText style={styles.infoValue}>{movie.duration}</ThemedText>
                      </View>
                    )}

                    <View style={styles.infoRow}>
                      <ThemedText style={[
                        styles.infoLabel,
                        { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                      ]}>Type:</ThemedText>
                      <ThemedText style={styles.infoValue}>{movie.type}</ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              {/* Genres */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Genres</ThemedText>
                <View style={styles.genresContainer}>
                  {movie.genres.map((genre) => (
                    <View key={genre.id} style={styles.genreTag}>
                      <ThemedText style={styles.genreText}>{genre.title}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              {/* Countries */}
              {movie.country.length > 0 && (
                <View style={styles.section}>
                  <ThemedText style={styles.sectionTitle}>Countries</ThemedText>
                  <View style={styles.countriesContainer}>
                    {movie.country.map((country) => (
                      <View key={country.id} style={styles.countryItem}>
                        <Image
                          source={{ uri: country.image }}
                          style={styles.countryFlag}
                          contentFit="cover"
                        />
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
                  {movie.description}
                </ThemedText>
              </View>

              {/* Streaming & Download Links */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Watch & Download</ThemedText>
                {videoSources.map((source) => (
                  <TouchableOpacity
                    key={source.id}
                    style={[
                      styles.sourceButton,
                      { backgroundColor: colorScheme === 'dark' ? '#333' : '#F8F9FA' },
                      source.quality === 'تیزر' && [
                        styles.trailerButton,
                        { backgroundColor: colorScheme === 'dark' ? '#2A1810' : '#FFF5F2' }
                      ]
                    ]}
                    onPress={() => handlePlayVideo(source.url, source.quality || 'Unknown')}
                  >
                    <View style={styles.sourceInfo}>
                      <IconSymbol 
                        name={source.quality === 'تیزر' ? 'play.circle' : 'tv'} 
                        size={20} 
                        color={source.quality === 'تیزر' ? '#FF6B35' : '#007AFF'} 
                      />
                      <View style={styles.sourceDetails}>
                        <ThemedText style={[
                          styles.sourceQuality,
                          source.quality === 'تیزر' && styles.trailerText
                        ]}>
                          {source.quality}
                        </ThemedText>
                        <ThemedText style={[
                          styles.sourceType,
                          { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
                        ]}>
                          Format: {source.type.toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>
                    <IconSymbol name="chevron.right" size={16} color="#888" />
                  </TouchableOpacity>
                ))}
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
  movieInfo: {
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
  movieDetails: {
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
    backgroundColor: '#007AFF',
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
    color: '#007AFF',
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
}); 