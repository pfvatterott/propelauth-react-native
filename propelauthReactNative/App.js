import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import { getDiscoveryDocument } from './DiscoveryDocument';
import { useEffect } from 'react';

export default function App() {

  async function save(key, value) {
    await SecureStore.setItemAsync(key, value);
  }

  async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
      return result
    } else {
      alert('No values stored under that key.');
    }
  }

  const discoveryDocument = getDiscoveryDocument();
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_CLIENT_ID ?? '',
      redirectUri: AuthSession.makeRedirectUri(),
      usePKCE: true,
    },
    discoveryDocument,
  );

  useEffect(() => {
    if (response?.type === 'success' && response.params.code && request?.codeVerifier) {
      const getToken = async () => {
        const exchangeTokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: process.env.EXPO_PUBLIC_CLIENT_ID ?? '',
            code: response.params.code,
            redirectUri: process.env.EXPO_PUBLIC_REDIRECT_URI,
            extraParams: {
              code_verifier: request.codeVerifier ?? '',
            },
          },
          discoveryDocument,
        );
        console.log(exchangeTokenResponse)
        save('access_token', exchangeTokenResponse.accessToken);
        save('refresh_token', exchangeTokenResponse.refreshToken);
      };
      getToken();
    }
  }, [response]);




  const fetchUserData = async () => {
    try {
      const token = await getValueFor('access_token')
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BASE_AUTH_URL}/propelauth/oauth/userinfo`, { headers: headers });
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const logoutUser = async () => {
    try {
      const refresh_token = await getValueFor('refresh_token')
      const headers = {
        'Content-Type': 'application/json'
      };
      const body = {
        "refresh_token": refresh_token
      }
      const response = await axios.post(`http://192.168.86.29:4000/`, body, { headers: headers }
      );
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };



  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
      <Button disabled={!request} title="Login" onPress={() => promptAsync()} />
      <Button title="Get User Data" onPress={() => fetchUserData()} />
      <Button title="Logout" onPress={() => logoutUser()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
