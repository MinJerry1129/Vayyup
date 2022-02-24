import React, {memo, useEffect, useState, useRef, useCallback} from 'react';
import {
  Platform,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Alert,
  Text,
  Dimensions,
  View,
  ActivityIndicator as ActivityIndicator1,
} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';
import {
  voteVideo,
  unvoteVideo,
  feedVideoViewed,
  getBlocking,
} from 'services/social';
import Share from 'react-native-share';
import {useNavigation} from '@react-navigation/core';
import Toast from 'react-native-simple-toast';
import {numFormatter} from 'src/services/numFormatter';
import {FontAwesomeIcon} from 'src/icons';
import {AntDesignIcon} from 'src/icons';
import {IonIcon} from 'src/icons';
import {followUser, unfollowUser, blockUser} from 'src/services/social';
import firebase from '@react-native-firebase/app';
import CameraRoll from '@react-native-community/cameraroll';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
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
import {Header, BoxAction, TextAction, ContentWrapper} from './styles';
var RNFS = require('react-native-fs');
import {AppStyles, globalStyles} from 'src/AppStyles';
import {setBlockCurrentUser} from 'src/redux/reducers/social.actions';
import moment from 'moment';
import ImageMarker from 'react-native-image-marker';
import ParsedText from 'react-native-parsed-text';
import {EU} from 'react-native-mentions-editor';
import {configKeys} from '../../../services/utility';
import {updateVideo} from 'src/redux/reducers/video.actions';
import {updateFeed} from 'src/redux/reducers/actions';

const {width, height} = Dimensions.get('window');

interface Item {
  id: number;
  username: string;
  tags: string;
  music: string;
  likes: number;
  comments: number;
  uri: string;
}

function Feed({
  onVoting,
  onUnvoting,
  item,
  index,
  focused,
  active,
  type,
  isMyVideos,
  onCommenting,
  onDelete,
  OnViewCount,
  allowVoting,
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [votes, setVotes] = useState(item?.votes);
  const [viewCount, setViewCount] = useState(item?.views);
  const insets = useSafeAreaInsets();
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [countStatus, setCountStatus] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [allowMycompetitionVoting, setAllowMycompetitionVoting] =
    useState(false);
  const [texts, setTexts] = useState(
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset she ",
  );

  const [buffering, setBuffering] = useState(false);
  const muted = useSelector((state) => state.settings.muted);
  const reactions = useSelector((state) =>
    type === 'competition' || type === 'myCompetitionVideos'
      ? state.feeds.reactions
      : state.videos.reactions,
  );

  active = useSelector(({videos}) => videos.active.id === item.id);
  const [userFollowing, setUserFollowing] = useState(false);
  const [users, setUsers] = useState({});
  const [currentUser, following] = useSelector((state) => [
    state.auth.user,
    state.social.following,
  ]);

  const {url, thumbnail, playback = {}, video, videoFileName} = item;
  const {hls, dash} = playback;
  let videoURL = {uri: url};
  if (Platform.OS === 'ios' && hls) {
    videoURL = {uri: hls, type: 'm3u8'};
  }
  if (Platform.OS === 'android' && dash) {
    videoURL = {uri: dash, type: 'mpd'};
  }

  const navigation = useNavigation();
  const {user = {}} = item;

  // Video Player Control
  const videoPlayer = useRef(null);
  const [paused, setPaused] = useState(false);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [playerState, setPlayerState] = useState(PLAYER_STATES.PLAYING);
  const [reported, setReported] = useState(false);
  const actionSheetRef = useRef();
  const [textShown, setTextShown] = useState(false); //To show ur remaining Text
  const [lengthMore, setLengthMore] = useState(false); //to show the "Read more & Less Line"
  const [error, setError] = useState(false);

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
      setPausedByUser(!pausedByUser);
    }
    setPlayerState(paused ? PLAYER_STATES.PLAYING : PLAYER_STATES.PAUSED);
  };

  const onEnd = () => setPlayerState(PLAYER_STATES.ENDED);

  useEffect(async () => {
    await initialLoading();
  }, [reactions, type, item.id, item.votes]);

  useEffect(() => {
    if (item.videoFileName != undefined) {
      if (active && focused) {
        setPaused(false);
        setPausedByUser(false);
        setPlayerState(PLAYER_STATES.PLAYING);
      } else {
        setPaused(true);
        setPausedByUser(true);
        setPlayerState(PLAYER_STATES.PAUSED);
      }
    }
  }, [active, focused]);

  const initialLoading = async () => {
    // console.log('types......',type)

    if (type === 'competition' || type === 'myCompetitionVideos') {
      const reaction = reactions.find((obj) => obj.entryId === item.id);
      // if (active) {

      await firestore()
        .collection('entries')
        .doc(item.id)
        .get()
        .then((obj) => {
          if (obj.exists) {
            const entry = obj.data();
            setVotes(entry.votes);
            setViewCount(entry.views != undefined ? entry.views : 0);
          }
          setVoted(reaction !== undefined);
        });
    } else {
      const reaction = reactions.find((obj) => obj.videoId === item.id);

      await firestore()
        .collection('videos')
        .doc(item.id)
        .get()
        .then((obj) => {
          const entry = obj.data();
          setVotes(entry.votes || 0);
          setViewCount(entry.views != undefined ? entry.views : 0);
          setVoted(reaction !== undefined);
          // console.log('setvotesss',entry.votes);
        });
    }
  };

  const handleVoting = async () => {
    setVoting(true);
    // console.log('voted......',voted);
    if (!voted) {
      setVoted(true);
      setVotes(votes + 1);
      onVoting(item, index);
    } else {
      setVoted(false);
      setVotes(votes - 1);
      onUnvoting(item, index);
    }
    setVoting(false);
  };
  const handleProgress = async (progress) => {
    if (countStatus == true && item.isPublished) {
      setCountStatus(false);
      if (error) {
        setError(false);
      }
      await OnViewCount(item, index);
      await initialLoading();
    }
  };

  const handleLoad = async (progress) => {
    setCountStatus(true);
    // if (type == 'myCompetitionVideos') {
    //   var currentDate = moment().unix();
    //   var voteEnddate = item.competition.hasOwnProperty('voteEndDateTime')
    //     ? item.competition.voteEndDateTime._seconds
    //     : '';
    //   setAllowMycompetitionVoting(currentDate <= voteEnddate);
    //   // var currentDate = moment().unix();
    //   // var voteEnddate = item.competition.voteEndDateTime._seconds;
    //   // setAllowVotingForMyCom(currentDate <= voteEnddate);
    // }
  };

  const onBuffer = (onBufferData) => {
    console.log(' on buffer video', onBufferData);
    // setBuffering(onBufferData.isBuffering);
  };
  const onError = (onErrorData) => {
    setError(true);
  };
  const handleChat = async () => {
    if (onCommenting) {
      await onCommenting();
    }

    navigation.navigate('Comment', {type, item, index});
  };

  const handleSocialShare = async () => {
    const routeType =
      type == ('competition' || 'myCompetitionVideos') ? 'entries' : 'videos';
    const link = await firebase.dynamicLinks().buildShortLink({
      link: `http://vayyup.com/${routeType}/${item.id}`,
      domainUriPrefix: configKeys.domainUriPrefix,
      social: {
        title:
          type === 'competition' || type === 'myCompetitionVideos'
            ? item.competition.title
            : item.title,
        imageUrl:
          videoFileName != null && videoFileName != undefined
            ? item.thumbnail
            : url,
      },
    });

    share(link);
  };
  const share = async (link) => {
    const options = {
      url: link,
    };
    Share.open(options)
      .then((res) => {})
      .catch((err) => {
        err && console.log(err);
      });
  };

  const handleOnFlag = async () => {
    await setShowSheet(true);
    setReported(false);
    actionSheetRef.current?.setModalVisible();
  };

  const handleOnSpam = (reportType) => {
    firestore()
      .collection('reports')
      .doc()
      .set({
        id: item.id,
        collectionName:
          type === 'competition' || type === 'myCompetitionVideos'
            ? 'entries'
            : 'videos',
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
      username: userName = '',
    } = user;
    const {
      id: currentUserId = '',
      fullname: currentUserFullname = '',
      profile: currentUserProfile = '',
      username: currentUserName = '',
    } = currentUser;

    followUser(
      {
        id: userId,
        name: userFullname,
        profile: userProfile,
        username: userName,
      },
      {
        id: currentUserId,
        name: currentUserFullname,
        profile: currentUserProfile,
        username: currentUserName,
      },
    );
  };

  const handleOnUnfollowPressed = () => {
    const user = {...item.user, id: item.uid};
    const {
      id: userId = '',
      name: userFullname = '',
      profile: userProfile = '',
      username: userName = '',
    } = user;
    const {
      id: currentUserId = '',
      fullname: currentUserFullname = '',
      profile: currentUserProfile = '',
      username: currentUserName = '',
    } = currentUser;
    unfollowUser(
      {
        id: userId,
        name: userFullname,
        profile: userProfile,
        username: userName,
      },
      {
        id: currentUserId,
        name: currentUserFullname,
        profile: currentUserProfile,
        username: currentUserName,
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
      if (videoFileName != null) {
        const path = `${RNFS.CachesDirectoryPath}/${videoFileName}`;
        const reference = storage().ref(video);
        await reference.writeToFile(path);
        await CameraRoll.save(path, {type: 'video'});
        Toast.show('Video saved into gallery.', Toast.LONG);
      } else {
        const watermarkURL =
          'https://firebasestorage.googleapis.com/v0/b/vayyup-app.appspot.com/o/vayy-up.png?alt=media&token=9c319671-021a-43e3-ba45-a281d7094cb6';

        await ImageMarker.markImage({
          src: url,
          markerSrc: watermarkURL,
          position: 'topRight', // topLeft, topCenter,topRight, bottomLeft, bottomCenter , bottomRight, center
          scale: 1,
          markerScale: 0.5,
          quality: 100,
        })
          .then(async (path) => {
            await CameraRoll.save(path, {type: 'photo'});
            Toast.show('Image added to gallery.', Toast.LONG);
          })
          .catch((err) => {
            console.log(err, 'err');
          });
      }
    } catch (error) {}
    setDownloading(false);
  };
  const handleOnDeleteAlert = (collectionName) => {
    Alert.alert('', 'Are you sure you want to delete? ', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },

      {text: 'OK', onPress: () => handleOnDelete(collectionName)},
    ]);
  };
  const handleOnDelete = async (collectionName) => {
    var isImage =
      type == 'myVideos'
        ? item.isImage != undefined && item.isImage == true
          ? true
          : false
        : false;

    setDeleting(true);
    await firestore().collection(collectionName).doc(item.id).delete();
    setTimeout(() => {
      setDeleting(false);
      onDelete(isImage, item.id);
    }, 5000);
  };

  const onTextLayout = useCallback((e) => {
    const {lines} = e.nativeEvent;
    setLengthMore(
      Platform.OS === 'ios'
        ? e.nativeEvent.lines.length >= 2
        : e.nativeEvent.lines.length > 1,
    ); //to check the text is more than 1 lines or not
  }, []);

  const handleNextPressed = () => {
    navigation.navigate('Preview', {
      item,
      type,
    });
  };

  const setBlockUser = async () => {
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
    await blockUser(
      {id: userId, name: userFullname, profile: userProfile},
      {
        id: currentUserId,
        name: currentUserFullname,
        profile: currentUserProfile,
      },
    );
    if (following.find((obj) => obj.id === item.uid) != undefined) {
      await unfollowUser(
        {id: userId, name: userFullname, profile: userProfile},
        {
          id: currentUserId,
          name: currentUserFullname,
          profile: currentUserProfile,
        },
      );
    }
    let RandomNumber = Math.floor(Math.random() * 10000) + 1;

    // onChangeVideoBlock()
    dispatch(setBlockCurrentUser(RandomNumber));
    Toast.show(
      item.user.name +
        ' blocked \n You can unblock the user anytime from the user profile',
      Toast.LONG,
    );
  };

  const createBlockUserAlert = () => {
    setShowSheet(false);
    if (item.uid != currentUser.id) {
      Alert.alert(
        'Are you sure you want to block this user?',
        'By blocking this user you will not be able to see any further updates from this account',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {text: 'OK', onPress: setBlockUser},
        ],
      );
    }
  };

  const handleUserProfilePressedFromTitle = async (item) => {
    let reg = /@\[([^\]]+?)\]\(id:([^\]]+?)\)/gim;
    let indexes = [];
    let match;
    while ((match = reg.exec(item))) {
      indexes.push({
        username: match[1],
        id: match[2],
        type: EU.specialTagsEnum.mention,
      });
    }

    navigation.navigate('UserProfile', {
      userId: indexes[0]?.id,
      showBack: true,
    });
  };

  const renderText = (matchingString, matches) => {
    let reg = /@\[([^\]]+?)\]\(id:([^\]]+?)\)/gim;
    let indexes = [];
    let match;
    while ((match = reg.exec(matchingString))) {
      indexes.push({
        start: match.index,
        end: reg.lastIndex - 1,
        username: match[1],
        id: match[2],
        type: EU.specialTagsEnum.mention,
      });
    }
    return '@' + indexes[0]?.username;
  };

  if (loading) {
    return (
      <Overlay>
        <ActivityIndicator />
      </Overlay>
    );
  }

  // if (!focused || !active) {
  //   return (
  //     <VUView flex={1}>
  //       <ContentWrapper>
  //         {item.videoFileName == undefined ? (
  //           // <VUImage
  //           //   source={{ uri: item.url }}
  //           //   height="100%"
  //           //   width="100%"
  //           //   resizeMode="contain"
  //           // />
  //           <View />
  //         ) : (
  //           <VUImage
  //             source={{ uri: thumbnail }}
  //             height="100%"
  //             width="100%"
  //             resizeMode="contain"
  //           />
  //         )}
  //       </ContentWrapper>
  //     </VUView>
  //   );
  // }

  return (
    <VUView height={height}>
      <ContentWrapper>
        <>
          <TouchableOpacity
            activeOpacity={1}
            style={[StyleSheet.absoluteFill]}
            backgroundColor="transparent"
            onPress={onPaused}>
            {focused &&
              (active ? (
                videoFileName != null ? (
                  <VUVideo
                    flex={1}
                    ref={videoPlayer}
                    onEnd={onEnd}
                    poster={thumbnail}
                    paused={paused}
                    muted={muted}
                    onProgress={handleProgress}
                    onLoad={handleLoad}
                    source={videoURL}
                    volume={10}
                    repeat={true}
                    resizeMode={'contain'}
                    posterResizeMode={'contain'}
                    onBuffer={onBuffer}
                    onError={onError}
                    ignoreSilentSwitch="ignore"
                    minBufferMs={300}
                  />
                ) : (
                  <VUImage
                    source={{uri: url}}
                    height="100%"
                    width="100%"
                    onLoad={handleLoad}
                    onLoadEnd={handleProgress}
                    resizeMode="contain"
                  />
                )
              ) : (
                <VUImage
                  source={{uri: thumbnail}}
                  height="100%"
                  width="100%"
                  resizeMode="contain"
                />
              ))}

            {/* {error &&
              <VUView style={{
                position: 'absolute',
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
                zIndex: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
              }}>
                <VUText style={{
                  fontFamily: AppStyles.fontName.robotoRegular,
                  color: '#fff',
                  fontSize: 18
                }}>
                  Video No Longer Available
                </VUText>
              </VUView>
            } */}

            {paused &&
              (type != 'competition' || type != 'myCompetitionVideos'
                ? item.isImage
                  ? false
                  : true
                : true) == true && (
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
        {
          <>
            <Header
              right="0px"
              bottom={
                type === 'competition'
                  ? '120px'
                  : Platform.OS === 'ios'
                  ? '160px'
                  : '90px'
              }>
              <VUView
                height="100%"
                flexDirection="column"
                justifyContent="space-between">
                {viewCount != undefined && item.isPublished && (
                  <VUView>
                    <BoxAction>
                      <VUImage
                        width={40}
                        height={40}
                        resizeMode="contain"
                        source={require('src/../assets/feed/eye.png')}
                      />
                      <VUView px={10} alignItems="center">
                        <TextAction>
                          {numFormatter(parseInt(viewCount))}
                        </TextAction>
                      </VUView>
                    </BoxAction>
                  </VUView>
                )}
                {onVoting &&
                  (item.isPublished == true ? (
                    <VUView>
                      {voting ? (
                        <ActivityIndicator color="#fff" animating={true} />
                      ) : (
                        <BoxAction
                          // disabled={
                          //   type === 'competition'
                          //     ? allowVoting
                          //       ? false
                          //       : true
                          //     : type === 'myCompetitionVideos'
                          //     ? allowMycompetitionVoting
                          //       ? false
                          //       : true
                          //     : false
                          // }
                          onPress={handleVoting}>
                          {type === 'competition' ||
                          type === 'myCompetitionVideos' ? (
                            voted ? (
                              <VUImage
                                width={38}
                                height={38}
                                resizeMode="contain"
                                // opacity={
                                //   (
                                //     type === 'competition'
                                //       ? allowVoting
                                //       : allowMycompetitionVoting
                                //   )
                                //     ? 1
                                //     : 0.4
                                // }
                                source={require('src/../assets/feed/voteFilled.png')}
                              />
                            ) : (
                              <VUImage
                                width={38}
                                height={38}
                                resizeMode="contain"
                                // opacity={
                                //   (
                                //     type === 'competition'
                                //       ? allowVoting
                                //       : allowMycompetitionVoting
                                //   )
                                //     ? 1
                                //     : 0.4
                                // }
                                source={require('src/../assets/feed/vote.png')}
                              />
                            )
                          ) : //heart..............
                          voted ? (
                            <VUImage
                              width={34}
                              height={34}
                              resizeMode="contain"
                              source={require('src/../assets/feed/heartFilled.png')}
                            />
                          ) : (
                            <VUImage
                              width={34}
                              height={34}
                              resizeMode="contain"
                              source={require('src/../assets/feed/heart.png')}
                            />
                          )}
                          <VUView px={10} alignItems="center">
                            <TextAction>
                              {votes != undefined
                                ? numFormatter(parseInt(votes))
                                : ''}
                            </TextAction>
                          </VUView>
                        </BoxAction>
                      )}
                    </VUView>
                  ) : null)}
                {item.isPublished == true ? (
                  <BoxAction onPress={handleChat}>
                    <VUImage
                      width={34}
                      height={34}
                      resizeMode="contain"
                      source={require('src/../assets/feed/chat.png')}
                    />
                    <VUView px={10} alignItems="center">
                      <TextAction>
                        {' '}
                        {numFormatter(parseInt(item.comments))}
                      </TextAction>
                    </VUView>
                  </BoxAction>
                ) : null}
                {item.isPublished == true ? (
                  <BoxAction onPress={handleSocialShare}>
                    <VUImage
                      width={34}
                      height={34}
                      resizeMode="contain"
                      source={require('src/../assets/feed/share.png')}
                    />
                  </BoxAction>
                ) : null}
                {!isMyVideos && (
                  <BoxAction onPress={handleOnFlag}>
                    <VUImage
                      width={32}
                      height={32}
                      resizeMode="contain"
                      source={require('src/../assets/feed/report.png')}
                    />
                  </BoxAction>
                )}

                {isMyVideos && (
                  <>
                    {downloading ? (
                      <ActivityIndicator color="#fff" animating={true} />
                    ) : (
                      <BoxAction onPress={handleOnDownload}>
                        <VUImage
                          width={34}
                          height={34}
                          resizeMode="contain"
                          source={require('src/../assets/feed/downloads.png')}
                        />
                      </BoxAction>
                    )}
                  </>
                )}
                {isMyVideos && type === 'myVideos' && (
                  <>
                    {deleting ? (
                      <ActivityIndicator color="#fff" animating={true} />
                    ) : (
                      <BoxAction onPress={() => handleOnDeleteAlert('videos')}>
                        <VUImage
                          width={34}
                          height={34}
                          resizeMode="contain"
                          source={require('src/../assets/feed/delete.png')}
                        />
                      </BoxAction>
                    )}
                  </>
                )}

                {isMyVideos &&
                  type === 'myCompetitionVideos' &&
                  !item.isPublished && (
                    <>
                      {deleting ? (
                        <ActivityIndicator color="#fff" animating={true} />
                      ) : (
                        <BoxAction
                          onPress={() => handleOnDeleteAlert('entries')}>
                          <VUImage
                            width={34}
                            height={34}
                            resizeMode="contain"
                            source={require('src/../assets/feed/delete.png')}
                          />
                        </BoxAction>
                      )}
                    </>
                  )}
              </VUView>
            </Header>
            <Header
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: Platform.OS === 'ios' ? '12%' : '8%',
              }}>
              <VUView flex={1}>
                <VUView
                  flexDirection="row"
                  alignItems="center"
                  ml={2}
                  width="100%">
                  <VUTouchableOpacity onPress={handleUserProfilePressed}>
                    <VUView mr={2}>
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
                    </VUView>
                  </VUTouchableOpacity>
                  <VUView flex={1}>
                    <VUView flexDirection="row" alignItems="center">
                      <VUTouchableOpacity
                        flexDirection="row"
                        onPress={handleUserProfilePressed}>
                        <VUText
                          color="#fff"
                          fontSize={12}
                          fontFamily={AppStyles.fontName.robotoBold}
                          style={{
                            textShadowColor: 'grey',
                            textShadowOffset: {width: 0.5, height: 0.5},
                            textShadowRadius: 1,
                          }}
                          color={AppStyles.color.grayText}>
                          {item.user.hasOwnProperty('username') &&
                          item.user.username != ''
                            ? `@${item.user.username}`
                            : `${item.user.name}`}
                        </VUText>
                        {item.isVerified && (
                          <VUImage
                            width={18}
                            height={18}
                            resizeMode="contain"
                            source={require('src/../assets/feed/verified.png')}
                          />
                        )}
                      </VUTouchableOpacity>

                      {item.uid != currentUser.id &&
                        (followLoading ? (
                          <ActivityIndicator color="#E9326D" animating={true} />
                        ) : following.find((obj) => obj.id === item.uid) !=
                          undefined ? (
                          <VUTouchableOpacity
                            borderColor={AppStyles.color.white}
                            ml={2}
                            borderWidth={1}
                            borderRadius={24}
                            width={70}
                            height={20}
                            onPress={handleOnUnfollowPressed}>
                            <VUText
                              textAlign="center"
                              fontSize={12}
                              fontFamily={AppStyles.fontName.robotoRegular}
                              color={AppStyles.color.white}>
                              Unfollow
                            </VUText>
                          </VUTouchableOpacity>
                        ) : (
                          <VUTouchableOpacity
                            borderColor={AppStyles.color.white}
                            ml={2}
                            borderWidth={1}
                            borderRadius={24}
                            width={60}
                            height={20}
                            onPress={handleOnFollowPressed}>
                            <VUText
                              textAlign="center"
                              fontSize={12}
                              fontFamily={AppStyles.fontName.robotoRegular}
                              color={AppStyles.color.white}>
                              Follow
                            </VUText>
                          </VUTouchableOpacity>
                        ))}
                      {isMyVideos && !item.isPublished && (
                        <VUView ml={2}>
                          <VUTouchableOpacity
                            onPress={handleNextPressed}
                            px={2}
                            py={0.8}
                            width="100%"
                            backgroundColor={AppStyles.color.btnColor}
                            borderRadius={24}>
                            <VUText
                              fontFamily={AppStyles.fontName.robotoRegular}
                              color="#fff"
                              textAlign="center">
                              Upload
                            </VUText>
                          </VUTouchableOpacity>
                        </VUView>
                      )}
                    </VUView>
                  </VUView>
                </VUView>

                <VUView ml={2} pt={1} width="85%">
                  {/* <VUText
                    onTextLayout={onTextLayout}
                    numberOfLines={textShown ? undefined : Platform.OS === "ios" ? 2 : 1}
                    fontSize={12}
                    color={AppStyles.color.grayText}
                    style={{
                      fontSize: 12,
                      fontFamily: AppStyles.fontName.robotoRegular,
                      color: AppStyles.color.grayText,
                      textShadowColor: 'grey',
                      textShadowOffset: {width: 0.5, height: 0.5},
                      textShadowRadius: 1,
                    }}>
                    {item.title}
                  </VUText> */}
                  <ParsedText
                    style={{
                      fontSize: 12,
                      fontFamily: AppStyles.fontName.robotoRegular,
                      color: AppStyles.color.grayText,
                      textShadowColor: 'grey',
                      textShadowOffset: {width: 0.5, height: 0.5},
                      textShadowRadius: 1,
                    }}
                    parse={[
                      {
                        pattern: /@\[([^\]]+?)\]\(id:([^\]]+?)\)/gim,
                        style: {
                          fontFamily: AppStyles.fontName.robotoBold,
                          color: 'white',
                        },
                        onPress: (res) =>
                          handleUserProfilePressedFromTitle(res),
                        renderText: renderText,
                      },
                    ]}
                    childrenProps={{allowFontScaling: false}}
                    onTextLayout={onTextLayout}
                    numberOfLines={
                      textShown ? undefined : Platform.OS === 'ios' ? 2 : 1
                    }>
                    {item.title}
                  </ParsedText>
                  {lengthMore ? (
                    <VUText
                      onPress={toggleNumberOfLines}
                      fontSize={12}
                      color={AppStyles.color.btnColor}
                      style={globalStyles.moreLesstext}>
                      {textShown ? 'less' : 'more'}
                    </VUText>
                  ) : null}
                </VUView>
              </VUView>
            </Header>
          </>
        }
      </ContentWrapper>
      {showSheet && (
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
                    intellectual property infringement. Our team will review
                    your feedback within 24hours and takes appropirate action
                    after it is verified.
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
                  <TouchableOpacity onPress={createBlockUserAlert}>
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
      )}
    </VUView>
  );
}

export default memo(Feed);
