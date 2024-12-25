import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Feather } from '@expo/vector-icons';

const NoisePlayer = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNoise, setSelectedNoise] = useState(null);
  const [showNoiseList, setShowNoiseList] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [noiseFiles, setNoiseFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRepeatOn, setIsRepeatOn] = useState(true);
  const [isShuffleOn, setIsShuffleOn] = useState(false);

  const GITHUB_API_URL = 'https://api.github.com/repos/dantealegria1/Ruido_Blanco/contents/Noises';
  const RAW_CONTENT_BASE_URL = 'https://raw.githubusercontent.com/dantealegria1/Ruido_Blanco/main/Noises/';

  useEffect(() => {
    fetchNoiseFiles();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchNoiseFiles = async () => {
    try {
      const response = await fetch(GITHUB_API_URL);
      const data = await response.json();
      
      const mp3Files = data
        .filter(file => file.name.toLowerCase().endsWith('.mp3'))
        .map(file => ({
          name: file.name.replace('.mp3', ''),
          url: `${RAW_CONTENT_BASE_URL}${encodeURIComponent(file.name)}`
        }));
      
      setNoiseFiles(mp3Files);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching noise files:', error);
      setIsLoading(false);
    }
  };

  const loadAndPlaySound = async (noiseUrl) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: noiseUrl },
        { shouldPlay: true, isLooping: isRepeatOn }
      );
      
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkipForward = async () => {
    if (noiseFiles.length > 0) {
      const currentIndex = noiseFiles.findIndex(noise => noise.name === selectedNoise);
      const nextIndex = (currentIndex + 1) % noiseFiles.length;
      const nextNoise = noiseFiles[nextIndex];
      setSelectedNoise(nextNoise.name);
      await loadAndPlaySound(nextNoise.url);
    }
  };

  const handleSkipBack = async () => {
    if (noiseFiles.length > 0) {
      const currentIndex = noiseFiles.findIndex(noise => noise.name === selectedNoise);
      const prevIndex = (currentIndex - 1 + noiseFiles.length) % noiseFiles.length;
      const prevNoise = noiseFiles[prevIndex];
      setSelectedNoise(prevNoise.name);
      await loadAndPlaySound(prevNoise.url);
    }
  };

  const handleNoiseSelection = async (noise) => {
    setSelectedNoise(noise.name);
    setShowNoiseList(false);
    await loadAndPlaySound(noise.url);
  };

  const togglePlayerVisibility = () => {
    setIsPlayerVisible(!isPlayerVisible);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={styles.topButtons}>
        <TouchableOpacity 
          style={[styles.utilityButton, isDarkMode && styles.utilityButtonDark]} 
          onPress={togglePlayerVisibility}
        >
          <Feather name={isPlayerVisible ? "eye-off" : "eye"} size={20} color={isDarkMode ? "#fff" : "#666"} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.utilityButton, isDarkMode && styles.utilityButtonDark]} 
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          <Feather name={isDarkMode ? "sun" : "moon"} size={20} color={isDarkMode ? "#fff" : "#666"} />
        </TouchableOpacity>
      </View>

      {isPlayerVisible && (
        <View 
          style={[
            styles.playerContainer, 
            isDarkMode && styles.playerContainerDark,
          ]}
        >
          {selectedNoise && (
            <View style={styles.songInfo}>
              <Text style={[styles.songTitle, isDarkMode && styles.textDark]}>{selectedNoise}</Text>
            </View>
          )}
          
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.controlButton, isDarkMode && styles.controlButtonDark]} 
              onPress={() => {
                setIsRepeatOn(!isRepeatOn);
                if (sound) {
                  sound.setIsLoopingAsync(!isRepeatOn);
                }
              }}
            >
              <Feather name="repeat" size={20} color={isRepeatOn ? "#4a9f58" : (isDarkMode ? "#fff" : "#666")} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, isDarkMode && styles.controlButtonDark]} 
              onPress={handleSkipBack}
            >
              <Feather name="skip-back" size={20} color={isDarkMode ? "#fff" : "#666"} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
              <Feather name={isPlaying ? 'pause' : 'play'} size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, isDarkMode && styles.controlButtonDark]} 
              onPress={handleSkipForward}
            >
              <Feather name="skip-forward" size={20} color={isDarkMode ? "#fff" : "#666"} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, isDarkMode && styles.controlButtonDark]} 
              onPress={() => setIsShuffleOn(!isShuffleOn)}
            >
              <Feather name="shuffle" size={20} color={isShuffleOn ? "#4a9f58" : (isDarkMode ? "#fff" : "#666")} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.libraryButton, isDarkMode && styles.libraryButtonDark]}
        onPress={() => setShowNoiseList(true)}
      >
        <Feather name="music" size={20} color={isDarkMode ? "#fff" : "#666"} />
      </TouchableOpacity>

      <Modal
        visible={showNoiseList}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>Noise Library</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowNoiseList(false)}
              >
                <Feather name="x" size={24} color={isDarkMode ? "#fff" : "#666"} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.list}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={isDarkMode ? "#fff" : "#666"} />
                  <Text style={[styles.loadingText, isDarkMode && styles.textDark]}>
                    Loading noise files...
                  </Text>
                </View>
              ) : (
                noiseFiles.map((noise, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.musicItem,
                      isDarkMode && styles.musicItemDark,
                      selectedNoise === noise.name && 
                      (isDarkMode ? styles.selectedMusicDark : styles.selectedMusic),
                    ]}
                    onPress={() => handleNoiseSelection(noise)}
                  >
                    <Text style={[styles.musicName, isDarkMode && styles.textDark]}>
                      {noise.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  topButtons: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  utilityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  utilityButtonDark: {
    backgroundColor: '#333',
  },
  playerContainer: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  playerContainerDark: {
    backgroundColor: '#222',
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  songTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  artistName: {
    fontSize: 14,
    color: '#666',
  },
  textDark: {
    color: '#fff',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDark: {
    backgroundColor: '#333',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4a9f58',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  libraryButton: {
    position: 'absolute',
    bottom: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  libraryButtonDark: {
    backgroundColor: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainerDark: {
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    height: '70%',
  },
  modalContentDark: {
    backgroundColor: '#222',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  list: {
    width: '100%',
  },
  musicItem: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  musicItemDark: {
    backgroundColor: '#333',
  },
  selectedMusic: {
    backgroundColor: '#e8f5ea',
  },
  selectedMusicDark: {
    backgroundColor: '#2d4731',
  },
  musicName: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default NoisePlayer;
