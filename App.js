import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Audio } from 'expo-av';
import { Feather } from '@expo/vector-icons';

import Constants from 'expo-constants';
const ACCESS_TOKEN = 'sl.CDIup4XW3XBsz0vFielGyEFfe_YWBNGTpoU7YxLBrsFwB3xuRCiE4jgxFRjciMFQImzRv_gGs5XnMIs8N_5OwZygPAGPtws0eoskU2kmV3W9yQgdaU-m4AKHbw7BhYsu54mS6DvUHITd'

const App = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicFiles, setMusicFiles] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [showMusicList, setShowMusicList] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPomodoro, setShowPomodoro] = useState(false); // New state for Pomodoro
  const [showInfo, setShowInfo] = useState(false); // New state for Info modal
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // Default 25-minute Pomodoro

  useEffect(() => {
    const fetchMusicFiles = async () => {
      try {
        const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ path: '' }),
        });

        if (!response.ok) throw new Error('Failed to fetch music files');

        const data = await response.json();
        const mp3Files = data.entries.filter(
          (file) => file['.tag'] === 'file' && file.name.endsWith('.mp3')
        );
        setMusicFiles(mp3Files);
      } catch (error) {
        console.error('Error fetching music files:', error);
      }
    };

    fetchMusicFiles();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const togglePlayerVisibility = () => {
    setIsPlayerVisible(!isPlayerVisible);
  };

  const playSound = async (path, index) => {
    try {
      if (sound) await sound.unloadAsync();

      const response = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      });

      const linkData = await response.json();
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: linkData.link },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      setCurrentIndex(index);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const onPlaybackStatusUpdate = async (status) => {
    if (status.didJustFinish) {
      if (isRepeatOn) {
        await playSound(musicFiles[currentIndex].path_lower, currentIndex);
      } else {
        handleSkipForward();
      }
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

  const handleSkipForward = () => {
    let nextIndex;
    if (isShuffleOn) {
      nextIndex = Math.floor(Math.random() * musicFiles.length);
    } else {
      nextIndex = (currentIndex + 1) % musicFiles.length;
    }
    const nextSong = musicFiles[nextIndex];
    setSelectedMusic(nextSong.name.replace('.mp3', ''));
    playSound(nextSong.path_lower, nextIndex);
  };

  const handleSkipBack = () => {
    let prevIndex;
    if (isShuffleOn) {
      prevIndex = Math.floor(Math.random() * musicFiles.length);
    } else {
      prevIndex = (currentIndex - 1 + musicFiles.length) % musicFiles.length;
    }
    const prevSong = musicFiles[prevIndex];
    setSelectedMusic(prevSong.name.replace('.mp3', ''));
    playSound(prevSong.path_lower, prevIndex);
  };

  const handleMusicSelection = (music, index) => {
    setSelectedMusic(music.name.replace('.mp3', ''));
    playSound(music.path_lower, index);
    setShowMusicList(false);
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
          {selectedMusic && (
            <View style={styles.songInfo}>
              <Text style={[styles.songTitle, isDarkMode && styles.textDark]}>{selectedMusic}</Text> 
            </View>
          )}
          
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.controlButton, isDarkMode && styles.controlButtonDark]} 
              onPress={() => setIsRepeatOn(!isRepeatOn)}
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
        onPress={() => setShowMusicList(true)}
      >
        <Feather name="music" size={20} color={isDarkMode ? "#fff" : "#666"} />
      </TouchableOpacity>

      <Modal
        visible={showMusicList}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && styles.textDark]}>Music Library</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowMusicList(false)}
              >
                <Feather name="x" size={24} color={isDarkMode ? "#fff" : "#666"} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.list}>
              {musicFiles.map((music, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.musicItem,
                    isDarkMode && styles.musicItemDark,
                    selectedMusic === music.name.replace('.mp3', '') && 
                    (isDarkMode ? styles.selectedMusicDark : styles.selectedMusic),
                  ]}
                  onPress={() => handleMusicSelection(music, index)}
                >
                  <Text style={[styles.musicName, isDarkMode && styles.textDark]}>
                    {music.name.replace('.mp3', '')}
                  </Text>
                </TouchableOpacity>
              ))}
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
});

export default App
