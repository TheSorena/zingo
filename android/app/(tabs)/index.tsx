import { MovieCard } from '@/components/MovieCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useMovies } from '@/hooks/useMovies';
import { Movie } from '@/types/movie';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

export default function HomeScreen() {
  const {
    movies,
    loading,
    error,
    refreshing,
    hasMorePages,
    loadMoreMovies,
    refreshMovies,
    retry,
  } = useMovies();
  
  const router = useRouter();

  const handleMoviePress = (movie: Movie) => {
    router.push({
      pathname: '/movie/[id]',
      params: { 
        id: movie.id.toString(),
        movieData: JSON.stringify(movie)
      }
    });
  };

  const renderMovieCard = ({ item }: { item: Movie }) => (
    <MovieCard movie={item} onPress={handleMoviePress} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <IconSymbol name="tv" size={24} color="#007AFF" />
        <View style={styles.headerTextContainer}>
          <ThemedText style={styles.headerTitle}>
            CinemaPlus
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Discover the latest movies
          </ThemedText>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!hasMorePages) {
      return (
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            You&apos;ve reached the end!
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <ThemedText style={styles.footerText}>
          Loading more movies...
        </ThemedText>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>
            Loading movies...
          </ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#FF3B30" />
          <ThemedText style={styles.errorTitle}>
            Oops! Something went wrong
          </ThemedText>
          <ThemedText style={styles.errorText}>
            {error}
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <IconSymbol name="arrow.clockwise" size={16} color="#FFF" />
            <ThemedText style={styles.retryText}>
              Tap to retry
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <ThemedView style={[
          styles.container,
          Platform.OS === 'android' && { paddingTop: Constants.statusBarHeight }
        ]}>
          <FlatList
            data={movies}
            renderItem={renderMovieCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={movies.length > 0 ? renderFooter : null}
            ListEmptyComponent={renderEmptyComponent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshMovies}
                tintColor="#007AFF"
                colors={['#007AFF']}
              />
            }
            onEndReached={loadMoreMovies}
            onEndReachedThreshold={0.1}
            showsVerticalScrollIndicator={false}
          />
        </ThemedView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#007AFF',
    fontSize: 24,
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    color: '#888',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    textAlign: 'center',
  },
  errorText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
