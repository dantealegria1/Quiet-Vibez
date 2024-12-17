import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

// Define the access token for Dropbox API
const ACCESS_TOKEN = 'sl.u.AFZIbtG7HTQfV5foGXYUhqFuh7dE9L4j8nAy8pG_Rl1xnSDK0Ary77Dpc4WPXlflr1H-Q1dWuWbl-58UVAAPZRY-y7uTyjKYjAcNZD6irZteEgb9Utz3CrTwiX3GipRetVymH6TvCx0Yfvs5_B0A592gqaOkbK0NpOrFCHhqV7a-HO0Ojr7C0SgXOet02TugvMNhG8NOKodi-XdXmAekAV2VU0F8VDZmzomCGA-w2IrcvSgrHIK0MqtPmNRvdNHTj0JlyxhuMzEyWyP0gatNPKaypRKJih3g3VWL8m8gjTg79h9bxDPBT8dUSmlLISp4Ic9kw_-mzmtkmHGGFvrHBXKF1J8N1NgLeX_6NRLRFYbD63NcsXOhBs9eTaZHy53vkY8XBlqjQO6jdCJ7pZhnzc5GM5yW-Vh1AH39daRf3vsGmGfYt3r_sC4aJx3tWEZJ9GiNZ1aRatHAhDw065CpHLpZLGUVkiT7rXCMUPTc2BXDNINgrCJMyNwhkjTDj-Ia302C76Bz1QEyTcYTK_85apeBM4dcYsfDgQT6ecwo-YWjS7simL1W3h2LZUl7RHJwiiFwL82dUn6m5EpENQkyXSnue6kTvPpPFfg8JWbyHgrxUgDj8MWbDqDReqKkvWcu4PqpxbJo-rhGUG0gmko1CmH5CgrYacTRvsXpjKJAY-itvvY1YE7PszpIPqMqJB1YN42rwFPIud9fk2KeQiSH5sXp-R4bT2sR3VLPXWs42Hmd3bIX6iUm2uqZfxYC2zwSu49rKUkeSHvWbViVQVyL7h7pm2JnmYZs2w1FjPIl0cev-9mZ415cv4eFS1hzSqZAnFfh_KKlQ8r70rwVEazyaZvPCxtEDa031D1ZkwCNK1FqgdTocdcENV8OVnJAGy404IJoh7TqeyS0xIuJ6FEbZnC_9LfrRReG0FLK62dn4W3L3OG-Yetg_GCiJ8XEbKlbwI3Ao9NZdQxVN4iUXQD7G6zvCbb2mzWRa7MaEA3LGJ8jOxQ6WMQUFWJCX2Glq9fsMqKsowPEE7JeWD8hZ7izi9xc9Zlm69h3SZvzqPPP2ey7bB4mqGG0HsjnxAhrHcvu9nt3XFd3Xom-r19sUhFqhwGOqeDs9Iv0vO40UXzFBBwxhpCJzVlA2CHWcVJf3A0RnI3R3kBxwUEG9v_L56ox-e_pGLhr-oMc9l6Yn6CwT0Mvlljobw2dZkFj2OWW-AGlsab7N3RPhOLSyTjxqPFVk6fii2a9FRIbux2w4aR9eUhzges980ximEqoWrYs408nT85csO59TMxRWCf31dqW0y6sf7hS-igseQtHvxcLrzZeueaI0AI-it6pJL4Pkl2TsZrjYyCNGo_QPjN75nwC-keMdW3r-lJLv5ZUA9KpxwcjLIgutaryRKxve0Fe1G_PPcp-t4vWwA965FvZH5gMQr1sMiSdAIJ4PSrnBuXKfmeuTw'


/**
 * Main app component that handles the audio playback functionality.
 */
const App = () => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * Fetches the audio file from Dropbox and loads it into the app.
   * It also cleans up the sound resource when the component is unmounted.
   */
  useEffect(() => {

const fetchAudioFile = async () => {
  try {
    const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '' }), // Ruta ra’z
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error in API response:', errorData);
      return;
    }

    const data = await response.json();

    // Verifica si 'entries' existe y es un array
    if (!data.entries || !Array.isArray(data.entries)) {
      console.error('No entries found in the response:', data);
      return;
    }

    const mp3File = data.entries.find(
      (file) => file['.tag'] === 'file' && file.name.endsWith('.mp3')
    );

    if (mp3File) {
      const linkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: mp3File.path_lower }),
      });

      if (!linkResponse.ok) {
        const linkErrorData = await linkResponse.json();
        console.error('Error fetching temporary link:', linkErrorData);
        return;
      }

      const linkData = await linkResponse.json();
      const mp3Url = linkData.link;

      const { sound } = await Audio.Sound.createAsync({ uri: mp3Url });
      setSound(sound);
    } else {
      console.log('No MP3 files found in the directory.');
    }
  } catch (error) {
    console.error('Error fetching audio file:', error);
  }
};
    fetchAudioFile();
    

    return () => {
      if (sound) {
        sound.unloadAsync(); // Release sound resources
      }
    };
  }, []);


  /**
   * Toggles the audio playback state between play and pause.
   */
  const playSound = async () => {
    if (sound) {
      try {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };


  /**
   * Defines the gradient color sets for the different states of the app.
   */
  const gradients = {
    default: ['#f5f5f5', '#f5f5f5'],
    playing: ['#2ecc71', '#27ae60', '#1abc9c', '#16a085']
  };


  /**
   * Renders the UI with a gradient background and a play/pause button.
   */
  return (
    <LinearGradient
      colors={isPlaying ? gradients.playing : gradients.default}
      style={styles.container}
    >
      <Text style={[styles.title, { color: isPlaying ? 'white' : 'black' }]}>
        Dropbox Audio Player
      </Text>
      <Button 
        title={isPlaying ? 'Pause Sound' : 'Play Sound'} 
        onPress={playSound} 
      />
    </LinearGradient>
  );
};


/**
 * Defines the styles for the app layout and text elements.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default App;
