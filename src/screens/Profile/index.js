import React, {useState, useEffect, useRef} from 'react';
import {
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  View,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import {useSelector, useDispatch} from 'react-redux';
import {
  useNavigation,
  useIsFocused,
  useNavigationState,
} from '@react-navigation/native';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GridImageView from 'react-native-grid-image-viewer';
import {
  IonIcon,
  FontAwesomeIcon,
  FontAwesome5Icon,
  Material,
  FeatherIcon,
  MaterialCommunityIcons,
} from 'src/icons';
import {
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
} from 'src/services/social';
import {numFormatter} from 'src/services/numFormatter';
import {
  setMyCompetitionVideosAction,
  setMyLocalVideos,
  setRefreshVideos,
} from 'src/redux/reducers/video.actions';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
var RNFS = require('react-native-fs');
import {ConnectionTab} from 'screens/Connections';
import {Title, AvatarContainer, Avatar, newProfile} from './styles';
import {createNullCache} from '@algolia/cache-common';
import {RESET_ACTION} from 'redux/reducers/action.types';
import {
  deleteVideo,
  getVideosList,
  updateSyncedVideo,
  updateVideo,
  deleteVideobasedonName,
} from '../../models/queries';
import {
  VUView,
  VUScrollView,
  VUText,
  VUImage,
  VUTouchableOpacity,
  ActivityIndicator,
  VUVideo,
} from 'common-components';
import {AppStyles, globalStyles} from 'src/AppStyles';
import Award from 'common-components/icons/Award';
import AwardGray from 'common-components/icons/AwardGray';
import ProfileImg from 'common-components/icons/Profile';
import ProfileGray from 'common-components/icons/ProfileGray';
import moment from 'moment';
import {Alert} from 'react-native';
import Toast from 'react-native-simple-toast';
import ActionSheet from 'react-native-actions-sheet';
import {configKeys} from '../../services/utility';
import {ImageBackground} from 'react-native';
import {setBlockCurrentUser} from 'src/redux/reducers/social.actions';
import LinearGradient from 'react-native-linear-gradient';

const algoliasearch = require('algoliasearch');
const client = algoliasearch(
  configKeys.algolioAppId,
  configKeys.algolioAdminKey,
  {
    responsesCache: createNullCache(), // Disable Cache
  },
);

const algoliaVideoIndex = client.initIndex('videos_createdAt_desc');
const algoliaCompetitonIndex = client.initIndex('entries');
const {width} = Dimensions.get('window');
const windowDimensions = Dimensions.get('window');

const ProfileTabs = {
  Feeds: 0,
  Competitions: 1,
  Certificates: 2,
};
const Profile = ({route = {}}) => {
  const routesLength = useNavigationState((state) => state.routes.length);
  const {params = {}} = route;
  const {showBack = false} = params;
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);

  const [userFollowing, setUserFollowing] = useState(false);
  const [loadFollowing, setLoadFollowing] = useState(false);
  const [user, setUser] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [myVideosFeeds, setMyVideosFeeds] = useState([]);
  const [myCompetitionsVideo, setMyCompetitionVideos] = useState([]);
  const [currentUser, following] = useSelector((state) => [
    state.auth.user,
    state.social.following,
  ]);
  const [feeds, setFeeds] = useState([]);
  const [parray, setplayarray] = useState(false);
  let timer1;

  const [competitions, setCompetitions] = useState([]);
  let localFeedLsit = useSelector((state) =>
    state.videos.localVideos.hasOwnProperty('localVideos')
      ? state.videos.localVideos.localVideos
      : [],
  );
  let isDeletedLocalVideo = useSelector(
    (state) => state.videos.isDeletedLocalVideo,
  );
  const [showBlockBtn, setShowBlockBtn] = useState(false);
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(ProfileTabs.Feeds);
  const [isDeletedVideo, setIsDeletedVideo] = useState(false);

  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const actionSheetRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [bannerModalVisible, setBannerModalVisible] = useState(false);
  const [postCount, setpostCount] = useState(null);

  useEffect(() => {
    setLoadFollowing(true);
    if (following && user) {
      const alreadyFollowing = following.find((obj) => obj.id === user.id);
      setUserFollowing(alreadyFollowing);
      setLoadFollowing(false);
    }
  }, [following, user]);

  useEffect(() => {
    if (params.user && params.user.id) {
      const loadData = async () => {
        try {
          const userDoc = await firebase
            .firestore()
            .collection('users')
            .doc(params.user.id)
            .get();
          if (!userDoc.empty) {
            setUser({
              ...userDoc.data(),
              id: params.user.id,
              uid: params.user.id,
            });
          }
          setLoading(false);
        } catch (error) {}
      };
      loadData();
    } else if (params.userId) {
      const loadData = async () => {
        try {
          const userDoc = await firebase
            .firestore()
            .collection('users')
            .doc(params.userId)
            .get();
          if (!userDoc.empty) {
            setUser({
              ...userDoc.data(),
              id: params.userId,
              uid: params.userId,
            });
          }
          setLoading(false);
        } catch (error) {}
      };
      loadData();
    } else {
      setUser(currentUser);
    }
  }, [params.user, currentUser, params.userId]);

  useEffect(async () => {
    fetchVideos();
  }, [isFocused, user, isDeletedVideo]);

  const fetchVideos = async () => {
    const loadFeeds = async () => {
      const {videos = 0} = user;
      const response = await algoliaVideoIndex.search(user.id, {
        restrictSearchableAttributes: ['uid'],
        hitsPerPage: 100,
        filters:
          currentUser.id === user.id
            ? 'isImage:false'
            : 'isPublished:true AND isImage:false',
      });

      const photoResponse = await algoliaVideoIndex.search(user.id, {
        restrictSearchableAttributes: ['uid'],
        hitsPerPage: 100,
        filters: 'isImage:true',
      });

      const responseComVideos = await algoliaCompetitonIndex.search(user.id, {
        restrictSearchableAttributes: ['uid'],
        hitsPerPage: 100,
        filters: currentUser.id === user.id ? '' : 'isPublished:true',
      });

      setFeeds(await response.hits.filter((hit) => hit.url));
      setCompetitions(await responseComVideos.hits.filter((hit) => hit.url));
      setCertificates(await photoResponse.hits.filter((hit) => hit.url));
      if (localFeedLsit.length != 0) {
        setplayarray(true);
      } else {
        setplayarray(false);
      }

      await dispatch(
        setMyCompetitionVideosAction(
          await responseComVideos.hits.filter((hit) => hit.url),
        ),
      );
      setLoading(false);
    };

    if (isFocused && user.hasOwnProperty('id')) {
      dispatch(setMyLocalVideos(await getVideosList()));
      setLoading(true);
      const {certificates = []} = user;
      setCertificates(certificates);
      loadFeeds();
    }
  };

  useEffect(async () => {
    var check = false;
    const checkinterval = async () => {
      const {videos = 0} = user;
      const response = await algoliaVideoIndex.search(user.id, {
        restrictSearchableAttributes: ['uid'],
        hitsPerPage: parseInt(videos),
        filters:
          currentUser.id === user.id
            ? 'isImage:false'
            : 'isPublished:true AND isImage:false',
      });
      const responseComVideos = await algoliaCompetitonIndex.search(user.id, {
        restrictSearchableAttributes: ['uid'],
        hitsPerPage: 100,
        filters: currentUser.id === user.id ? '' : 'isPublished:true',
      });

      const hits = response.hits;
      const hitscom = responseComVideos.hits;

      for (let i = 0; i < hits.length; i++) {
        var checklocalvideo = localFeedLsit.filter((item) =>
          item.finalVideo.includes(hits[i].videoFileName),
        );
        if (checklocalvideo.length != 0) {
          if (
            hits[i].playback != undefined &&
            hits[i].url != undefined &&
            hits[i].competitionId == null
          ) {
            // setLoading(true);
            setFeeds([...feeds, hits[i]]);
            if (checklocalvideo[0].videoUri != null) {
              RNFS.unlink(checklocalvideo[0].videoUri);
            }
            if (checklocalvideo[0].finalVideo != null) {
              RNFS.unlink(checklocalvideo[0].finalVideo);
            }
            deleteVideobasedonName(checklocalvideo[0].finalVideo);
            dispatch(setMyLocalVideos(await getVideosList()));

            // setLoading(false);
            check = false;
          } else {
            check = true;
          }
        }
      }

      for (let i = 0; i < hitscom.length; i++) {
        var checklocalvideocomp = localFeedLsit.filter((item) =>
          item.finalVideo.includes(hitscom[i].videoFileName),
        );
        if (checklocalvideocomp.length != 0) {
          if (
            hitscom[i].playback != undefined &&
            hitscom[i].url != undefined &&
            hitscom[i].competitionId != null
          ) {
            setCompetitions([...competitions, hitscom[i]]);
            deleteVideobasedonName(checklocalvideocomp[0].finalVideo);

            // setLoading(true);
            if (checklocalvideocomp[0].videoUri != null) {
              RNFS.unlink(checklocalvideocomp[0].videoUri);
            }
            if (checklocalvideocomp[0].finalVideo != null) {
              RNFS.unlink(checklocalvideocomp[0].finalVideo);
            }
            dispatch(setMyLocalVideos(await getVideosList()));

            // setLoading(false);
            check = false;
          } else {
            check = true;
          }
        }
      }
      // } else {
      //   check = false;
      //   clearInterval(timer1);
      // }

      const getlocalvideo = await getVideosList();

      if (!check && (localFeedLsit.length == 0 || getlocalvideo.length == 0)) {
        setLoading(true);
        setplayarray(false);
        dispatch(setMyLocalVideos(await getVideosList()));
        setFeeds(await response.hits.filter((hit) => hit.url));
        setCompetitions(await responseComVideos.hits.filter((hit) => hit.url));
        setLoading(false);
        clearInterval(timer1);
      }
    };

    if (isFocused && user.hasOwnProperty('id')) {
      dispatch(setMyLocalVideos(await getVideosList()));
      if (parray || localFeedLsit.length > 0) {
        timer1 = setInterval(async () => {
          checkinterval();
        }, 10000);
      }
    }
    return () => {
      clearInterval(timer1);
    };
  }, [isFocused, user, isDeletedVideo, parray]);

  useEffect(() => {
    if (user.hasOwnProperty('id')) {
      let myVideosFeeds = feeds.filter((feed) => feed.uid === user.id);
      const video = myVideosFeeds.filter((item) =>
        item.hasOwnProperty('playback'),
      );
      setMyVideosFeeds(video); //chnaged here
    }
  }, [feeds]);

  useEffect(() => {
    if (user.hasOwnProperty('id')) {
      let myCompetitionsVideo = competitions.filter(
        (com) => com.uid === user.id,
      );
      const videocom = myCompetitionsVideo.filter((item) =>
        item.hasOwnProperty('playback'),
      );
      setMyCompetitionVideos(videocom); //chnaged here

      // setMyCompetitionVideos(myCompetitionsVideo);
    }
  }, [competitions]);

  useEffect(() => {
    let videos = myVideosFeeds.filter((obj) => obj.isPublished === true);

    let competitions = myCompetitionsVideo.filter(
      (obj) => obj.isPublished === true,
    );
    let images = certificates.filter((obj) => obj.isPublished === true);
    setpostCount(videos.length + competitions.length + images.length);
  }, [myVideosFeeds, myCompetitionsVideo, certificates]);
  useEffect(() => {
    if (isDeletedLocalVideo) {
      setTimeout(() => {
        fetchVideos();
        // Toast.show('Video uploaded successfully', Toast.LONG);
        dispatch(setRefreshVideos(false));
      }, 90000);
    }
  }, [isDeletedLocalVideo]);
  const handleLogout = async () => {
    await firebase.auth().signOut();
    dispatch({type: RESET_ACTION});
    // await AsyncStorage.removeItem('first-time');
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleOnTabChange = (tabIndex) => {
    setTab(tabIndex);
  };

  const handleUploadPhoto = () => {
    if (currentUser.id !== user.id) {
      return;
    }
    ImagePicker.openPicker({
      width: 600,
      height: 600,
      compressImageMaxHeight: 600,
      compressImageMaxWidth: 600,
      maxFiles: 1,
      mediaType: 'photo',
      cropping: true,
    }).then(async (response) => {
      const {path: uri} = response;
      setLoading(true);
      try {
        const filePage = 'profiles/' + uri.split('/').pop();
        const reference = storage().ref(filePage);
        await reference.putFile(uri);
        const loggedInUser = firebase.auth().currentUser;
        const url = await reference.getDownloadURL();
        await firestore().collection('users').doc(loggedInUser.uid).update({
          profile: url,
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    });
  };

  // const createBlockUserAlert = () => {

  //   if (user.id != currentUser.id) {
  //     Alert.alert(
  //       'Are you sure you want to block this user?',
  //       'By blocking this user you will not be able to see any further updates from this account',
  //       [
  //         {
  //           text: 'Cancel',
  //           onPress: () => console.log('Cancel Pressed'),
  //           style: 'cancel',
  //         },
  //         { text: 'OK', onPress: setBlockUser },
  //       ],
  //     );
  //   }
  // };

  const handleOnFollowPressed = () => {
    setLoading(true);
    const {
      id: userId = '',
      fullname: userFullname = '',
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
    setUser({...user, followers: user.followers + 1});
    setLoading(false);
  };

  const handleOnUnfollowPressed = () => {
    setLoading(true);
    const {
      id: userId = '',
      fullname: userFullname = '',
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
    setUser({...user, followers: user.followers - 1});
    setLoading(false);
  };

  const handleOnFollowingPressed = (tabName) => {
    navigation.navigate('Connections', {
      user: {id: user.id, name: user.name},
      tabName,
    });
  };

  const handleBackPressed = () => {
    if (routesLength === 1) {
      navigation.navigate('VayyUp');
    } else {
      navigation.goBack();
    }
  };

  const handleImageLongPressed = (item, type) => {
    if (!item.playback) {
      Alert.alert('Delete video', 'Do you want to delete this failed video?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            let collection =
              type === 'myCompetitionVideos' ? 'entries' : 'videos';
            await firestore().collection(collection).doc(item.id).delete();
            setIsDeletedVideo(!isDeletedVideo);
            deleteVideo(item.id);
            dispatch(setMyLocalVideos(await getVideosList()));
          },
        },
      ]);
    }
  };

  const handleImagePressed = (item, index, type) => {
    switch (item.isPublished) {
      // case false:
      //   navigation.navigate('Preview', {
      //     item,
      //     type,
      //   });
      //   break;
      default:
        if (item.playback) {
          const validVideos =
            type === 'myCompetitionVideos'
              ? myCompetitionsVideo.filter((obj) => obj.playback)
              : type === 'myVideos'
              ? item.hasOwnProperty('isImage') && item.isImage == true
                ? certificates.filter((obj) => obj.playback)
                : myVideosFeeds.filter((obj) => obj.playback)
              : myVideosFeeds.filter((obj) => obj.playback);
          const filteredindex = validVideos.findIndex((filterItem, index) => {
            if (filterItem.id === item.id) {
              return index;
            }
          });
          const isImage =
            type === 'myVideos'
              ? item.hasOwnProperty('isImage') && item.isImage == true
                ? true
                : false
              : false;

          navigation.navigate('UserVideos', {
            user: {...user, uid: user.id},
            item,
            type,
            index: filteredindex,
            isFromProfile: true,
            isImage: isImage,
          });
        } else {
          Toast.show('Video is Processing.......', Toast.LONG);

          let failedDateAndTime =
            (moment().valueOf() - item.createdAt) / (1000 * 60 * 60);
          if (failedDateAndTime > 0.1 && currentUser.id === user.id) {
            handleImageLongPressed(item, type);
          }
        }
        break;
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleBlockUser = () => {
    setShowBlockBtn(!showBlockBtn);
  };

  const setBlockUser = async () => {
    await blockUser(
      {id: user.id, name: user.fullname, profile: user.profile},
      {
        id: currentUser.id,
        name: currentUser.fullname,
        profile: currentUser.profile,
      },
    );
    if (following.find((obj) => obj.id === user.id) != undefined) {
      await unfollowUser(
        {id: user.id, name: user.fullname, profile: user.profile},
        {
          id: currentUser.id,
          name: currentUser.fullname,
          profile: currentUser.profile,
        },
      );
    }

    let RandomNumber = Math.floor(Math.random() * 10000) + 1;

    // onChangeVideoBlock()
    dispatch(setBlockCurrentUser(RandomNumber));
    Toast.show(
      `${user.fullname} Blocked \n You can unblock the user anytime from the user profile`,
      Toast.LONG,
    );
    navigation.navigate('Home');
  };

  const handleLocalURI = (item) => {
    let currentDateTime = moment().valueOf();
    let uploadedTime = item.uploadedTime;
    let checkDifferenceTime =
      (currentDateTime - uploadedTime) / (1000 * 60 * 60);

    switch (item.status) {
      case 'Syncing':
        handleDeleteVideo(item);
        break;
      case 'Synced':
        if (checkDifferenceTime > 0.1) {
          handleUploadVideo(item);
        } else {
          handleDeleteVideo(item);
        }
        break;
      case 'Failed':
        handleUploadVideo(item);
        break;
    }
  };
  const handleDeleteVideo = async (item) => {
    const {id} = item;
    Alert.alert('Delete video', 'Do you want to delete this video?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Canceld'),
      },
      {
        text: 'Delete',
        onPress: async () => {
          deleteVideo(id);
          Toast.show('Video deleted successfully', Toast.LONG);
          dispatch(setMyLocalVideos(await getVideosList()));
        },
      },
    ]);
  };

  const handleUploadVideo = async (item) => {
    const {
      id,
      finalVideo,
      videoUri,
      userId,
      user_name,
      user_profile,
      title,
      description,
      startDateTime,
      endDateTime,
      competitionId,
      status,
      type,
      voteEndDateTime,
    } = item;
    Alert.alert('Retry', 'Do you want to retry to upload?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Canceld'),
      },
      {
        text: 'Delete',
        onPress: async () => {
          deleteVideo(id);
          Toast.show('Video deleted successfully', Toast.LONG);
          dispatch(setMyLocalVideos(await getVideosList()));
        },
      },
      {
        text: 'Retry',
        onPress: async () => {
          updateSyncedVideo(id, 'Synced', finalVideo);

          const filename = finalVideo.split('/').pop();
          const filePath = `videos / ${userId} / ${filename}`;
          const reference = storage().ref().child(filePath);

          var UploadStarted = false;
          reference.putFile(`file://${finalVideo}`).on(
            storage.TaskEvent.STATE_CHANGED,
            async (snapshot) => {
              if (
                snapshot.state === storage.TaskState.SUCCESS &&
                !UploadStarted
              ) {
                UploadStarted = true;
                const url = await reference.getDownloadURL().catch((error) => {
                  console.log(error);
                });

                // Clean up cache
                RNFS.unlink(finalVideo);

                const {
                  fullname = '',
                  profile = '',
                  location = '',
                  username = '',
                } = user;
                const collectionName = competitionId ? 'entries' : 'videos';
                const document = {
                  video: filePath,
                  videoFileName: filename,
                  url: url,
                  votes: 0,
                  uid: userId,
                  watermarked: true,
                  title,
                  user: {
                    name: user_name,
                    profile: user_profile == 'null' ? '' : user_profile,
                    location: location,
                    username: username,
                  },
                  isPublished: true,
                  isVerified: user.isVerified ? true : false,
                  date: firebase.firestore.FieldValue.serverTimestamp(),
                };
                // Add competition details, if it is for competition
                if (competitionId) {
                  document.competition = {
                    title,
                    description,
                    startDateTime,
                    endDateTime,
                    voteEndDateTime,
                  };
                  document.competitionId = competitionId;
                }
                deleteVideo(id);
                await firestore().collection(collectionName).add(document);
                //Toast.show('Video uploaded Successfully', Toast.LONG);
                dispatch(setMyLocalVideos(await getVideosList()));
                // setUploading(false);
              }
            },
            function (error) {
              // insertVideo(finalMP4Location, video.uri,"failed")
              updateFailedVideoOnLocal(id);
            },
          );
        },
      },
    ]);
  };
  const updateFailedVideoOnLocal = async (id) => {
    Toast.show('Error on uploading a video', Toast.LONG);
    updateVideo(id, 'Failed');
    dispatch(setMyLocalVideos(await getVideosList()));
  };
  const handleUploadCertificates = async () => {
    actionSheetRef.current?.setModalVisible();
  };

  const handleGallery = async () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      compressImageMaxHeight: 600,
      compressImageQuality: 0.8,
    }).then(async (selectedImages) => {
      var images = [...selectedImages.map((image) => image.path)];

      setLoading(true);
      try {
        const {certificates = []} = user;
        const uploadedImages = await Promise.all(
          images
            .filter((image) => !certificates.includes(image))
            .map(async (image) => {
              const filePage = 'users/' + image.split('/').pop();
              const reference = storage().ref(filePage);
              await reference.putFile(image);
              return reference.getDownloadURL();
            }),
        );

        handleUploadImagesOnVideos(uploadedImages);
        const loggedInUser = firebase.auth().currentUser;
        await firestore()
          .collection('users')
          .doc(loggedInUser.uid)
          .update({
            certificates: [...certificates, ...uploadedImages],
          });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    });
  };

  const handleCamera = async () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: false,
      compressImageMaxHeight: 600,
      compressImageQuality: 0.5,
    }).then(async (selectedImages) => {
      var images = [selectedImages.path];

      setLoading(true);
      try {
        const {certificates = []} = user;
        const uploadedImages = await Promise.all(
          images
            .filter((image) => !certificates.includes(image))
            .map(async (image) => {
              const filePage = 'users/' + image.split('/').pop();
              const reference = storage().ref(filePage);
              await reference.putFile(image);
              return reference.getDownloadURL();
            }),
        );

        handleUploadImagesOnVideos(uploadedImages);
        const loggedInUser = firebase.auth().currentUser;
        await firestore()
          .collection('users')
          .doc(loggedInUser.uid)
          .update({
            certificates: [...certificates, ...uploadedImages],
          });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    });
  };

  const handleUploadImagesOnVideos = (uploadedImages = []) => {
    const {fullname = '', profile = '', location = '', username = ''} = user;
    uploadedImages.map(async (image) => {
      const document = {
        url: image,
        votes: 0,
        uid: user.id,
        watermarked: true,
        title: '',
        user: {
          name: fullname,
          profile: profile,
          location: location,
          username: username,
        },
        playback: {
          dash: image,
          hls: image,
        },
        isPublished: true,
        isVerified: user.isVerified ? true : false,
        date: firebase.firestore.FieldValue.serverTimestamp(),
        isImage: true,
      };
      await firestore().collection('videos').add(document);
    });
  };
  const renderProcessingFailed = (item) => {
    let checkProcessingUploadVideo = (
      (moment().valueOf() - item.createdAt) /
      (1000 * 60 * 60)
    ).toFixed(1);

    //code here
    return checkProcessingUploadVideo > 0.5 ? (
      <VUText fontSize={14} fontWeigh="bold" color="#fff">
        Failed
      </VUText>
    ) : (
      <VUText fontSize={14} fontWeigh="bold" color="#fff">
        Processing
      </VUText>
    );
  };

  const renderImage = (item, index) => {
    const imageWidth = (width - 20) / 3;
    return (
      <VUTouchableOpacity
        key={item.id}
        mt="5px"
        ml="5px"
        onPress={handleImagePressed.bind(this, item, index, 'myVideos')}>
        <VUView height={200} bg="black" alignItems="center" width={imageWidth}>
          {!item.playback ? (
            <VUVideo
              flex={1}
              source={{
                uri: item.url,
                codec: 'mp4',
              }}
              volume={0}
              width={imageWidth}
              height={200}
              resizeMode="cover"
              repeat={true}
              paused={true}
            />
          ) : (
            <VUImage
              source={{
                uri: item.hasOwnProperty('videoFileName')
                  ? item.thumbnail
                  : item.url,
              }}
              width={imageWidth}
              height={200}
              resizeMode="cover"
            />
          )}

          <VUView
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            justifyContent="flex-end"
            style={{margin: 5}}>
            <VUView flexDirection="row">
              <IonIcon name="play-outline" size={18} color="#FFF" />
              <VUText color="#FFF">
                {numFormatter(
                  parseInt(item.views != undefined ? item.views : 0),
                )}
              </VUText>
            </VUView>
          </VUView>
          {!item.playback ? (
            <VUView
              position="absolute"
              top={0}
              left={0}
              right={0}
              alignItems="center"
              bg="rgba(52, 52, 52, 0.8)">
              <VUView flexDirection="row">
                {renderProcessingFailed(item)}
              </VUView>
            </VUView>
          ) : item.isPublished == false ? (
            <VUView
              position="absolute"
              top={0}
              left={0}
              right={0}
              alignItems="center"
              bg="rgba(52, 52, 52, 0.8)">
              <VUView flexDirection="row">
                <VUText fontSize={14} fontWeigh="bold" color="#fff">
                  Draft
                </VUText>
              </VUView>
            </VUView>
          ) : null}
        </VUView>
      </VUTouchableOpacity>
    );
  };

  const renderImageCertificate = (item, index) => {
    const imageWidth = (width - 20) / 3;
    return (
      <VUTouchableOpacity
        key={item.id}
        mt="5px"
        ml="5px"
        onPress={handleImagePressed.bind(this, item, index, 'myVideos')}>
        <VUView height={200} bg="black" alignItems="center" width={imageWidth}>
          {!item.playback ? (
            <VUVideo
              flex={1}
              source={{
                uri: item.url,
                codec: 'mp4',
              }}
              volume={0}
              width={imageWidth}
              height={200}
              resizeMode="cover"
              repeat={true}
              paused={true}
            />
          ) : (
            <VUImage
              source={{
                uri: item.hasOwnProperty('videoFileName')
                  ? item.thumbnail
                  : item.url,
              }}
              width={imageWidth}
              height={200}
              resizeMode="cover"
            />
          )}

          <VUView
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            justifyContent="flex-end"
            style={{margin: 5}}>
            <VUView flexDirection="row">
              <IonIcon name="play-outline" size={18} color="#FFF" />
              <VUText color="#FFF">
                {numFormatter(
                  parseInt(item.views != undefined ? item.views : 0),
                )}
              </VUText>
            </VUView>
          </VUView>
          {!item.playback ? (
            <VUView
              position="absolute"
              top={0}
              left={0}
              right={0}
              alignItems="center"
              bg="rgba(52, 52, 52, 0.8)">
              <VUView flexDirection="row">
                {renderProcessingFailed(item)}
              </VUView>
            </VUView>
          ) : item.isPublished == false ? (
            <VUView
              position="absolute"
              top={0}
              left={0}
              right={0}
              alignItems="center"
              bg="rgba(52, 52, 52, 0.8)">
              <VUView flexDirection="row">
                <VUText fontSize={14} fontWeigh="bold" color="#fff">
                  Draft
                </VUText>
              </VUView>
            </VUView>
          ) : null}
        </VUView>
      </VUTouchableOpacity>
    );
  };

  const renderProcessingLocalFailed = (item) => {
    let checkProcessingUploadVideo = (
      (moment().valueOf() - item.uploadedTime) /
      (1000 * 60 * 60)
    ).toFixed(1);
    //code here
    return checkProcessingUploadVideo > 0.5 ? (
      <VUImage
        width={24}
        height={24}
        resizeMode="contain"
        source={require('src/../assets/icons/warning.png')}
      />
    ) : (
      <VUText fontSize={14} fontWeigh="bold" color="#fff">
        {/* Processing */}
      </VUText>
    );
  };

  const renderProcessingLocaltextFailed = (item) => {
    let checkProcessingUploadVideo = (
      (moment().valueOf() - item.uploadedTime) /
      (1000 * 60 * 60)
    ).toFixed(1);
    console.log(
      'checkProcessingUploadlocalVideo',
      moment().valueOf(),
      checkProcessingUploadVideo,
      item.uploadedTime,
    );
    //code here
    return checkProcessingUploadVideo > 0.5 ? (
      <VUText fontSize={14} fontWeigh="bold" color="#fff">
        Failed
      </VUText>
    ) : (
      <VUText fontSize={14} fontWeigh="bold" color="#fff">
        Processing
      </VUText>
    );
  };

  const renderLocalUri = (item, index) => {
    const imageWidth = (width - 20) / 3;
    return (
      <VUTouchableOpacity
        key={item.id}
        onPress={handleLocalURI.bind(this, item, index)}>
        <VUView key={item.id} mt="5px" ml="5px" width={imageWidth} height={200}>
          <VUVideo
            flex={1}
            source={{
              uri:
                item.status === 'Syncing'
                  ? item.videoUri
                  : `file://${item.finalVideo}`,
              codec: 'mp4',
            }}
            volume={0}
            width={imageWidth}
            height={200}
            resizeMode="cover"
            repeat={true}
            paused={true}
          />

          <VUView
            position="absolute"
            top={0}
            left={0}
            right={0}
            alignItems="center"
            bg="rgba(52, 52, 52, 0.8)">
            <VUView flexDirection="row">
              {item.status === 'Syncing' ? (
                <VUText fontSize={14} fontWeigh="bold" color="#fff">
                  Syncing
                </VUText>
              ) : item.status === 'Failed' ? (
                <VUText fontSize={14} fontWeigh="bold" color="#fff">
                  Failed
                </VUText>
              ) : (
                // : item.status === 'Synced' ? (
                //   <VUText fontSize={14} fontWeigh="bold" color="#fff">
                //     Uploading
                //   </VUText>
                // ) : item.status === 'Failed' ? (
                //   <VUText fontSize={14} fontWeigh="bold" color="#fff">
                //     Failed
                //   </VUText>)
                //     : (
                //       <VUText fontSize={14} fontWeigh="bold" color="#fff">
                //         Syncing
                //       </VUText>
                //     )
                renderProcessingLocaltextFailed(item)
              )}
            </VUView>
          </VUView>

          <VUView
            position="absolute"
            top={0}
            left={0}
            right={0}
            alignItems="center"
            justifyContent="center"
            height={200}>
            <VUView flexDirection="row">
              {renderProcessingLocalFailed(item)}
            </VUView>
          </VUView>
          {/* <VUView
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            justifyContent="flex-end"
            style={{ margin: 5 }}>
            <VUView
              height={10}
              width="100%"
              borderColor="#ed1f2b"
              borderWidth={2}
              borderRadius={5}>
              <Animated.View style={globalStyles.animatedView} />
            </VUView>
          </VUView> */}
        </VUView>
      </VUTouchableOpacity>
    );
  };
  const renderCompetitionsImage = (item, index) => {
    const imageWidth = (width - 20) / 3;
    return (
      <TouchableOpacity
        key={item.id}
        mt="5px"
        ml="5px"
        onPress={handleImagePressed.bind(
          this,
          item,
          index,
          'myCompetitionVideos',
        )}>
        <VUView width={imageWidth} height={200} bg="black">
          <VUImage
            source={{uri: item.thumbnail}}
            width={imageWidth}
            height={200}
            resizeMode="cover"
          />
          <VUView
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            justifyContent="flex-end"
            style={{margin: 5}}>
            <VUView flexDirection="row">
              <IonIcon name="play-outline" size={18} color="#FFF" />
              <VUText color="#FFF">
                {numFormatter(
                  parseInt(item.views != undefined ? item.views : 0),
                )}
              </VUText>
            </VUView>
          </VUView>
          {!item.playback ? (
            <VUView
              position="absolute"
              top={0}
              left={0}
              right={0}
              alignItems="center"
              bg="rgba(52, 52, 52, 0.8)">
              <VUView flexDirection="row">
                {renderProcessingFailed(item)}
              </VUView>
            </VUView>
          ) : item.isPublished == false ? (
            <VUView
              position="absolute"
              top={0}
              left={0}
              right={0}
              alignItems="center"
              bg="rgba(52, 52, 52, 0.8)">
              <VUView flexDirection="row">
                <VUText fontSize={14} fontWeigh="bold" color="#fff">
                  Draft
                </VUText>
              </VUView>
            </VUView>
          ) : null}
        </VUView>
      </TouchableOpacity>
    );
  };

  const handleChatPressed = () => {
    navigation.push('ChatRoom', {
      currentuser: user,
    });
  };

  const handleAddBtnPressed = (type) => {
    if (type == 'profile') {
      ImagePicker.openPicker({
        width: 600,
        height: 600,
        compressImageMaxHeight: 600,
        compressImageMaxWidth: 600,
        maxFiles: 1,
        mediaType: 'photo',
        cropping: true,
      }).then(async (response) => {
        const {path: uri} = response;
        setImageLoading(true);
        try {
          const filePage = 'profiles/' + uri.split('/').pop();
          const reference = storage().ref(filePage);
          await reference.putFile(uri);
          const loggedInUser = firebase.auth().currentUser;
          const url = await reference.getDownloadURL();
          await firestore().collection('users').doc(loggedInUser.uid).update({
            profile: url,
          });
          setImageLoading(false);
        } catch (error) {
          setImageLoading(false);
        }
      });
    } else if (type == 'banner') {
      ImagePicker.openPicker({
        width: 600,
        height: 350,
        compressImageMaxHeight: 350,
        compressImageMaxWidth: 600,
        maxFiles: 1,
        mediaType: 'photo',
        cropping: true,
      }).then(async (response) => {
        const {path: uri} = response;
        setImageLoading(true);
        try {
          const filePage = 'profiles/' + uri.split('/').pop();
          const reference = storage().ref(filePage);
          await reference.putFile(uri);
          const loggedInUser = firebase.auth().currentUser;
          const url = await reference.getDownloadURL();
          await firestore().collection('users').doc(loggedInUser.uid).update({
            banner: url,
          });
          setImageLoading(false);
        } catch (error) {
          setImageLoading(false);
        }
      });
    } else {
    }
  };

  const tileWidth = (windowDimensions.width - 4) / 3;

  // const myVideosFeeds = feeds
  //   .filter((feed) => feed.uid === user.id)
  //   .map((feed, index) => ({...feed, uri: feed.thumbnail, index}));

  // const myCompetitionsVideo = competitions
  //   .filter((com) => com.uid === user.id)
  //   .map((com, index) => ({...com, uri: com.thumbnail, index}));

  // const myCompetitionsVideo = competitions
  //   .filter((com) => com.uid === user.id)
  //   .map((com, index) => ({ ...com, uri: com.thumbnail, index }));

  // const setBlockUser = async () => {
  //   const user = {...item.user, id: item.uid};
  //   const {
  //     id: userId = '',
  //     name: userFullname = '',
  //     profile: userProfile = '',
  //   } = user;
  //   const {
  //     id: currentUserId = '',
  //     fullname: currentUserFullname = '',
  //     profile: currentUserProfile = '',
  //   } = currentUser;
  //   await blockUser(
  //     {id: userId, name: userFullname, profile: userProfile},
  //     {
  //       id: currentUserId,
  //       name: currentUserFullname,
  //       profile: currentUserProfile,
  //     },
  //   );

  const createBlockUserAlert = () => {
    if (user.uid != currentUser.id) {
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

  return (
    <VUView flex={1} bg={AppStyles.color.bgWhite} pt={insets.top}>
      <VUView bg={AppStyles.color.bgWhite} flex={1}>
        <ScrollView stickyHeaderIndices={[1]}>
          <VUView flexDirection="column" bg={AppStyles.color.bgWhite}>
            <VUTouchableOpacity
              activeOpacity={0.9}
              onPress={() => setBannerModalVisible(!bannerModalVisible)}>
              <ImageBackground
                source={user.banner ? {uri: user.banner} : {uri: user.profile}}
                style={newProfile.bannerImg}
                imageStyle={{
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                }}>
                {currentUser.id == user.id && (
                  <VUTouchableOpacity
                    style={newProfile.addIcon}
                    onPress={handleAddBtnPressed.bind(this, 'banner')}>
                    <IonIcon
                      name="add"
                      size={25}
                      color={AppStyles.color.blueBtnColor}
                    />
                  </VUTouchableOpacity>
                )}
                {currentUser.id != user.id && (
                  <VUTouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                    }}
                    onPress={() => navigation.goBack()}>
                    <IonIcon name="chevron-back" size={25} color={'#4910BC'} />
                  </VUTouchableOpacity>
                )}

                {currentUser.id == user.id && (
                  <VUTouchableOpacity
                    // style={newProfile.settingsIcon}
                    onPress={() => navigation.navigate('Settings')}>
                    <VUImage
                      width={40}
                      height={40}
                      resizeMode="contain"
                      source={require('src/../assets/settings.png')}
                    />
                  </VUTouchableOpacity>
                )}
                {currentUser.id == user.id && imageLoading && (
                  <>
                    <View
                      style={[
                        newProfile.imageLoader,
                        {
                          backgroundColor: '#000',
                          opacity: 0.5,
                        },
                      ]}
                    />
                    <View style={newProfile.imageLoader}>
                      <ActivityIndicator
                        size={25}
                        color={'white'}
                        animating={true}
                      />
                    </View>
                  </>
                )}
              </ImageBackground>
            </VUTouchableOpacity>

            {currentUser.id == user.id ? (
              <VUView style={newProfile.currentUserRow}>
                {user.profile ? (
                  <VUTouchableOpacity
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}>
                    <VUImage
                      source={{uri: user.profile}}
                      style={newProfile.userImg}
                      resizeMode={'cover'}
                    />
                    <VUTouchableOpacity
                      style={[newProfile.addIcon, {bottom: -5, right: -5}]}
                      onPress={handleAddBtnPressed.bind(this, 'profile')}>
                      <IonIcon
                        name="add"
                        size={20}
                        color={AppStyles.color.blueBtnColor}
                      />
                    </VUTouchableOpacity>
                  </VUTouchableOpacity>
                ) : (
                  <VUView>
                    <IonIcon
                      name="person-circle-outline"
                      size={80}
                      color="#bbb"
                    />
                    <VUTouchableOpacity
                      style={[
                        newProfile.addIcon,
                        {
                          bottom: -2,
                          right: -2,
                          elevation: 3,
                          shadowColor: '#000',
                          shadowOffset: {width: 1, height: 1},
                          shadowOpacity: 0.3,
                          shadowRadius: 3,
                        },
                      ]}
                      onPress={handleAddBtnPressed.bind(this, 'profile')}>
                      <IonIcon
                        name="add"
                        size={20}
                        color={AppStyles.color.blueBtnColor}
                      />
                    </VUTouchableOpacity>
                  </VUView>
                )}

                <VUView
                  style={{
                    width: Dimensions.get('screen').width * 0.3,
                    paddingLeft: 10,
                  }}>
                  <VUText
                    fontSize={15}
                    color={AppStyles.color.textBlue}
                    fontFamily={AppStyles.fontName.robotoMedium}>
                    @{user.username}
                    {user.isVerified && (
                      <VUImage
                        width={18}
                        height={18}
                        resizeMode="contain"
                        source={require('src/../assets/feed/verified.png')}
                      />
                    )}
                  </VUText>

                  <VUText
                    fontSize={15}
                    color={AppStyles.color.blueBtnColor}
                    fontFamily={AppStyles.fontName.robotoMedium}>
                    {user.fullname}
                  </VUText>
                </VUView>

                <VUTouchableOpacity
                  style={newProfile.editBtn}
                  onPress={() => handleEditProfile()}>
                  <VUText style={newProfile.editText}>Edit Profile</VUText>
                </VUTouchableOpacity>

                <VUTouchableOpacity
                  style={newProfile.notificationBtn}
                  onPress={() => {}}>
                  <MaterialCommunityIcons name={'bell-ring'} size={20} />
                </VUTouchableOpacity>
              </VUView>
            ) : (
              <VUView style={newProfile.currentUserRow}>
                {user.profile ? (
                  <VUTouchableOpacity
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}>
                    <VUImage
                      source={{uri: user.profile}}
                      style={newProfile.userImg}
                      resizeMode={'cover'}
                    />
                  </VUTouchableOpacity>
                ) : (
                  <IonIcon
                    name="person-circle-outline"
                    size={80}
                    color="#bbb"
                  />
                )}
                {/* {currentUser.id === user.id && (

                <IonIcon name="person-circle-outline" size={80} color="#bbb" />
              )}
              {/* {currentUser.id === user.id && (
              ) : (
                  <IonIcon
                    name="person-circle-outline"
                    size={80}
                    color="#bbb"
                  />
                )}
              {currentUser.id === user.id && (
                <VUView
                  top={user.profile ? -30 : -40}
                  alignItems="flex-end"
                  mb={-15}>
                  <VUView
                    width={24}
                    height={24}
                    bg="#E9326D"
                    borderRadius={14}
                    justifyContent="center"
                    alignItems="center"
                    pl="2px">
                    <FontAwesome5Icon name="plus" size={16} color="#fff" />
                  </VUView>
                </VUView>
                <IonIcon name="person-circle-outline" size={80} color="#bbb" />
            )}
              )} */}

                <View style={newProfile.otherUserView}>
                  <VUTouchableOpacity
                    style={newProfile.otherUserFollowBtn}
                    onPress={
                      !userFollowing
                        ? () => handleOnFollowPressed()
                        : () => handleOnUnfollowPressed()
                    }>
                    <VUText style={newProfile.editText}>
                      {!userFollowing ? 'Follow' : 'Unfollow'}
                    </VUText>
                  </VUTouchableOpacity>
                  <VUTouchableOpacity
                    style={newProfile.iconBtn}
                    onPress={() => handleChatPressed()}>
                    <FeatherIcon name={'send'} size={20} />
                  </VUTouchableOpacity>
                  <VUTouchableOpacity
                    style={newProfile.iconBtn}
                    onPress={() => createBlockUserAlert()}>
                    <FeatherIcon name={'more-horizontal'} size={20} />
                  </VUTouchableOpacity>
                </View>
              </VUView>
            )}

            {currentUser.id == user.id ? (
              <VUView style={newProfile.countsView}>
                <VUTouchableOpacity alignItems="center" onPress={() => {}}>
                  <VUText
                    fontSize={16}
                    color={AppStyles.color.textBlue}
                    fontFamily={AppStyles.fontName.robotoBold}>
                    {postCount}
                  </VUText>
                  <VUText
                    fontSize={12}
                    fontFamily={AppStyles.fontName.robotoRegular}
                    color={AppStyles.color.textBlue}>
                    Post
                  </VUText>
                </VUTouchableOpacity>

                <VUTouchableOpacity
                  alignItems="center"
                  onPress={handleOnFollowingPressed.bind(
                    this,
                    ConnectionTab.Followers,
                  )}>
                  <VUText
                    fontSize={16}
                    color={AppStyles.color.textBlue}
                    fontFamily={AppStyles.fontName.robotoBold}>
                    {user.followers || 0}
                  </VUText>
                  <VUText
                    fontSize={12}
                    fontFamily={AppStyles.fontName.robotoRegular}
                    color={AppStyles.color.textBlue}>
                    Followers
                  </VUText>
                </VUTouchableOpacity>

                <VUTouchableOpacity
                  alignItems="center"
                  onPress={handleOnFollowingPressed.bind(
                    this,
                    ConnectionTab.Following,
                  )}>
                  <VUText
                    fontSize={16}
                    color={AppStyles.color.textBlue}
                    fontFamily={AppStyles.fontName.robotoBold}>
                    {user.following || 0}
                  </VUText>
                  <VUText
                    fontSize={12}
                    fontFamily={AppStyles.fontName.robotoRegular}
                    color={AppStyles.color.textBlue}>
                    Following
                  </VUText>
                </VUTouchableOpacity>
              </VUView>
            ) : (
              <VUView style={newProfile.otherUserCountsView}>
                <VUView
                  style={{
                    width: Dimensions.get('screen').width * 0.3,
                    paddingLeft: 5,
                  }}>
                  <VUText
                    fontSize={15}
                    color={AppStyles.color.textBlue}
                    fontFamily={AppStyles.fontName.robotoMedium}
                    textAlignVertical={'center'}>
                    @{user.username}
                    {user.isVerified && (
                      <VUImage
                        width={12}
                        height={12}
                        resizeMode="contain"
                        source={require('src/../assets/feed/verified.png')}
                      />
                    )}
                  </VUText>

                  <VUText
                    fontSize={15}
                    color={AppStyles.color.blueBtnColor}
                    fontFamily={AppStyles.fontName.robotoMedium}>
                    {user.fullname}
                  </VUText>
                </VUView>
                <View style={newProfile.otherUserCountsInnerView}>
                  <VUTouchableOpacity alignItems="center" onPress={() => {}}>
                    <VUText
                      fontSize={16}
                      color={AppStyles.color.textBlue}
                      fontFamily={AppStyles.fontName.robotoRegular}>
                      {postCount}
                    </VUText>
                    <VUText
                      fontSize={12}
                      fontFamily={AppStyles.fontName.robotoRegular}
                      color={AppStyles.color.textBlue}>
                      Post
                    </VUText>
                  </VUTouchableOpacity>

                  <VUTouchableOpacity
                    alignItems="center"
                    onPress={handleOnFollowingPressed.bind(
                      this,
                      ConnectionTab.Followers,
                    )}>
                    <VUText
                      fontSize={16}
                      color={AppStyles.color.textBlue}
                      fontFamily={AppStyles.fontName.robotoRegular}>
                      {user.followers || 0}
                    </VUText>
                    <VUText
                      fontSize={12}
                      fontFamily={AppStyles.fontName.robotoRegular}
                      color={AppStyles.color.textBlue}>
                      Followers
                    </VUText>
                  </VUTouchableOpacity>

                  <VUTouchableOpacity
                    alignItems="center"
                    onPress={handleOnFollowingPressed.bind(
                      this,
                      ConnectionTab.Following,
                    )}>
                    <VUText
                      fontSize={16}
                      color={AppStyles.color.textBlue}
                      fontFamily={AppStyles.fontName.robotoRegular}>
                      {user.following || 0}
                    </VUText>
                    <VUText
                      fontSize={12}
                      fontFamily={AppStyles.fontName.robotoRegular}
                      color={AppStyles.color.textBlue}>
                      Following
                    </VUText>
                  </VUTouchableOpacity>
                </View>
              </VUView>
            )}

            {user.bio && user.bio != '' ? (
              <VUView
                mt={3}
                width={'90%'}
                style={{
                  alignSelf: 'center',
                  paddingLeft: 5,
                }}
                flexDirection="row"
                alignItems="center">
                <VUText
                  fontSize={12}
                  color={AppStyles.color.textBlue}
                  fontFamily={AppStyles.fontName.robotoRegular}>
                  {user.bio}
                </VUText>
              </VUView>
            ) : null}
          </VUView>
          <VUView flexDirection="row" width="100%" pt={3} bg={'#fff'}>
            <VUTouchableOpacity
              flex={1}
              borderBottomWidth={2}
              borderBottomColor={
                tab === ProfileTabs.Feeds
                  ? AppStyles.color.blueBtnColor
                  : '#878080'
              }
              pb={2}
              onPress={handleOnTabChange.bind(this, ProfileTabs.Feeds)}>
              <VUView
                flexDirection="row"
                justifyContent="center"
                alignItems="center">
                <FontAwesome5Icon
                  name="th"
                  size={24}
                  color={
                    tab === ProfileTabs.Feeds
                      ? AppStyles.color.blueBtnColor
                      : '#878080'
                  }
                />
              </VUView>
            </VUTouchableOpacity>
            <VUTouchableOpacity
              flex={1}
              pb={2}
              borderBottomWidth={2}
              bg={'#fff'}
              borderBottomColor={
                tab === ProfileTabs.Competitions
                  ? AppStyles.color.blueBtnColor
                  : '#878080'
              }
              alignItems="center"
              onPress={handleOnTabChange.bind(this, ProfileTabs.Competitions)}>
              <VUView
                flexDirection="row"
                justifyContent="center"
                alignItems="center">
                {tab === ProfileTabs.Competitions ? (
                  <Image
                    source={require('../../../assets/award.png')}
                    style={{
                      width: 30,
                      height: 30,
                    }}
                    resizeMode={'contain'}
                  />
                ) : (
                  <AwardGray size={28} />
                )}
                {/* <VUText
              fontSize={16}
              ml={1}
              fontFamily={AppStyles.fontName.robotoRegular}
              color={
                tab === ProfileTabs.Competitions
                  ? AppStyles.color.textBlue
                  : '#878080'
              }>
              ({myCompetitionsVideo.length})
            </VUText> */}
              </VUView>
            </VUTouchableOpacity>
            <VUTouchableOpacity
              flex={1}
              pb={2}
              borderBottomWidth={2}
              borderBottomColor={
                tab === ProfileTabs.Certificates
                  ? AppStyles.color.blueBtnColor
                  : '#878080'
              }
              alignItems="center"
              onPress={handleOnTabChange.bind(this, ProfileTabs.Certificates)}>
              <VUView
                flexDirection="row"
                justifyContent="center"
                alignItems="center">
                {tab === ProfileTabs.Certificates ? (
                  <Image
                    source={require('../../../assets/photos.png')}
                    style={{
                      width: 30,
                      height: 30,
                    }}
                    resizeMode={'contain'}
                  />
                ) : (
                  <ProfileGray size={28} />
                )}
                {/* <VUText
              fontSize={16}
              ml={1}
              fontFamily={AppStyles.fontName.robotoRegular}
              color={
                tab === ProfileTabs.Certificates
                  ? AppStyles.color.textBlue
                  : '#878080'
              }>
              ({certificates.length})
            </VUText> */}
              </VUView>
            </VUTouchableOpacity>
          </VUView>
          {tab === ProfileTabs.Feeds && (
            <VUView flex={1} flexDirection="column">
              {(myVideosFeeds.length > 0 || localFeedLsit.length > 0) && (
                <VUScrollView flex={1}>
                  <VUView
                    flex={1}
                    flexDirection="row"
                    flexWrap="wrap"
                    justifyContent="flex-start">
                    {currentUser.id === user.id
                      ? localFeedLsit
                          .filter((item) => item.competitionId == null)
                          .map((item, index) => renderLocalUri(item, index))
                      : null}
                    {myVideosFeeds.map((item, index) =>
                      renderImage(item, index),
                    )}

                    {/* <MasonryList
                spacing={0.1}
                columns={3}
                onPressImage={handleImagePressed}
                images={myVideosFeeds}
              /> */}
                  </VUView>
                </VUScrollView>
              )}
              {myVideosFeeds.length == 0 && (
                <VUView
                  justifyContent="center"
                  flex={1}
                  alignItems="center"
                  width="100%">
                  <VUText color="#888" fontSize={14} fontWeight="100">
                    No videos uploaded yet.
                  </VUText>
                </VUView>
              )}
            </VUView>
          )}
          {tab === ProfileTabs.Competitions && (
            <VUView flex={1} flexDirection="column">
              {loading ? (
                <ActivityIndicator animating={true} />
              ) : competitions.length > 0 ? (
                <VUScrollView flex={1}>
                  <VUView
                    flex={1}
                    flexDirection="row"
                    flexWrap="wrap"
                    justifyContent="flex-start">
                    {currentUser.id === user.id
                      ? localFeedLsit
                          .filter((item) => item.competitionId != null)
                          .map((item, index) => renderLocalUri(item, index))
                      : null}

                    {myCompetitionsVideo.map((item, index) =>
                      renderCompetitionsImage(item, index),
                    )}
                  </VUView>
                </VUScrollView>
              ) : (
                <VUView
                  justifyContent="center"
                  flex={1}
                  alignItems="center"
                  width="100%">
                  <VUText color="#888" fontSize={14} fontWeight="100">
                    No competitions videos uploaded yet.
                  </VUText>
                </VUView>
              )}
            </VUView>
          )}

          {tab === ProfileTabs.Certificates && (
            <VUView flex={1} flexDirection="column">
              {console.log(
                'tab === ProfileTabs.Certificates',
                tab === ProfileTabs.Certificates,
              )}
              {loading ? (
                <ActivityIndicator animating={true} />
              ) : certificates.length > 0 ? (
                <VUScrollView flex={1}>
                  <VUView
                    flex={1}
                    flexDirection="row"
                    flexWrap="wrap"
                    justifyContent="flex-start">
                    {certificates.map((item, index) =>
                      renderImageCertificate(item, index),
                    )}

                    {/* <MasonryList
             spacing={0.1}
             columns={3}
             onPressImage={handleImagePressed}
             images={myVideosFeeds}
           /> */}
                  </VUView>
                </VUScrollView>
              ) : (
                <VUView
                  justifyContent="center"
                  flex={1}
                  alignItems="center"
                  width="100%">
                  <VUText color="#888" fontSize={14} fontWeight="100">
                    No images uploaded yet.
                  </VUText>
                </VUView>
              )}
            </VUView>
          )}
          {/* {showBlockBtn && (
        <VUView
          width="100%"
          height="80"
          alignItems="center"
          justifyContent="center"
          backgroundColor={AppStyles.color.primary}>
          <VUTouchableOpacity onPress={setBlockUser}>
            <VUText
              color="#888"
              fontSize={20}
              color={AppStyles.color.btnColor}>
              Block User
            </VUText>
          </VUTouchableOpacity>
        </VUView>
      )} */}

          <ActionSheet ref={actionSheetRef}>
            <VUView mt={4} mb={4}>
              <VUView width="100%">
                <VUTouchableOpacity onPress={handleCamera} my={2} mx={4}>
                  <VUText fontSize={18} textAlign="center" color="#666">
                    Open Camera
                  </VUText>
                </VUTouchableOpacity>
                <VUTouchableOpacity onPress={handleGallery} my={2} mx={4}>
                  <VUText fontSize={18} textAlign="center" color="#666">
                    Open Gallery
                  </VUText>
                </VUTouchableOpacity>
              </VUView>
            </VUView>
          </ActionSheet>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}>
            <View
              style={{
                flex: 1,
                backgroundColor: AppStyles.color.bgWhite,
                opacity: 1,
              }}>
              <View style={{height: '10%'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    marginTop: insets.top,
                  }}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <IonIcon
                      bold
                      name="close"
                      size={38}
                      color={AppStyles.color.blueBtnColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{height: '90%'}}>
                <VUImage
                  source={{uri: user.profile}}
                  width={'100%'}
                  height={'100%'}
                  resizeMode="contain"
                />
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={bannerModalVisible}>
            <SafeAreaView
              style={{
                flex: 1,
                backgroundColor: AppStyles.color.bgWhite,
                opacity: 1,
              }}>
              <View style={{height: '10%'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                  }}>
                  <TouchableOpacity
                    onPress={() => setBannerModalVisible(false)}>
                    <IonIcon
                      bold
                      name="close"
                      size={38}
                      color={AppStyles.color.blueBtnColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{height: '90%'}}>
                <VUImage
                  source={
                    user?.banner ? {uri: user.banner} : {uri: user.profile}
                  }
                  width={'100%'}
                  height={'100%'}
                  resizeMode="contain"
                />
              </View>
            </SafeAreaView>
          </Modal>
        </ScrollView>
      </VUView>
    </VUView>
  );
};

const styles = StyleSheet.create({
  modelView: {
    flex: 1,
    backgroundColor: AppStyles.color.bgColor,
    opacity: 1,
  },
  margin: {},
});

export default Profile;
