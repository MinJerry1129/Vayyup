import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  Platform,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
} from 'react-native';
import {useSelector} from 'react-redux';
import Share from 'react-native-share';
import {useNavigation} from '@react-navigation/core';
import Toast from 'react-native-simple-toast';
import {numFormatter} from 'src/services/numFormatter';
import {FontAwesomeIcon} from 'src/icons';
import {AntDesignIcon} from 'src/icons';
import {IonIcon} from 'src/icons';
import {FontAwesome5Icon} from 'src/icons';
import {followUser, unfollowUser} from 'src/services/social';
import firebase from '@react-native-firebase/app';
import CameraRoll from '@react-native-community/cameraroll';

import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {
  VUView,
  VUText,
  VUImage,
  VUVideo,
  VUTouchableOpacity,
  Overlay,
  ActivityIndicator,
  PLAYER_STATES,
} from 'common-components';
import ActionSheet from 'react-native-actions-sheet';

import {
  Header,
  Controls,
  Actions,
  BoxAction,
  TextAction,
  ContentWrapper,
} from './styles';
import RNFetchBlob from 'rn-fetch-blob';
var RNFS = require('react-native-fs');
import {AppStyles} from 'src/AppStyles';

interface Item {
  id: number;
  username: string;
  tags: string;
  music: string;
  likes: number;
  comments: number;
  uri: string;
}

function VideoFeed({
  onVoting,
  onUnvoting,
  item,
  index,
  focused,
  active,
  load,
  type,
  isMyVideos,
  onCommenting,
  onDelete,
  OnViewCount,
}) {
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState(item.votes);

  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [viewCount, setViewCount] = useState(item.views);
  const [countStatus, setCountStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const muted = useSelector((state) => state.settings.muted);
  const reactions = useSelector((state) =>
    type === 'competition' ? state.feeds.reactions : state.videos.reactions,
  );

  const [currentUser, following] = useSelector((state) => [
    state.auth.user,
    state.social.following,
  ]);

  const {url, thumbnail, playback = {}, video, videoFileName} = item;
  const {hls, dash} = playback;
  let videoURL = {url: url};
  if (Platform.OS === 'ios' && dash) {
    videoURL = {uri: hls, type: 'm3u8'};
  }
  if (Platform.OS === 'android' && dash) {
    videoURL = {uri: dash, type: 'mpd'};
  }

  const navigation = useNavigation();
  const {user = {}} = item;

  // Video Player Control
  const videoPlayer = useRef(null);
  const [paused, setPaused] = useState(!active);
  const [playerState, setPlayerState] = useState(PLAYER_STATES.PLAYING);
  const [reported, setReported] = useState(false);
  const actionSheetRef = useRef();
  const [textShown, setTextShown] = useState(false); //To show ur remaining Text
  const [lengthMore, setLengthMore] = useState(false); //to show the "Read more & Less Line"
  const toggleNumberOfLines = () => {
    //To toggle the show text or hide it
    setTextShown(!textShown);
  };

  const onPaused = (ps) => {
    //Handler for Video Pause
    if (paused && playerState === PLAYER_STATES.ENDED) {
      videoPlayer.current.seek(0);
    } else {
      setPaused(!paused);
    }
    setPlayerState(paused ? PLAYER_STATES.PLAYING : PLAYER_STATES.PAUSED);
  };

  const onEnd = () => setPlayerState(PLAYER_STATES.ENDED);

  useEffect(() => {
    setPaused(!active);
  }, [active]);
  useEffect(() => {
    initialLoading();
  }, [reactions, type, item.id]);

  const initialLoading = () => {
    if (type === 'competition') {
      const reaction = reactions.find((obj) => obj.entryId === item.id);
      firestore()
        .collection('entries')
        .doc(item.id)
        .get()
        .then((obj) => {
          const entry = obj.data() || {};
          const {votes: entryVotes = 0} = entry;
          setVotes(entryVotes);
          setViewCount(entry.views != undefined ? entry.views : 0);
        });
      setVoted(reaction !== undefined);
    } else {
      const reaction = reactions.find((obj) => obj.videoId === item.id);
      firestore()
        .collection('videos')
        .doc(item.id)
        .get()
        .then((obj) => {
          const entry = obj.data();
          setVotes(entry.votes || 0);
          setViewCount(entry.views != undefined ? entry.views : 0);
        });
      setVoted(reaction !== undefined);
    }

    firestore();
  };

  const handleVoting = async () => {
    setVoting(true);
    if (!voted) {
      await onVoting(item, index);
    } else {
      await onUnvoting(item, index);
    }
    // setTimeout(() => setVoting(false), 1000);
    setVoting(false);
  };

  const handleProgress = async (progress) => {
    if (countStatus == true) {
      setCountStatus(false);
      await OnViewCount(item, index);
      initialLoading();
    }
  };

  const handleLoad = (progress) => {
    setCountStatus(true);
  };

  const handleChat = async () => {
    if (onCommenting) {
      onCommenting();
    }
    navigation.navigate('Comment', {type, item, index});
  };

  const handleSocialShare = async () => {
    const routeType = type === 'competition' ? 'entries' : 'videos';
    RNFetchBlob.fetch('GET', item.thumbnail)
      .then((resp) => {
        let base64image = resp.data;

        share('data:image/png;base64,' + base64image, routeType);
      })
      .catch((err) => console.log(err));
  };
  const share = async (image, routeType) => {
    const options = {
      title: type === 'competition' ? item.competition.title : item.title,
      url: image,
      message: `http://vayyup.com/${routeType}/${item.id}`,
    };
    Share.open(options)
      .then((res) => {})
      .catch((err) => {
        err && console.log(err);
      });
  };

  const handleOnFlag = async () => {
    setReported(false);
    actionSheetRef.current?.setModalVisible();
  };

  const handleOnSpam = (reportType) => {
    firestore()
      .collection('reports')
      .doc()
      .set({
        id: item.id,
        collectionName: type === 'competition' ? 'entries' : 'videos',
        reportedUser: firebase.auth().currentUser.uid,
        itemUser: item.uid,
        type: reportType,
        date: firebase.firestore.FieldValue.serverTimestamp(),
      });
    setReported(true);
  };

  const handleUserProfilePressed = async () => {
    navigation.navigate('UserProfile', {
      user: {...user, id: item.uid},
      showBack: true,
    });
  };
  const handleOnFollowPressed = async () => {
    const user = {...item.user, id: item.uid};
    const {
      id: userId = '',
      name: userFullname = '',
      profile: userProfile = '',
    } = user;
    const {
      id: currentUserId = '',
      fullname: currentUserFullname = '',
      profile: currentUserProfile = '',
    } = currentUser;
    followUser(
      {id: userId, name: userFullname, profile: userProfile},
      {
        id: currentUserId,
        name: currentUserFullname,
        profile: currentUserProfile,
      },
    );
  };

  const handleOnUnfollowPressed = () => {
    const user = {...item.user, id: item.uid};
    const {
      id: userId = '',
      name: userFullname = '',
      profile: userProfile = '',
    } = user;
    const {
      id: currentUserId = '',
      fullname: currentUserFullname = '',
      profile: currentUserProfile = '',
    } = currentUser;
    unfollowUser(
      {id: userId, name: userFullname, profile: userProfile},
      {
        id: currentUserId,
        name: currentUserFullname,
        profile: currentUserProfile,
      },
    );
  };

  async function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  const handleOnDownload = async () => {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }
    setDownloading(true);
    // Currently we don't use any other format.
    try {
      const path = `${RNFS.CachesDirectoryPath}/${videoFileName}`;
      const reference = storage().ref(video);
      await reference.writeToFile(path);
      await CameraRoll.save(path, {type: 'video'});
      Toast.show('Video saved into gallery.', Toast.LONG);
    } catch (error) {}
    setDownloading(false);
  };

  const handleOnDelete = async () => {
    setDeleting(true);
    await firestore().collection('videos').doc(item.id).delete();
    setTimeout(() => {
      setDeleting(false);
      onDelete();
      Toast.show('Video deleted successfully.', Toast.LONG);
    }, 5000);
  };

  const onTextLayout = useCallback((e) => {
    setLengthMore(e.nativeEvent.lines.length > 1); //to check the text is more than 4 lines or not
  }, []);

  if (loading) {
    return (
      <Overlay>
        <ActivityIndicator />
      </Overlay>
    );
  }

  return (
    <Controls>
      <ContentWrapper>
        {focused && load && (
          <>
            <TouchableOpacity
              activeOpacity={1}
              style={[StyleSheet.absoluteFill]}
              onPress={onPaused}>
              <VUVideo
                flex={1}
                ref={videoPlayer}
                onEnd={onEnd}
                poster={thumbnail}
                posterResizeMode="cover"
                paused={paused}
                muted={muted}
                source={videoURL}
                onProgress={handleProgress}
                onLoad={handleLoad}
                volume={10}
                resizeMode="cover"
                repeat={true}
                ignoreSilentSwitch="ignore"
              />
              {paused && (
                <VUView
                  alignItems="center"
                  justifyContent="center"
                  position="absolute"
                  style={[StyleSheet.absoluteFill]}>
                  <AntDesignIcon name={'play'} size={64} color="#bbb" />
                </VUView>
              )}
            </TouchableOpacity>
          </>
        )}

        <Header
          right="0px"
          bottom={
            type === 'competition'
              ? '30px'
              : Platform.OS === 'ios'
              ? '120px'
              : '90px'
          }>
          <VUView
            height="100%"
            flexDirection="column"
            justifyContent="space-between">
            {onVoting && (
              <VUView>
                {voting ? (
                  <ActivityIndicator color="#fff" animating={true} />
                ) : (
                  <BoxAction onPress={handleVoting}>
                    {type === 'competition' ? (
                      <FontAwesomeIcon
                        centered
                        name="thumbs-up"
                        color={voted ? '#E8505B' : '#fff'}
                      />
                    ) : (
                      <FontAwesomeIcon
                        centered
                        name="heart"
                        color={voted ? '#E8505B' : '#fff'}
                      />
                    )}
                    <VUView px={10} alignItems="center">
                      <TextAction>{numFormatter(parseInt(votes))}</TextAction>
                    </VUView>
                  </BoxAction>
                )}
              </VUView>
            )}
            <BoxAction onPress={handleChat}>
              <IonIcon size={28} name="chatbubble-ellipses-outline" />
              <VUView px={10} alignItems="center">
                <TextAction>{item.comments}</TextAction>
              </VUView>
            </BoxAction>

            <BoxAction onPress={handleSocialShare}>
              <IonIcon size={26} name="share-social-sharp" />
            </BoxAction>
            {!isMyVideos && (
              <BoxAction onPress={handleOnFlag}>
                <FontAwesomeIcon name="flag" />
              </BoxAction>
            )}
            {viewCount != undefined && (
              <VUView>
                <BoxAction>
                  <FontAwesomeIcon centered name="play" />
                  <VUView px={10} alignItems="center">
                    <TextAction>{numFormatter(parseInt(viewCount))}</TextAction>
                  </VUView>
                </BoxAction>
              </VUView>
            )}
            {isMyVideos && (
              <>
                {downloading ? (
                  <ActivityIndicator color="#fff" animating={true} />
                ) : (
                  <BoxAction onPress={handleOnDownload}>
                    <FontAwesomeIcon name="download" />
                  </BoxAction>
                )}
                {deleting ? (
                  <ActivityIndicator color="#fff" animating={true} />
                ) : (
                  <BoxAction onPress={handleOnDelete}>
                    <FontAwesomeIcon name="trash" />
                  </BoxAction>
                )}
              </>
            )}
          </VUView>
        </Header>
        <Header
          left="0px"
          bottom={
            type === 'competition'
              ? '30px'
              : Platform.OS === 'ios'
              ? '120px'
              : '90px'
          }
          right="0px">
          <Actions>
            <VUView>
              <VUTouchableOpacity onPress={handleUserProfilePressed}>
                <VUView flexDirection="row" alignItems="center">
                  <VUView mr={3}>
                    {/* <BoxAction > */}
                    {user.profile ? (
                      <VUImage
                        size={40}
                        source={{uri: user.profile}}
                        borderRadius={20}
                      />
                    ) : (
                      <IonIcon
                        name="person-circle-outline"
                        size={50}
                        color="#ffffff"
                      />
                    )}
                    {/* </BoxAction> */}
                    <VUView top={-15} alignItems="flex-end" mb={-15}>
                      <VUView
                        width={16}
                        height={16}
                        bg="#E9326D"
                        borderRadius={15}
                        justifyContent="center"
                        alignItems="center">
                        <FontAwesome5Icon name="plus" size={12} color="#fff" />
                      </VUView>
                    </VUView>
                  </VUView>
                  <VUView>
                    <VUView flexDirection="row">
                      <VUText
                        color="#fff"
                        fontSize={14}
                        fontFamily={AppStyles.fontName.robotoBold}
                        color={AppStyles.color.grayText}>
                        {item.user.name}
                      </VUText>
                      {item.uid != currentUser.id &&
                        (followLoading ? (
                          <ActivityIndicator color="#E9326D" animating={true} />
                        ) : following.find((obj) => obj.id === item.uid) !=
                          undefined ? (
                          <VUTouchableOpacity
                            borderColor={AppStyles.color.btnColor}
                            ml={2}
                            borderWidth={1}
                            borderRadius={24}
                            width={60}
                            height={20}
                            onPress={handleOnUnfollowPressed}>
                            <VUText
                              textAlign="center"
                              fontSize={12}
                              fontFamily={AppStyles.fontName.robotoRegular}
                              color={AppStyles.color.btnColor}>
                              Unfollow
                            </VUText>
                          </VUTouchableOpacity>
                        ) : (
                          <VUTouchableOpacity
                            borderColor={AppStyles.color.btnColor}
                            ml={2}
                            borderWidth={1}
                            borderRadius={24}
                            width={50}
                            height={20}
                            onPress={handleOnFollowPressed}>
                            <VUText
                              textAlign="center"
                              fontSize={12}
                              fontFamily={AppStyles.fontName.robotoRegular}
                              color={AppStyles.color.btnColor}>
                              Follow
                            </VUText>
                          </VUTouchableOpacity>
                        ))}
                    </VUView>
                  </VUView>
                </VUView>
                <VUView flex={1} width="80%">
                  <VUText
                    onTextLayout={onTextLayout}
                    numberOfLines={textShown ? undefined : 1}
                    fontSize={12}
                    color={AppStyles.color.grayText}
                    style={{
                      textShadowColor: 'grey',
                      textShadowOffset: {width: 0.5, height: 0.5},
                      textShadowRadius: 1,
                    }}>
                    {item.title}
                  </VUText>
                  {lengthMore ? (
                    <VUText
                      onPress={toggleNumberOfLines}
                      fontSize={12}
                      color={AppStyles.color.btnColor}
                      style={{
                        textShadowColor: 'grey',
                        textShadowOffset: {width: 0.5, height: 0.5},
                        textShadowRadius: 1,
                        marginBottom:
                          type === 'competition'
                            ? 30
                            : Platform.OS === 'ios'
                            ? 40
                            : 20,
                      }}>
                      {textShown ? 'less' : 'more'}
                    </VUText>
                  ) : null}
                </VUView>
              </VUTouchableOpacity>
            </VUView>
          </Actions>
        </Header>
      </ContentWrapper>
      <ActionSheet ref={actionSheetRef}>
        {reported ? (
          <>
            <VUView mt={3} mb={6}>
              <VUView width="100%" my={3}>
                <FontAwesomeIcon name="check" color="#5ea23a" size={24} />
              </VUView>
              <VUView width="100%" alignItems="center">
                <VUText fontWeight="bold">Thanks for letting us know</VUText>
                <VUText my={2} mx={4} textAlign="center" color="#666">
                  Your feedback is important in helping us keep the VayyUp
                  community safe.
                </VUText>
              </VUView>
            </VUView>
          </>
        ) : (
          <>
            <VUView my={3}>
              <VUView
                borderColor="#ccc"
                borderBottomWidth={1}
                width="100%"
                alignItems="center"
                pb={2}>
                <VUText fontSize={18} fontWeight="bold">
                  Report
                </VUText>
              </VUView>
            </VUView>
            <VUView mb={4} px={3} width="100%">
              <VUView mb={3}>
                <VUText color="#999">
                  Your report is anonymous, except if you're reporting an
                  intellectual property infringement. Our team will review your
                  feedback within 24hours and takes appropirate action after it
                  is verified.
                </VUText>
                <VUText color="#999">
                  If someone is in immediate danger, call the local emergency
                  service - don't wait.
                </VUText>
              </VUView>
              <VUView>
                <VUText fontWeight="bold">
                  Why are you reporting this video?
                </VUText>
              </VUView>
              <VUView width="100%" mt={2}>
                <TouchableOpacity onPress={handleOnSpam.bind(this, 'block')}>
                  <VUView
                    width="100%"
                    borderColor="#ccc"
                    py={3}
                    borderTopWidth={1}
                    borderBottomWidth={1}
                    flexDirection="row"
                    justifyContent="space-between">
                    <VUText>Block User</VUText>
                    <FontAwesomeIcon
                      name="chevron-right"
                      color="#666"
                      size={12}
                    />
                  </VUView>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleOnSpam.bind(this, 'spam')}>
                  <VUView
                    width="100%"
                    borderColor="#ccc"
                    py={3}
                    borderBottomWidth={1}
                    flexDirection="row"
                    justifyContent="space-between">
                    <VUText>It's spam</VUText>
                    <FontAwesomeIcon
                      name="chevron-right"
                      color="#666"
                      size={12}
                    />
                  </VUView>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleOnSpam.bind(this, 'inappropriate')}>
                  <VUView
                    width="100%"
                    borderColor="#ccc"
                    py={3}
                    borderBottomWidth={1}
                    flexDirection="row"
                    justifyContent="space-between">
                    <VUText>It's inappropriate</VUText>
                    <FontAwesomeIcon
                      name="chevron-right"
                      color="#666"
                      size={12}
                    />
                  </VUView>
                </TouchableOpacity>
              </VUView>
            </VUView>
          </>
        )}
      </ActionSheet>
    </Controls>
  );
}

export default VideoFeed;
