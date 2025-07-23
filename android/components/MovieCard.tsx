import { Movie } from '@/types/movie';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export function MovieCard({ movie, onPress }: MovieCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <IconSymbol key={i} name="star.fill" size={12} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <IconSymbol key="half" name="star.leadinghalf.filled" size={12} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <IconSymbol key={`empty-${i}`} name="star" size={12} color="#DDD" />
      );
    }

    return stars;
  };

  return (
    <TouchableOpacity onPress={() => onPress(movie)}>
      <ThemedView style={styles.card}>
        <Image
          source={{ uri: movie.image }}
          style={styles.poster}
          placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          contentFit="cover"
        />
        
        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>
            {movie.title}
          </ThemedText>
          
          <View style={styles.details}>
            <ThemedText style={styles.year}>{movie.year}</ThemedText>
            <View style={styles.rating}>
              {renderStars(movie.rating)}
              <ThemedText style={styles.ratingText}>
                {movie.rating.toFixed(1)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.genres}>
            {movie.genres.slice(0, 2).map((genre, index) => (
              <View key={genre.id} style={styles.genreTag}>
                <ThemedText style={styles.genreText}>
                  {genre.title}
                </ThemedText>
              </View>
            ))}
          </View>

          {movie.duration && (
            <View style={styles.duration}>
              <IconSymbol name="clock" size={12} color="#888" />
              <ThemedText style={styles.durationText}>
                {movie.duration}
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  poster: {
    width: '100%',
    height: CARD_WIDTH * 1.5, // 3:2 aspect ratio
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  year: {
    fontSize: 12,
    color: '#888',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#888',
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  genreTag: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  genreText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '500',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#888',
  },
}); 