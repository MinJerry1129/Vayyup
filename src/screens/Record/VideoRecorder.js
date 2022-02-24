import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon, AntDesignIcon, MaterialIcon } from 'src/icons';
import { RNCamera } from 'react-native-camera';
import KeepAwake from 'react-native-keep-awake';

import {
  VUText,
  VUView,
  VayyUpAV,
  Text,
  VUVideo,
  ActivityIndicator,
  VUImage,
  VUTouchableOpacity,
} from 'common-components';
import { Platform, Dimensions, BackHandler, View } from 'react-native';
import SoundPlayer from 'react-native-sound-player';

import { Actions, BoxAction, StartBoxAction } from './styles';
import { AppStyles, globalStyles } from 'src/AppStyles';
import LinearGradient from 'react-native-linear-gradient';

const screen = Dimensions.get('screen');
const { height } = screen;
let myCounter = 0;
let timeout = null;
let camera;

const Recorder = ({
  onCloseCamera,
  onFinishRecording,
  karaokeVideo,
  type,
  karaokeType,
}) => {
  const [recording, setRecording] = useState(false);
  const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back);
  const [playKaraoke, setPlayKaraoke] = useState(false);
  const [karaokeLoaded, setKaraokeLoaded] = useState(false);
  const [startCountDown, setstartCountDown] = useState(false);
  const [headphoneAlert, setHeadphoneAlert] = useState(true);
  const [karaokeHeight, setKaraokeHeight] = useState(360);
  const [countdown, setCountdown] = useState(3);
  const [recordingStartTime, setRecordingStartTime] = useState(0);
  const lagTime = useRef(0);
  const cancelRecording = useRef(false);
  useEffect(() => {
    const _onFinishedLoadingSubscription = SoundPlayer.addEventListener(
      'FinishedLoading',
      results => {
        setKaraokeLoaded(true);
      },
    );

    if (type === 'doops') {
      SoundPlayer.loadUrl(karaokeVideo.audio);
    }
    if (karaokeType == false) {
      setKaraokeLoaded(true);
    }

    return () => {
      _onFinishedLoadingSubscription.remove();
      clearInterval(timeout);
    };
  }, [type, karaokeVideo, karaokeType]);
  const handleAppStateChange = () => {
    cancelRecording.current = true;
    camera.stopRecording();
    onCloseCamera();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleAppStateChange);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleAppStateChange,
      );
    };
  }, []);

  const [time, setTime] = useState(0);

  let timer;
  let counter;
  const timerCallback = useRef();
  timerCallback.current = () => {
    setTime(time + 1);
  };

  const onFlipCamera = () => {
    setCameraType(
      cameraType === RNCamera.Constants.Type.back
        ? RNCamera.Constants.Type.front
        : RNCamera.Constants.Type.back,
    );
  };
  myCounter = countdown;
  const onStartCountDown = () => {
    setstartCountDown(true);
    timeout = setInterval(() => {
      setCountdown((countdown) => countdown - 1);
      if (myCounter === 0) {
        setCountdown(3);
        clearInterval(timeout);
        setstartCountDown(false);
        onStartRecording();
      }
    }, 1000);
  };

  const onStartRecording = async () => {
    KeepAwake.activate();
    cancelRecording.current = false;
    setRecording(true);
    timer = setInterval(() => {
      timerCallback.current();
    }, 1000);
    setRecordingStartTime(+new Date());
    const recordingOption = {
      orientation: RNCamera.Constants.Orientation.portrait,
      // height: screen.height,
      // width: screen.width,
      quality: RNCamera.Constants.VideoQuality['720p'],
      videoBitrate: 1000 * 1000 * 40,
      mute: type === 'doops',
      // maxDuration: 60 * 4, // 4minutes
    };
    setTimeout(() => {
      setPlayKaraoke(true);
    }, 1000);


    // setPlayKaraoke(true);
    if (type === 'doops') {
      recordingOption.maxDuration = 60; // 1 minutes;
      SoundPlayer.seek(0);
      SoundPlayer.play();
    }
    const data = await camera.recordAsync(recordingOption);
    if (type === 'doops') {
      SoundPlayer.stop();
    }
    KeepAwake.deactivate();
    setTime(0);
    if (timer) {
      clearInterval(timer);
    }
    if (!cancelRecording.current) {
      onFinishRecording(data, lagTime.current);
    }
  };

  const handleCancelRecording = () => {
    cancelRecording.current = true;
    camera.stopRecording();
    onCloseCamera();
  };

  const onStopRecording = () => {
    setPlayKaraoke(false);
    camera.stopRecording();
    setRecording(false);
  };

  const handleKaraokeLoaded = (event) => {
    const { naturalSize = {} } = event;
    setKaraokeHeight(naturalSize.height || 360);
    setKaraokeLoaded(true);
  };

  const handleKaraokeProgress = event => {
    if (event.currentTime > 1 && lagTime.current === 0) {
      const recordingTime = (+new Date() - recordingStartTime) / 1000;
      lagTime.current = recordingTime - event.currentTime;
    }
  };

  const { playback = {}, url } = karaokeVideo;
  const { hls, dash } = playback;
  let videoURL = { uri: url };
  if (Platform.OS === 'ios' && dash) {
    videoURL = { uri: hls, type: 'm3u8' };
  }
  if (Platform.OS === 'android' && dash) {
    videoURL = { uri: dash, type: 'mpd' };
  }
  return (
    <>
      <VUView bg="#000" flex={1} flexDirection="column">
        {karaokeVideo && type === 'karaoke' && karaokeType == true && (
          <VUVideo
            flex={1}
            source={videoURL}
            resizeMode="cover"
            paused={!playKaraoke}
            onLoad={handleKaraokeLoaded}
            onProgress={handleKaraokeProgress}
          />
        )}
        <VayyUpAV
          flex={1}
          type={cameraType}
          ref={ref => {
            camera = ref;
          }}
        />
      </VUView>
      {startCountDown && (
        <VUView
          position="absolute"
          top={0}
          right={0}
          bg="#242365"
          left={0}
          height={height / 2}
          alignItems="center"
          justifyContent="center">
          <VUView
            width={84}
            height={84}
            borderRadius={42}
            zIndex={10}
            alignItems="center"
            justifyContent="center"
            style={{
              shadowColor: AppStyles.color.bgWhite,
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.29,
              shadowRadius: 4.65,
              elevation: 7,
            }}
            bg={AppStyles.color.bgWhite}>
            <VUText style={{fontSize: 50, color: AppStyles.color.textBlue}}>{countdown}</VUText>
          </VUView>
          <View style={globalStyles.countDownPlus1}></View>
          <View style={globalStyles.countDownPlus2}></View>
        </VUView>
      )}
      {headphoneAlert && type === 'karaoke' && karaokeType && (
        <VUView
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          alignItems="center"
          justifyContent="center">
          <LinearGradient
            colors={['#0C0B54', '#0C0B54', '#F84030']}
            start={{ x: 0, y: 0 }}
            style={{ borderRadius: 10 }}
            end={{ x: 1, y: 0 }}>
            <VUView
              width={250}
              height={250}
              alignItems="center"
              justifyContent="center">
              <VUImage
                width="50px"
                height="50px"
                borderRadius={4}
                source={require('src/../assets/headphones.png')}
                resizeMode="contain"
              />
              <VUText
                fontFamily={AppStyles.fontName.robotoBold}
                mt={2}
                fontSize={13}
                color={'#FFF'}>
                Headphone Recommended
              </VUText>
              <VUText
                fontFamily={AppStyles.fontName.robotoRegular}
                mt={2}
                fontSize={13}
                color={'#FFF'}
                textAlign={'center'}>
                Wearing a headphone with microphone can improve the recording
                process
              </VUText>
              <VUTouchableOpacity onPress={() => setHeadphoneAlert(false)}>
                <VUText
                  fontFamily={AppStyles.fontName.robotoRegular}
                  mt={3}
                  fontSize={13}
                  color={'#FFF'}
                  textAlign={'center'}
                  style={globalStyles.textDecoration}>
                  I Know
                </VUText>
              </VUTouchableOpacity>
            </VUView>
          </LinearGradient>
        </VUView>
      )}

      <Actions
        bottom={Platform.OS === 'ios' ? '40px' : '20px'}
        alignItems="flex-end">
        {!recording && (
          <StartBoxAction size={60} onPress={onStartCountDown}>
            <FontAwesomeIcon
              size={60}
              name="circle"
              color={AppStyles.color.btnColor}
            />
          </StartBoxAction>
        )}
        {recording && (
          <BoxAction size={60} onPress={onStopRecording}>
            <FontAwesomeIcon
              size={60}
              name="stop-circle-o"
              color={AppStyles.color.btnColor}
            />
          </BoxAction>
        )}
      </Actions>

      {recording && (
        <Actions
          top={Platform.OS === 'ios' ? '50px' : '20px'}
          alignItems="flex-end"
          justify="center">
          <Text color="#ff0000">{time}s</Text>
        </Actions>
      )}
      <VUView
        position="absolute"
        flexDirection="row"
        top={Platform.OS === 'ios' ? 50 : 20}
        width="100%"
        px={3}
        flex={1}
        justifyContent="space-between">
        <BoxAction
          size={36}
          onPress={recording ? handleCancelRecording : onCloseCamera}>
          <AntDesignIcon size={30} name="close" color="#fff" />
        </BoxAction>
        {!recording && (
          <BoxAction size={36} onPress={onFlipCamera}>
            <MaterialIcon size={30} name="flip-camera-ios" color="#fff" />
          </BoxAction>
        )}
      </VUView>

      {!karaokeLoaded && (
        <VUView
          bg="rgba(0,0,0,1)"
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          alignItems="center"
          justifyContent="center">
          <VUText color="#ccc" my={3}>
            Opening Camera
          </VUText>
          <ActivityIndicator animating={true} />
        </VUView>
      )}
    </>
  );
};

export default Recorder;