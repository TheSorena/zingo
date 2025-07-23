import { MediaCard } from '@/components/MediaCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeContext } from '@/contexts/ThemeContext';
import { SearchApiService } from '@/services/searchApi';
import { MediaItem } from '@/types/movie';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { colorScheme } = useThemeContext();
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const response = await SearchApiService.search(searchQuery.trim());
      setSearchResults(response.posters || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaPress = (item: MediaItem) => {
    if (item.type === 'serie') {
      router.push({
        pathname: '/series/[id]',
        params: { 
          id: item.id.toString(),
          seriesData: JSON.stringify(item)
        }
      });
    } else {
      router.push({
        pathname: '/movie/[id]',
        params: { 
          id: item.id.toString(),
          movieData: JSON.stringify(item)
        }
      });
    }
  };

  const renderMediaCard = ({ item }: { item: MediaItem }) => (
    <MediaCard item={item} onPress={handleMediaPress} />
  );

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#28A745" />
          <ThemedText style={styles.loadingText}>
            Searching...
          </ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#FF3B30" />
          <ThemedText style={styles.errorTitle}>
            Search Error
          </ThemedText>
          <ThemedText style={styles.errorText}>
            {error}
          </ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
            <IconSymbol name="arrow.clockwise" size={16} color="#FFF" />
            <ThemedText style={styles.retryText}>
              Try Again
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="magnifyingglass" size={48} color="#888" />
          <ThemedText style={styles.noResultsTitle}>
            No Results Found
          </ThemedText>
          <ThemedText style={styles.noResultsText}>
            Try searching with different keywords
          </ThemedText>
        </View>
      );
    }

    // Default empty state
    return (
      <View style={styles.centerContainer}>
        <IconSymbol name="magnifyingglass" size={48} color="#888" />
        <ThemedText style={styles.emptyTitle}>
          Start Searching
        </ThemedText>
        <ThemedText style={styles.emptyText}>
          Enter a movie or series name to search
        </ThemedText>
      </View>
    );
  };

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container}>
        <ThemedView style={[
          styles.container,
          Platform.OS === 'android' && { paddingTop: Constants.statusBarHeight }
        ]}>
          {/* Fixed Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <IconSymbol name="magnifyingglass" size={24} color="#28A745" />
                <View style={styles.headerTextContainer}>
                  <ThemedText style={styles.headerTitle}>
                    Search
                  </ThemedText>
                  <ThemedText style={styles.headerSubtitle}>
                    Find movies and series
                  </ThemedText>
                </View>
              </View>
              
              {/* Search Input */}
              <View style={[
                styles.searchContainer,
                { backgroundColor: colorScheme === 'dark' ? '#333' : '#F8F9FA' }
              ]}>
                <IconSymbol name="magnifyingglass" size={20} color="#888" />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: colorScheme === 'dark' ? '#FFF' : '#333' }
                  ]}
                  placeholder="Search for movies or series..."
                  placeholderTextColor="#888"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <IconSymbol name="arrow.right" size={16} color="#FFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Results Section */}
          <FlatList
            data={searchResults}
            renderItem={renderMediaCard}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            numColumns={2}
            columnWrapperStyle={searchResults.length > 0 ? styles.row : undefined}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyComponent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#28A745',
    fontSize: 24,
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  searchButton: {
    backgroundColor: '#28A745',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#28A745',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    textAlign: 'center',
  },
  noResultsText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
