import React, { PureComponent,createRef} from 'react';
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
import Share from 'react-native-share';
import { useNavigation } from '@react-navigation/core';
import Toast from 'react-native-simple-toast';
import { numFormatter } from 'src/services/numFormatter';
import { FontAwesomeIcon } from 'src/icons';
import { AntDesignIcon } from 'src/icons';
import { IonIcon } from 'src/icons';
import { followUser, unfollowUser, blockUser } from 'src/services/social';
import firebase from '@react-native-firebase/app';
import CameraRoll from '@react-native-community/cameraroll';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { Header, BoxAction, TextAction, ContentWrapper } from './styles';
var RNFS = require('react-native-fs');
import { AppStyles, globalStyles } from 'src/AppStyles';
import { setBlockCurrentUser } from 'src/redux/reducers/social.actions';
import moment from 'moment';
import ImageMarker from 'react-native-image-marker';
import ParsedText from 'react-native-parsed-text';
import { EU } from 'react-native-mentions-editor';
import { configKeys } from '../../../services/utility';
import { updateVideo } from 'src/redux/reducers/video.actions';
import { updateFeed } from 'src/redux/reducers/actions';
import Video from 'react-native-video';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
class Feed extends PureComponent {
  constructor(props) {
    super(props);
   this.videoPlayer = createRef(null);


    this.state = {
      loading: false,
      votes: this.props.item.votes,
      viewCount: this.props.item.views,
      voted: false,
      voting: false,
      downloading: false,
      deleting: false,
      countStatus: false,
      followLoading: false,
      showSheet: false,
      buffering: false,
      user: this.props.item.user,
      paused: false,
      pausedByUser: false,
      playerState: PLAYER_STATES.PLAYING,
      reported: false,
      textShown: false,
      lengthMore: false,
      error: false,
      videoURL: null,
      video: this.props.item.video,
      videoFileName: this.props.item.videoFileName,
      showVideo: false,
    };
    this.reactions;
    
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.focused !== this.props.focused) {
      if (this.props.currentIndex == this.props.index) {
        this.setState({
          paused: this.props.focused ? false : true,
          pausedByUser: this.props.focused ? false : true,
          playerState: !this.props.focused ? PLAYER_STATES.PAUSED : PLAYER_STATES.PLAYING,
          videoFileName: null
        }, () => {
          this.setState({
            videoFileName: this.props.item.videoFileName
          })
        })
      }
    }
    if (prevProps.appState !== this.props.appState) {
      
      if (this.props.currentIndex == this.props.index) {
        this.setState({
          paused: this.props.appState ? false : true,
          pausedByUser: this.props.appState ? false : true,
          playerState: !this.props.appState ? PLAYER_STATES.PAUSED : PLAYER_STATES.PLAYING,
          videoFileName: null
        }, () => {
          this.setState({
            videoFileName: this.props.appState ? this.props.item.videoFileName : null
          })
        })
      }
    }
  };

  componentDidMount = () => {
    const { playback = {} } = this.props.item;
    const { hls, dash } = playback;
    if (Platform.OS == 'android') {

      this.setState({
        videoURL: { uri: dash, type: 'mpd' }
      })
    }
    else {
      this.setState({
        videoURL: { uri: hls, type: 'm3u8' }
      })
    }
    this.reactions = this.props?.type == 'competition' || this.props?.type == 'myCompetitionVideos' ? this.props.feeds.reactions : this.props.videos.reactions
    this.initialLoading();
  };

  componentWillUnmount() {
    this.videoPlayer = null;
  }


  toggleNumberOfLines() {
    this.setState({
      textShown: !this.state.textShown
    })
  }

  onPaused() {
    if (this.state.paused && this.state.playerState === PLAYER_STATES.ENDED) {
      this.videoPlayer.seek(0);
    }
    else {
      this.setState({
        paused: !this.state.paused,
        pausedByUser: !this.state.pausedByUser,
        playerState: !this.state.paused ? PLAYER_STATES.PLAYING : PLAYER_STATES.PAUSED
      })
    }
  }

  initialLoading() {
    if (this.props?.type === 'competition' || this.props?.type === 'myCompetitionVideos') {

      const reaction = this.reactions.find((obj) => obj.entryId === this.props.item.id);

      firestore()
        .collection('entries')
        .doc(this.props.item.id)
        .get()
        .then((obj) => {
          if (obj.exists) {
            const entry = obj.data();
            this.setState({
              votes: entry.votes,
              viewCount: entry.views != undefined ? entry.views : 0
            })
          }
          this.setState({
            voted: reaction !== undefined
          })
        });
    } else {
      const reaction = this.reactions.find((obj) => obj.videoId === this.props.item.id);

      firestore()
        .collection('videos')
        .doc(this.props.item.id)
        .get()
        .then((obj) => {
          const entry = obj.data();
          this.setState({
            votes: entry.votes || 0,
            viewCount: entry.views != undefined ? entry.views : 0,
            voted: reaction !== undefined
          })
        });
    }
  }

  handleVoting() {
    this.setState({ voting: true });
    if (!this.state.voted) {
      this.setState({
        voted: true,
        votes: this.state.votes + 1
      }, () => {
        this.props.onVoting(this.props.item, this.props.index);
      })
    } else {
      this.setState({
        voted: false,
        votes: this.state.votes - 1
      }, () => {
        this.props.onUnvoting(this.props.item, this.props.index);
      })
    }
    this.setState({ voting: false })
  }

  handleProgress = async (progress) => {
    if (this.state.countStatus && this.props.item.isPublished) {
      this.setState({
        countStatus: false,
        error: false
      })
      await this.props.OnViewCount(this.props.item, this.props.index);
      await this.initialLoading();
    }
  }

  onEnd = () => {
    this.setState({
      playerState: PLAYER_STATES.ENDED
    })
  }

  handleLoad = async (progress) => {
    this.setState({
      countStatus: true,
      showVideo: progress?.duration ? true : false
    })
  }

  onBuffer = (onBufferData) => {
    this.setState({
      buffering: onBufferData.isBuffering
    })
  }

  onError = (errorData) => {
    this.setState({
      error: true
    })
  }

 
  handleChat = async() => {
    if (this.props.onCommenting) {
      await this.props.onCommenting();
    }

    this.props.navigation.navigate('Comment', {
      type: this.props.type,
      item: this.props.item,
      index: this.props.index,
    });
   
  };

  handleSocialShare = async () => {
    let item = this.props.item;
    const routeType =
      this.props?.type == ('competition' || 'myCompetitionVideos') ? 'entries' : 'videos';
    const link = await firebase.dynamicLinks().buildShortLink({
      link: `http://vayyup.com/${routeType}/${item.id}`,
      domainUriPrefix: configKeys.domainUriPrefix,
      social: {
        title:
          this.props?.type === 'competition' || this.props?.type === 'myCompetitionVideos'
            ? item.competition.title
            : item.title,
        imageUrl:
          this.state.videoFileName != null && this.state.videoFileName != undefined
            ? item.thumbnail
            : item.url,
      },
    });

    this.share(link);
  };

  share = async link => {
    const options = {
      url: link,
    };
    Share.open(options)
      .then(res => { })
      .catch(err => {
        err && console.log(err);
      });
  };

  handleOnFlag = async () => {
    this.setState({
      showSheet: true,
      reported: false
    }, () => {
      // actionSheetRef.current?.setModalVisible();
      this.actionSheetRef.setModalVisible();
    })
  };

  handleOnSpam = reportType => {
    let item = this.props.item;
    firestore()
      .collection('reports')
      .doc()
      .set({
        id: item.id,
        collectionName:
          this.props?.type === 'competition' || this.props?.type === 'myCompetitionVideos'
            ? 'entries'
            : 'videos',
        reportedUser: firebase.auth().currentUser.uid,
        itemUser: item.uid,
        type: reportType,
        date: firebase.firestore.FieldValue.serverTimestamp(),
      });
    this.setState({
      reported: true
    });
  };

  handleUserProfilePressed = async () => {
    this.props.navigation.navigate('UserProfile', {
      user: { ...this.props.item.user, id: this.props.item.uid },
      showBack: true,
    });
  };

  handleOnFollowPressed = async () => {
    const user = { ...this.props.item.user, id: this.props.item.uid };
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
    } = this.props.user;

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

  handleOnUnfollowPressed = () => {
    const user = { ...this.props.item.user, id: this.props.item.uid };
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
    } = this.props.user;

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

  async hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  handleOnDownload = async () => {
    if (Platform.OS === 'android' && !(await this.hasAndroidPermission())) {
      return;
    }
    this.setState({
      downloading: true
    })
    // Currently we don't use any other format.
    try {
      if (this.state.videoFileName != null) {
        const path = `${RNFS.CachesDirectoryPath}/${this.state.videoFileName}`;
        const reference = storage().ref(this.state.video);
        await reference.writeToFile(path);
        await CameraRoll.save(path, { type: 'video' });
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
          .then(async path => {
            await CameraRoll.save(path, { type: 'photo' });
            Toast.show('Image added to gallery.', Toast.LONG);
          })
          .catch(err => {
            console.log(err, 'err');
          });
      }
    } catch (error) { }
    this.setState({
      downloading: false
    })
  };

  handleOnDeleteAlert = collectionName => {
    Alert.alert('', 'Are you sure you want to delete? ', [
      {
        text: 'Cancel',
        onPress: () => { },
        style: 'cancel',
      },

      { text: 'OK', onPress: () => this.handleOnDelete(collectionName) },
    ]);
  };

  handleOnDelete = async collectionName => {
    let item = this.props.item;
    var isImage =
      this.props?.type == 'myVideos'
        ? item.isImage != undefined && item.isImage == true
          ? true
          : false
        : false;

    this.setState({
      deleting: true
    })
    await firestore()
      .collection(collectionName)
      .doc(item.id)
      .delete();
    setTimeout(() => {
      this.setState({
        deleting: false
      })
      this.props.onDelete(isImage, item.id);
    }, 5000);
  };

  onTextLayout = (e) => {
    const { lines } = e.nativeEvent;
    this.setState({
      lengthMore: Platform.OS === 'ios'
        ? e.nativeEvent.lines.length >= 2
        : e.nativeEvent.lines.length > 1,
    })
    //to check the text is more than 1 lines or not
  };

  handleNextPressed = () => {
    let item = this.props.item;
    let type = this.props?.type;

    this.props.navigation.navigate('Preview', {
      item,
      type,
    });
  };

  setBlockUser = async () => {
    let item = this.props.item;
    // const user = { ...this.props.item.user, id: item.uid };
    const user = { ...this.props.item.user, id: this.props.item.uid };
    const {
      id: userId = '',
      name: userFullname = '',
      profile: userProfile = '',
    } = user;
    const {
      id: currentUserId = '',
      fullname: currentUserFullname = '',
      profile: currentUserProfile = '',
    } = this.props.user;
    await blockUser(
      { id: userId, name: userFullname, profile: userProfile },
      {
        id: currentUserId,
        name: currentUserFullname,
        profile: currentUserProfile,
      },
    );
    if (this.props.following.find((obj) => obj.id === item.uid) != undefined) {
      await unfollowUser(
        { id: userId, name: userFullname, profile: userProfile },
        {
          id: currentUserId,
          name: currentUserFullname,
          profile: currentUserProfile,
        },
      );
    }
    let randomNumber = Math.floor(Math.random() * 10000) + 1;
    this.props.setBlockCurrentUser(randomNumber);
    Toast.show(
      this.props?.item?.user?.name +
      ' blocked \n You can unblock the user anytime from the user profile',
      Toast.LONG,
    );
  };

  createBlockUserAlert = () => {
    let item = this.props.item;
    this.setState({
      showSheet: false
    })
    if (item.uid != this.props.user.id) {
      Alert.alert(
        'Are you sure you want to block this user?',
        'By blocking this user you will not be able to see any further updates from this account',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: this.setBlockUser() },
        ],
      );
    }
  };

  handleUserProfilePressedFromTitle = async item => {
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

    this.props.navigation.navigate('UserProfile', {
      userId: indexes[0]?.id,
      showBack: true,
    });
  };

  renderText = (matchingString, matches) => {
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

  render() {
    return (
      <VUView flex={1}>
        <ContentWrapper>
          <>
            {/* {(this.props.currentIndex == this.props.index) && */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[StyleSheet.absoluteFill]}
                backgroundColor="transparent"
                onPress={() => this.onPaused()}>
                {(
                  this.state.videoFileName != null ? (
                    <>
                      {this.state.videoURL != null &&
                        <Video
                          flex={1}
                          style={{
                            width: '100%',
                            height: '100%'
                          }}
                          ref={refs => this.videoPlayer = refs}
                          onEnd={this.onEnd}
                          poster={this.props.item.thumbnail}
                          paused={this.state.paused}
                          muted={this.state.muted}
                          onProgress={this.handleProgress}
                          onLoad={this.handleLoad}
                          source={this.state.videoURL}
                          volume={10}
                          playInBackground={false}
                          playWhenInactive={false}
                          repeat={true}
                          resizeMode={'contain'}
                          posterResizeMode={'contain'}
                          onBuffer={this.onBuffer}
                          onError={this.onError}
                          ignoreSilentSwitch="obey"
                          bufferConfig={{
                            minBufferMs: 2000,
                            maxBufferMs: 8000,
                            bufferForPlaybackMs: 2000,
                            bufferForPlaybackAfterRebufferMs: 2000
                          }}
                        />
                      }
                      {this.state.error &&
                        <VUText style={{
                          fontSize: 18,
                          fontFamily: AppStyles.fontName.robotoRegular,
                          color: '#fff',
                          position: 'absolute',
                          top: '45%',
                          width: '100%',
                          textAlign: 'center'
                        }}>
                          Video no longer available
                        </VUText>
                      }
                    </>
                  ) : (
                    <VUImage
                      source={{ uri: this.props.item.url }}
                      height="100%"
                      width="100%"
                      onLoad={this.handleLoad}
                      onLoadEnd={this.handleProgress}
                      resizeMode="contain"
                    />
                  )
                )}

                {/* <VUView
                      alignItems="center"
                      justifyContent="flex-start"
                      position="absolute"
                      p={2}
                      style={[StyleSheet.absoluteFill]}>
                      <VUView flexDirection='row' alignItems='center' justifyContent='center'>
                         <VUText fontFamily={AppStyles.fontName.robotoBold} letterSpacing={0.5} mr={2} color={AppStyles.color.white} fontSize={14}>Videos for you</VUText>
                         <VUView height={20} width={2} backgroundColor= {AppStyles.color.white} />
                         <VUText fontFamily={AppStyles.fontName.robotoRegular} ml={2} color={"#C4C4C4"} fontSize={14}>Following</VUText>
                      </VUView>
                    </VUView> */}
                {(!this.state.error && this.state.buffering) &&
                  <View style={{
                    position: 'absolute',
                    top: '3%',
                    left: '3%',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ActivityIndicator1 color="#fff" animating={true} size={12} />
                  </View>
                }
                {this.state.pausedByUser &&
                  (this.props?.type != 'competition' || this.props?.type != 'myCompetitionVideos'
                    ? this.props.item.isImage
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
            {/* } */}
          </>
          {(
            <>
              <Header
                right="0px"
                bottom={
                  this.props?.type === 'competition'
                    ? '120px'
                    : Platform.OS === 'ios'
                      ? '160px'
                      : '90px'
                }>
                <VUView
                  height="100%"
                  flexDirection="column"
                  justifyContent="space-between">
                  {this.state.viewCount != undefined && this.props.item.isPublished && (
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
                            {numFormatter(parseInt(this.state.viewCount))}
                          </TextAction>
                        </VUView>
                      </BoxAction>
                    </VUView>
                  )}
                  {this.props.onVoting &&
                    (this.props.item.isPublished == true ? (
                      <VUView>
                        {this.state.voting ? (
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
                            onPress={() => this.handleVoting()}>
                            {this.props?.type === 'competition' ||
                              this.props?.type === 'myCompetitionVideos' ? (
                              this.state.voted ? (
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
                            ) : this.state.voted ? (
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
                                {numFormatter(parseInt(this.state.votes))}
                              </TextAction>
                            </VUView>
                          </BoxAction>
                        )}
                      </VUView>
                    ) : null)}
                  {this.props.item.isPublished == true ? (
                    <BoxAction onPress={() =>this.handleChat()}>
                      <VUImage
                        width={34}
                        height={34}
                        resizeMode="contain"
                        source={require('src/../assets/feed/chat.png')}
                      />
                      <VUView px={10} alignItems="center">
                        <TextAction>
                          {' '}
                          {numFormatter(parseInt(this.props.item.comments))}
                        </TextAction>
                      </VUView>
                    </BoxAction>
                  ) : null}
                  {this.props.item.isPublished == true ? (
                    <BoxAction onPress={() => this.handleSocialShare()}>
                      <VUImage
                        width={34}
                        height={34}
                        resizeMode="contain"
                        source={require('src/../assets/feed/share.png')}
                      />
                    </BoxAction>
                  ) : null}
                  {!this.props.isMyVideos && (
                    <BoxAction onPress={() => this.handleOnFlag()}>
                      <VUImage
                        width={32}
                        height={32}
                        resizeMode="contain"
                        source={require('src/../assets/feed/report.png')}
                      />
                    </BoxAction>
                  )}

                  {this.props.isMyVideos && (
                    <>
                      {this.state.downloading ? (
                        <ActivityIndicator color="#fff" animating={true} />
                      ) : (
                        <BoxAction onPress={() => this.handleOnDownload()}>
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
                  {this.props.isMyVideos && this.props?.type === 'myVideos' && (
                    <>
                      {this.state.deleting ? (
                        <ActivityIndicator color="#fff" animating={true} />
                      ) : (
                        <BoxAction onPress={() => this.handleOnDeleteAlert('videos')}>
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

                  {this.props.isMyVideos &&
                    this.props?.type === 'myCompetitionVideos' &&
                    !this.props.item.isPublished && (
                      <>
                        {this.state.deleting ? (
                          <ActivityIndicator color="#fff" animating={true} />
                        ) : (
                          <BoxAction
                            onPress={() => this.handleOnDeleteAlert('entries')}>
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
                    <VUTouchableOpacity onPress={() => this.handleUserProfilePressed()}>
                      <VUView mr={2}>
                        {this.props.item.user.profile ? (
                          <VUImage
                            size={40}
                            source={{ uri: this.props.item.user.profile }}
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
                          onPress={() => this.handleUserProfilePressed()}>
                          <VUText
                            color="#fff"
                            fontSize={12}
                            fontFamily={AppStyles.fontName.robotoBold}
                            style={{
                              textShadowColor: 'grey',
                              textShadowOffset: { width: 0.5, height: 0.5 },
                              textShadowRadius: 1,
                            }}
                            color={AppStyles.color.grayText}>
                            {this.props.item.user.hasOwnProperty('username') &&
                              this.props.item.user.username != ''
                              ? `@${this.props.item.user.username}`
                              : `${this.props.item.user.name}`}
                          </VUText>
                          {this.props.item.isVerified && (
                            <VUImage
                              width={18}
                              height={18}
                              resizeMode="contain"
                              source={require('src/../assets/feed/verified.png')}
                            />
                          )}
                        </VUTouchableOpacity>

                        {this.props.item.uid != this.props.user.id &&
                          (this.state.followLoading ? (
                            <ActivityIndicator color="#E9326D" animating={true} />
                          ) : this.props.following.find(obj => obj.id === this.props.item.uid) !=
                            undefined ? (
                            <VUTouchableOpacity
                              borderColor={AppStyles.color.white}
                              ml={2}
                              borderWidth={1}
                              borderRadius={24}
                              width={70}
                              height={20}
                              onPress={() => this.handleOnUnfollowPressed()}>
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
                              onPress={() => this.handleOnFollowPressed()}>
                              <VUText
                                textAlign="center"
                                fontSize={12}
                                fontFamily={AppStyles.fontName.robotoRegular}
                                color={AppStyles.color.white}>
                                Follow
                              </VUText>
                            </VUTouchableOpacity>
                          ))}
                        {this.props.isMyVideos && !this.props.item.isPublished && (
                          <VUView ml={2}>
                            <VUTouchableOpacity
                              onPress={() => this.handleNextPressed()}
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
                        textShadowOffset: { width: 0.5, height: 0.5 },
                        textShadowRadius: 1,
                      }}
                      parse={[
                        {
                          pattern: /@\[([^\]]+?)\]\(id:([^\]]+?)\)/gim,
                          style: {
                            fontFamily: AppStyles.fontName.robotoBold,
                            color: 'white',
                          },
                          onPress: res => handleUserProfilePressedFromTitle(res),
                          renderText: this.renderText(),
                        },
                      ]}
                      childrenProps={{ allowFontScaling: false }}
                      onTextLayout={this.onTextLayout}
                      numberOfLines={
                        this.state.textShown ? undefined : Platform.OS === 'ios' ? 2 : 1
                      }>
                      {this.props.item.title}
                    </ParsedText>
                    {this.state.lengthMore ? (
                      <VUText
                        onPress={() => this.toggleNumberOfLines()}
                        fontSize={12}
                        color={AppStyles.color.btnColor}
                        style={globalStyles.moreLesstext}>
                        {this.state.textShown ? 'less' : 'more'}
                      </VUText>
                    ) : null}
                  </VUView>
                </VUView>
              </Header>
            </>
          )}
        </ContentWrapper>
        {this.state.showSheet && (
          <ActionSheet ref={refs => this.actionSheetRef = refs}>
            {this.state.reported ? (
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
                    <TouchableOpacity onPress={() => this.createBlockUserAlert()}>
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
                    <TouchableOpacity onPress={() => this.handleOnSpam('spam')}>
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
                      onPress={() => this.handleOnSpam('inappropriate')}>
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
}

function mapStateToProps(state) {
  return {
    settings: state.settings,
    feeds: state.feeds,
    videos: state.videos,
    user: state.auth.user,
    following: state.social.following
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    setBlockCurrentUser
  }, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(Feed);