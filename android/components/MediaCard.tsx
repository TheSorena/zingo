import { MediaItem } from '@/types/movie';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { IconSymbol } from './ui/IconSymbol';

interface MediaCardProps {
  item: MediaItem;
  onPress: (item: MediaItem) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export function MediaCard({ item, onPress }: MediaCardProps) {
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
    <TouchableOpacity onPress={() => onPress(item)}>
      <ThemedView style={styles.card}>
        <Image
          source={{ uri: item.image }}
          style={styles.poster}
          placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          contentFit="cover"
        />
        
        <View style={styles.content}>
          <ThemedText type="defaultSemiBold" numberOfLines={2} style={styles.title}>
            {item.title}
          </ThemedText>
          
          <View style={styles.details}>
            <ThemedText style={styles.year}>{item.year}</ThemedText>
            <View style={styles.rating}>
              {renderStars(item.rating)}
              <ThemedText style={styles.ratingText}>
                {item.rating.toFixed(1)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.genres}>
            {item.genres.slice(0, 2).map((genre, index) => (
              <View key={genre.id} style={styles.genreTag}>
                <ThemedText style={styles.genreText}>
                  {genre.title}
                </ThemedText>
              </View>
            ))}
          </View>

          {item.duration && (
            <View style={styles.duration}>
              <IconSymbol name="clock" size={12} color="#888" />
              <ThemedText style={styles.durationText}>
                {item.duration}
              </ThemedText>
            </View>
          )}

          {/* Show type indicator */}
          <View style={styles.typeIndicator}>
            <IconSymbol 
              name={item.type === 'serie' ? 'tv' : 'film'} 
              size={12} 
              color="#007AFF" 
            />
            <ThemedText style={styles.typeText}>
              {item.type === 'serie' ? 'Series' : 'Movie'}
            </ThemedText>
          </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 4,
    minHeight: 34, // 2 lines minimum
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
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    color: '#888',
    marginLeft: 4,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  genreTag: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  genreText: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '500',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  durationText: {
    fontSize: 10,
    color: '#888',
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
}); 