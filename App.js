import React, {useEffect, useState} from 'react';
import {
  Alert,
  AppRegistry,
  LogBox,
  Platform,
  Linking,
  Dimensions,
  AppState,
} from 'react-native';
import * as Sentry from '@sentry/react-native';
import SplashScreen from 'react-native-splash-screen';

import AppNavigation from './src/navigations/AppNavigation';
import {Provider} from 'react-redux';
import store from './src/redux/store';
import {validateVersion} from './src/services/utility';
import {
  VUView,
  VUText,
  VayyUpLogo,
  VUTouchableOpacity,
  VUImage,
} from 'common-components';
const {width, height} = Dimensions.get('window');
import {createTable} from './src/models/queries';
LogBox.ignoreAllLogs(true);
Sentry.init({
  dsn:
    'https://fed975184daa4c19a5a07e6f58119d47@o576118.ingest.sentry.io/5729647',
  integrations: [new Sentry.ReactNativeTracing()],
});
LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
LogBox.ignoreLogs(['source.uri should not be an empty string']);

const App = () => {
  const [loading, setLoading] = useState(true);
  const [updateRequired, setUpdateRequired] = useState(false);
  createTable();
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        validateVersion().then(res => {
          setUpdateRequired(res.isNeeded);
        });
      }
    };
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  });

  useEffect(() => {
    if (loading === false) {
      SplashScreen.hide();
    }
    validateVersion().then(res => {
      setLoading(false);
      setUpdateRequired(res.isNeeded);
    });
  }, [loading]);

  const handleOpenStore = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL(
          'itms-apps://apps.apple.com/in/app/vayy-up/id1561376568',
        );
      } else {
        await Linking.openURL('market://details?id=com.dellainfotech');
      }
    } catch (error) {
      Alert.alert(
        'Unable to open the store.\n\nPlease manually open store and upgrad the app.',
      );
    }
  };

  // if (updateRequired) {
  //   return (
  //     <VUView
  //       flex={1}
  //       justifyContent="center"
  //       alignItems="center"
  //       p={15}
  //       bg="#0C0B54">
  //       <VUView alignItems="center">
  //         <VayyUpLogo />
  //         <VUText
  //           my={3}
  //           textAlign="center"
  //           fontSize={24}
  //           fontWeigh="bold"
  //           color="#fff">
  //           Update available.
  //         </VUText>
  //       </VUView>
  //       <VUView flex={1} alignItems="center" justifyContent="center">
  //         <VUImage
  //           source={require('src/../assets/update.png')}
  //           resizeMode="contain"
  //           height={height}
  //           width={width}
  //         />
  //       </VUView>
  //       <VUView>
  //         <VUText fontSize={16} color="#fff">
  //           Please update to proceed further
  //         </VUText>
  //         <VUTouchableOpacity
  //           bg="#E9326D"
  //           alignItems="center"
  //           px={4}
  //           py={1}
  //           mx={3}
  //           my={3}
  //           borderRadius={25}
  //           onPress={handleOpenStore}>
  //           <VUText color="#fff">
  //             {Platform.OS === 'ios' ? 'Open App Store' : 'Open Play Store'}
  //           </VUText>
  //         </VUTouchableOpacity>
  //       </VUView>
  //     </VUView>
  //   );
  // }

  return (
    <Provider store={store}>
      <AppNavigation />
    </Provider>
  );
};

AppRegistry.registerComponent('vayy_up', () => App);

export default App;
