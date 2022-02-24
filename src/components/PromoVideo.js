import React, {useRef, useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {useSelector} from 'react-redux';
import {
  VUView,
  VUVideo,
  VUTouchableOpacity,
  ActivityIndicator,
} from 'common-components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FontAwesomeIcon, EntypoIcon, IonIcon} from 'src/icons';
import {AppStyles} from 'src/AppStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/core';
import firebase from '@react-native-firebase/app';
const promoVideos123 = [
  {
    thumbnail:
      'https://videodelivery.net/15310ecfd2d2957bc1f5bdfcf57fd099/thumbnails/thumbnail.jpg',
    dash: 'https://videodelivery.net/15310ecfd2d2957bc1f5bdfcf57fd099/manifest/video.mpd',
    hls: 'https://videodelivery.net/15310ecfd2d2957bc1f5bdfcf57fd099/manifest/video.m3u8',
  },
  {
    thumbnail:
      'https://videodelivery.net/dd4aca0e8042fab8beed6201fb8dd2c8/thumbnails/thumbnail.jpg',
    dash: 'https://videodelivery.net/dd4aca0e8042fab8beed6201fb8dd2c8/manifest/video.mpd',
    hls: 'https://videodelivery.net/dd4aca0e8042fab8beed6201fb8dd2c8/manifest/video.m3u8',
  },
  {
    thumbnail:
      'https://videodelivery.net/af2caf90a8d39b49782c3877da57ccfb/thumbnails/thumbnail.jpg',
    dash: 'https://videodelivery.net/af2caf90a8d39b49782c3877da57ccfb/manifest/video.mpd',
    hls: 'https://videodelivery.net/af2caf90a8d39b49782c3877da57ccfb/manifest/video.m3u8',
  },
  {
    thumbnail:
      'https://videodelivery.net/431f3f3b86a5c75333c472b2b67260a1/thumbnails/thumbnail.jpg',
    dash: 'https://videodelivery.net/431f3f3b86a5c75333c472b2b67260a1/manifest/video.mpd',
    hls: 'https://videodelivery.net/431f3f3b86a5c75333c472b2b67260a1/manifest/video.m3u8',
  },
];

var promoVideos;
var videoURL = {
  uri: '',
  type: '',
};
var randomIndex;

const PromoVideo = ({}) => {
  const videoPlayer = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const navigation = useNavigation();
  const [paused, setPaused] = useState(false);
  const [load, setLoad] = useState(true);
  const insets = useSafeAreaInsets();
  const {initialRoute, initialData} = useSelector(state => ({
    initialRoute: state.settings.initialRoute,
    initialData: state.settings.initialData
  }));

  useEffect(async () => {
    const snapshot = await firebase.firestore().collection('promovideos').get();
    var length = snapshot.docs.length;
    randomIndex = Math.min(Math.floor(Math.random() * length), length);
    promoVideos = snapshot.docs[randomIndex]._data;

    videoURL = {
      uri: Platform.OS === 'ios' ? promoVideos.hls : promoVideos.dash,
      type: Platform.OS === 'ios' ? 'm3u8' : 'mpd',
    };
    setLoad(false);
  }, []);

  useEffect(async () => {
    const {id, fcmToken: userFcmToken = ''} = user;
    const currentFcmToken = await AsyncStorage.getItem('fcmToken');
    if (currentFcmToken !== userFcmToken) {
      await firestore()
        .collection('users')
        .doc(id)
        .update({fcmToken: currentFcmToken});
    }
  }, []);

  const onEndVideo = () => {
    setPaused(true);
  

    if (initialRoute && initialRoute !== 'Chat') {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: initialRoute,
            params: initialData,
          },
        ],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'VayyUp',
          },
        ],
      });
    }
  };

  if (load) {
    return (
      <VUView
        bg={AppStyles.color.bgWhite}
        flex={1}
        justifyContent="center"
        alignItems="center">
        <ActivityIndicator color={AppStyles.color.blueBtnColor} animating={true} />
      </VUView>
    );
  }

  return (
    <>
      <VUView flex={1}>
        <VUVideo
          flex={1}
          ref={videoPlayer}
          onEnd={onEndVideo}
          paused={paused}
          poster={promoVideos.thumbnail}
          posterResizeMode="cover"
          source={videoURL}
          volume={10}
          resizeMode="cover"
          repeat={false}
          onError={(error) => console.log(error)}
          ignoreSilentSwitch="ignore"
        />
      </VUView>
      <VUView position="absolute" width="100%" alignItems="flex-end" p={2}>
        <VUTouchableOpacity onPress={onEndVideo} mt={insets.top}>
          <IonIcon
            bold
            name="close"
            size={38}
            color={AppStyles.color.white}
          />
        </VUTouchableOpacity>
      </VUView>
    </>
  );
};

export default PromoVideo;
