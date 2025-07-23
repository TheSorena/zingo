import { useThemeContext } from '@/contexts/ThemeContext';
import { ThemeMode } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';

interface ThemeOption {
  mode: ThemeMode;
  label: string;
  icon: 'info' | 'star.fill' | 'pause.fill';
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    mode: 'system',
    label: 'System',
    icon: 'info',
    description: 'Follow system settings'
  },
  {
    mode: 'light',
    label: 'Light',
    icon: 'star.fill',
    description: 'Light appearance'
  },
  {
    mode: 'dark',
    label: 'Dark',
    icon: 'pause.fill',
    description: 'Dark appearance'
  }
];

export function ThemeSelector() {
  const { themeMode, colorScheme, changeTheme } = useThemeContext();

  const handleThemeChange = async (newTheme: ThemeMode) => {
    await changeTheme(newTheme);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Theme</ThemedText>
      <ThemedText style={[
        styles.subtitle,
        { color: colorScheme === 'dark' ? '#B0B0B0' : '#888' }
      ]}>
        Choose your preferred theme
      </ThemedText>
      
      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.optionButton,
              {
                borderColor: colorScheme === 'dark' ? '#333' : '#E0E0E0',
                backgroundColor: themeMode === option.mode 
                  ? (colorScheme === 'dark' ? '#2C5282' : '#007AFF')
                  : (colorScheme === 'dark' ? '#1F1F1F' : '#F8F9FA')
              }
            ]}
            onPress={() => handleThemeChange(option.mode)}
          >
            <View style={styles.optionContent}>
              <IconSymbol 
                name={option.icon} 
                size={24} 
                color={themeMode === option.mode ? '#FFF' : (colorScheme === 'dark' ? '#B0B0B0' : '#007AFF')}
              />
              <View style={styles.optionText}>
                <ThemedText style={[
                  styles.optionLabel,
                  { 
                    color: themeMode === option.mode 
                      ? '#FFF' 
                      : (colorScheme === 'dark' ? '#FFF' : '#333')
                  }
                ]}>
                  {option.label}
                </ThemedText>
                <ThemedText style={[
                  styles.optionDescription,
                  { 
                    color: themeMode === option.mode 
                      ? '#E0E0E0' 
                      : (colorScheme === 'dark' ? '#888' : '#666')
                  }
                ]}>
                  {option.description}
                </ThemedText>
              </View>
              {themeMode === option.mode && (
                <IconSymbol 
                  name="star.fill" 
                  size={20} 
                  color="#FFF"
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
  },
}); 