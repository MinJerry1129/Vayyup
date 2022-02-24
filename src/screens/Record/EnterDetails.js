import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useNavigation} from '@react-navigation/native';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  KeyboardAvoidingViewWrapper,
  Overlay,
  SafeAreaView,
  View,
  VUText,
  VUTouchableOpacity,
  VUVideo,
  VUView,
} from 'common-components';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {RNFFmpeg} from 'react-native-ffmpeg';
import MentionsTextInput from 'react-native-mentions';
import Toast from 'react-native-simple-toast';
import {useDispatch, useSelector} from 'react-redux';
import {AppStyles, suggestionStyle} from 'src/AppStyles';
import {IonIcon} from 'src/icons';
import {setMyLocalVideos} from 'src/redux/reducers/video.actions';
import {getFollowers, getFollowing} from 'src/services/social';
import {
  getVideosList,
  insertVideo as insertVideoOnSQL,
  updateSyncedVideo,
  updateVideo,
} from '../../models/queries';
var RNFS = require('react-native-fs');

const watermarkURL =
  'https://firebasestorage.googleapis.com/v0/b/vayyup-app.appspot.com/o/vayy-up.png?alt=media&token=9c319671-021a-43e3-ba45-a281d7094cb6';

const EnterDetails = ({
  karaokeVideo,
  video,
  competition,
  lagTime,
  type,
  uploadVideo,
  onCancel,
  karaokeType,
  onCloseCamera,
}) => {
  const [title, setTitle] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [finalVideo, setFinalVideo] = useState();
  const [processingVideo, setProcessingVideo] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [startSync, setStartSync] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(true);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [playpreviewvideo, setplaypreviewvideo] = useState(true);

  const {
    id,
    title: competitionTitle,
    description,
    startDateTime,
    endDateTime,
    voteEndDateTime,
  } = competition;
  const user = useSelector((state) => state.auth.user);
  const navigation = useNavigation();
  const videoPlayer = useRef(null);
  const dispatch = useDispatch();
  let insertId;
  const [users, setUsers] = useState([]);
  const [pseudoUsers, setPseudoUsers] = useState([]);
  const commentInputRef = useRef();

  useEffect(async () => {
    // let followers = await getFollowers(user.id);
    // let followings = await getFollowing(user.id);

    // console.log('followers', followers, followings)

    let tempUsers = [];
    // if (followers.length > 0) {
    //   for (let a in followers) {

    firestore()
      .collection('users')
      .where('id', '!=', user.id)
      .get()
      .then((res) => {
        if (res.size > 0) {
          res.forEach((docs) => {
            // console.log('res', docs.data(), followers[a])
            if (docs.data().hasOwnProperty('username'))
              tempUsers.push(docs.data());
          });
        }
      });
    // }

    // if (followings.length > 0) {
    //   for (let a in followings) {

    //     firestore()
    //       .collection('users')
    //       .where('id', '==', followings[a].id)
    //       .get()
    //       .then((res) => {

    //         if (res.size > 0) {
    //           res.forEach((docs) => {
    //             console.log('res', docs.data(), followings[a])
    //             if (docs.data().hasOwnProperty('username'))
    //               tempUsers.push(docs.data())
    //           })
    //         }
    //       })
    //   }
    // }

    setUsers(tempUsers);
    setPseudoUsers(tempUsers);
    // }
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  // file:///storage/emulated/0/Download/me_1629794972877.mp3

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  useEffect(() => {
    if (startSync) {
      const processVideo = async () => {
        setProcessingVideo(true);
        const finalMP4FileName = `final-${new Date().getTime()}.mp4`;
        const finalMP4Location = `${RNFS.CachesDirectoryPath}/Camera/${finalMP4FileName}`;
        // const watermarkOption = '[2:v]format=rgba,colorchannelmixer=aa=0.5[fg];[0][fg]overlay=main_w-overlay_w-80:100[c]';
        const watermarkOption =
          '[2:v]format=rgba,colorchannelmixer=aa=0.7[fg];[fg][0:v]scale2ref=w="iw*25/100":h="ow/mdar"[wm][vid];[vid][wm]overlay=main_w-overlay_w-20:100 [c]';
        console.log('datalagtime...', karaokeVideo);
        console.log('datalagtime...', lagTime, type);
        if (type === 'karaoke') {
          if (karaokeType == true) {
            const mixingOptions =
              '[0]volume=1[a];[1]volume=0.5[b];[a][b]amix=inputs=2[aout];';
            let inputFiles = `-ss ${lagTime} -i ${video.uri} -ss ${lagTime} -i ${karaokeVideo.audio} -i ${watermarkURL}`;

            //video
            RNFFmpeg.executeAsync(
              `${inputFiles} -preset ultrafast -filter_complex "${mixingOptions}${watermarkOption}" -map [c]:v -map [aout] -c:v libx264 -crf 28 -shortest ${finalMP4Location}`,
              (completedExecution) => {
                if (completedExecution.returnCode === 0) {
                  setFinalVideo(finalMP4Location);
                  handleUploadVideo(finalMP4Location);
                } else {
                  Alert.alert('Video syncing process is failed,');
                  updateVideo(insertId, 'Failed');
                  dispatchLocalVideos();
                  Toast.show('Video Syncing Failed', Toast.LONG);
                }
              },
            ).then((executionId) => {
              console.log(
                'finalMP4Location',
                finalMP4Location + ' ' + new Date().toLocaleString(),
              );
              onVideoSyncStarted(executionId, finalMP4Location);
            });

            // RNFFmpeg.executeAsync(
            //   `${inputFiles} -preset ultrafast -filter_complex "${mixingOptions}${watermarkOption}" -map [c]:v -map [d] -c:v libx264  ${finalMP4Location}`,
            //   completedExecution => {
            //     if (completedExecution.returnCode === 0) {
            //       setFinalVideo(finalMP4Location);
            //       // onVideoSyncSuccess(finalMP4Location);
            //       handleUploadVideo(finalMP4Location);
            //     } else {
            //       console.log('error...................')
            //       Alert.alert('Video syncing process is failed,');
            //       updateVideo(insertId, 'Failed');
            //       dispatchLocalVideos();
            //       Toast.show('Video Syncing Failed', Toast.LONG);
            //     }
            //   },
            // ).then(executionId => {
            //   onVideoSyncStarted(executionId, finalMP4Location);
            // });
          } else {
            console.log('called unplugged');

            const sourceVideo = video.uri.replace('file://', '');
            const overlay =
              '[1:v]format=rgba,colorchannelmixer=aa=0.5[fg];[fg][0:v]scale2ref=w="iw*20/100":h="ow/mdar"[wm][vid];[vid][wm]overlay=main_w-overlay_w-20:50';

            RNFFmpeg.executeAsync(
              `-i "${sourceVideo}" -i ${watermarkURL} -preset ultrafast -filter_complex "${overlay}" ${finalMP4Location}`,
              (completedExecution) => {
                if (completedExecution.returnCode === 0) {
                  setFinalVideo(finalMP4Location);
                  handleUploadVideo(finalMP4Location);
                } else {
                  console.log(
                    `FFmpeg process failed with rc=${completedExecution.returnCode}.`,
                  );
                  setFinalVideo(video.uri.replace('file://', ''));
                  onVideoSyncStarted(
                    'unpluggedvideo',
                    video.uri.replace('file://', ''),
                  );
                }
              },
            ).then((executionId) => {
              onVideoSyncStarted(executionId, finalMP4Location);
            });
            // setFinalVideo(video.uri.replace('file://', ''));
            // onVideoSyncStarted(
            //   'unpluggedvideo',
            //   video.uri.replace('file://', ''),
            // );
          }
        } else {
          let inputFiles = `-i ${video.uri} -i ${karaokeVideo.audio} -i ${watermarkURL}`;
          RNFFmpeg.executeAsync(
            `${inputFiles} -shortest -preset ultrafast -filter_complex "${watermarkOption}" -map [c]:v -map 0:v:0 -map 1:a:0 -c:v libx264 ${finalMP4Location}`,
            (completedExecution) => {
              if (completedExecution.returnCode === 0) {
                setFinalVideo(finalMP4Location);
                handleUploadVideo(finalMP4Location);
                // onVideoSyncSuccess(finalMP4Location);
              } else {
                Alert.alert('Video syncing process is failed,');
                updateVideo(insertId, 'Failed');
                dispatchLocalVideos();
                Toast.show('Video Syncing Failed', Toast.LONG);
              }
            },
          ).then(async (executionId) => {
            onVideoSyncStarted(executionId, finalMP4Location);
          });
        }
        // setProcessingVideo(false);
      };
      const onVideoSyncStarted = async (executionId, finalMP4Location) => {
        await insertVideo(finalMP4Location, video.uri, 'Syncing');
        if (executionId === 'unpluggedvideo') {
          handleUploadVideo(finalMP4Location);
        }
        // Alert.alert(
        //   'Video is syncing...',
        //   'Until video syncing sit back, relax and scroll vayyup..',
        //   [
        //     {
        //       text: 'Ok',
        //       onPress: () => {
        //         navigation.popToTop();
        //       },
        //     },
        //   ],
        // );
        navigation.navigate('Success');
      };
      const onVideoSyncSuccess = (finalMP4Location) => {
        Alert.alert(
          'Preview video',
          'Video syncing completed, Do you wanna to preview?',
          [
            {
              text: 'Preview',
              onPress: () =>
                navigation.navigate('Preview', {
                  finalVideo: finalMP4Location,
                  videoUri: video.uri,
                  user,
                  title: title,
                  description,
                  startDateTime,
                  endDateTime,
                  competitionId: id,
                  insertId,
                }),
            },
          ],
        );
      };
      const watermarkVideo = async () => {
        const {path = ''} = video;
        const sourceVideo = path.replace('file://', '');
        const finalMP4FileName = `final-${new Date().getTime()}.mp4`;

        const watermarkedMP4Location = `${RNFS.CachesDirectoryPath}/Camera/watermarked-${finalMP4FileName}`;
        const overlay =
          '[1:v]format=rgba,colorchannelmixer=aa=0.7[fg];[fg][0:v]scale2ref=w="iw*25/100":h="ow/mdar"[wm][vid];[vid][wm]overlay=main_w-overlay_w-20:100';

        await RNFFmpeg.execute(
          `-i ${sourceVideo} -i ${watermarkURL} -preset ultrafast -filter_complex "${overlay}" ${watermarkedMP4Location}`,
        );

        setFinalVideo(watermarkedMP4Location);
        setProcessingVideo(false);
      };
      if (uploadVideo) {
        const {path = ''} = video;
        const sourceVideo = path.replace('file://', '');
        const finalMP4FileName = `final-${new Date().getTime()}.mp4`;
        const watermarkedMP4Location = `${RNFS.CachesDirectoryPath}/${finalMP4FileName}`;
        const overlay =
          '[1:v]format=rgba,colorchannelmixer=aa=0.5[fg];[fg][0:v]scale2ref=w="iw*20/100":h="ow/mdar"[wm][vid];[vid][wm]overlay=main_w-overlay_w-20:50';

        RNFFmpeg.executeAsync(
          `-i "${sourceVideo}" -i ${watermarkURL} -preset veryfast -filter_complex "${overlay}" ${watermarkedMP4Location}`,
          (completedExecution) => {
            if (completedExecution.returnCode === 0) {
              setFinalVideo(watermarkedMP4Location);
              setTimeout(() => {
                handleUploadVideo(watermarkedMP4Location);
              }, 1000);
              console.log('FFmpeg process completed successfully');
            } else {
              Alert.alert('Video syncing process is failed,');
              updateVideo(insertId, 'Failed');
              dispatchLocalVideos();
              Toast.show('Video Syncing Failed', Toast.LONG);
            }
          },
        ).then(async (executionId) => {
          await insertVideo(watermarkedMP4Location, path, 'Syncing');
          // setProcessingVideo(false);
          navigation.navigate('Success');
          console.log(
            `Async FFmpeg process started with executionId ${executionId}.`,
          );
        });
      } else {
        processVideo();
      }
    } else {
      setShowDescription(true);
    }
  }, [
    video.uri,
    karaokeVideo.audio,
    lagTime,
    type,
    uploadVideo,
    video,
    startSync,
  ]);
  const insertVideo = async (finalVideo, videoUri, status) => {
    console.log('InsertVideo', finalVideo, videoUri, status);
    const {id: userId, fullname, profile = ''} = user;
    let comment = title.split(' ');
    console.log('comment.length', comment.length);
    for (let a in comment) {
      if (comment[a].includes('@')) {
        let userName = comment[a].slice(1, comment[a].length);
        let user = pseudoUsers.find((item) => item.username == userName);
        if (user != undefined) {
          comment[a] = `@[${userName}](id:${user.id})`;
        }
      }
    }
    let t = comment.join(' ');
    console.log('t in use effect', t);

    let insertResult = await insertVideoOnSQL({
      finalVideo,
      videoUri,
      userId: userId,
      user_name: fullname,
      user_profile: profile,
      title: t,
      description,
      startDateTime: '',
      endDateTime: '',
      competitionId: id,
      status,
      type: id ? 'competition' : 'feed',
    });
    console.log('insertResult', insertResult);
    insertId = insertResult.insertId;
    dispatchLocalVideos();
  };
  const handleCancelVideo = async () => {
    onCancel();
  };
  const handleAppStateChange = () => {
    onCancel();
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

  const updateSuggestion = (text) => {
    let tempUsers = [...pseudoUsers];
    let suggestions = [];
    let filterText = text.slice(1, text.length);
    setKeyword(filterText);
    for (let a in tempUsers) {
      if (
        tempUsers[a].hasOwnProperty('username') &&
        tempUsers[a].username.toLowerCase().includes(filterText.toLowerCase())
      ) {
        suggestions.push(tempUsers[a]);
      } else {
      }
    }
    console.log('suggested users', suggestions);
    setUsers(suggestions);
  };

  const getPercentage = (ratio) => Math.round(ratio * 100);
  const handleUploadVideo = async (finalMP4Location) => {
    console.log('title', title);
    let comment = title.split(' ');

    console.log('comment.length', comment.length);
    for (let a in comment) {
      if (comment[a].includes('@')) {
        let userName = comment[a].slice(1, comment[a].length);
        let user = pseudoUsers.find((item) => item.username == userName);
        if (user != undefined) {
          comment[a] = `@[${userName}](id:${user.id})`;
        }
      }
    }
    let t = comment.join(' ');
    console.log('t', t);

    updateSyncedVideo(insertId, 'Synced', finalMP4Location);
    dispatchLocalVideos();
    // setUploading(true);
    // setPreviewPlaying(false);
    const filename = finalMP4Location.split('/').pop();
    const filePath = `videos/${user.id}/${filename}`;
    const reference = storage().ref().child(filePath);
    var UploadStarted = false;

    reference.putFile(`file://${finalMP4Location}`).on(
      storage.TaskEvent.STATE_CHANGED,
      async (snapshot) => {
        setProgress(
          getPercentage(snapshot.bytesTransferred / snapshot.totalBytes),
        );
        if (snapshot.state === storage.TaskState.SUCCESS && !UploadStarted) {
          UploadStarted = true;
          const url = await reference.getDownloadURL().catch((error) => {
            console.log(error);
          });

          // if (!uploadVideo) {
          //   // Clean up cache
          //   RNFS.unlink(video.uri);
          //   RNFS.unlink(finalMP4Location);
          // }

          const {
            fullname = '',
            profile = '',
            location = '',
            username = '',
          } = user;
          const collectionName = id ? 'entries' : 'videos';
          const document = {
            video: filePath,
            videoFileName: filename,
            url: url,
            votes: 0,
            uid: user.id,
            watermarked: true,
            title: t,
            user: {
              name: fullname,
              profile: profile,
              location: location,
              username: username,
            },
            isPublished: !isDraft,
            isVerified: user.isVerified ? true : false,
            date: firebase.firestore.FieldValue.serverTimestamp(),
            isImage: false,
          };
          console.log('document%%%%%%%%%', document);

          // Add competition details, if it is for competition
          if (id) {
            document.competition = {
              title: t,
              description,
              startDateTime,
              endDateTime,
              voteEndDateTime,
            };
            document.competitionId = id;
          }
          // deleteVideo(insertId);
          Toast.show('Video uploaded successfully', Toast.LONG);
          dispatchLocalVideos();
          await firestore().collection(collectionName).add(document);
          // setUploading(false);
          // navigation.navigate('VideoSubmitted', {id});
        }
      },
      function (error) {
        updateVideo(insertId, 'Failed');
        Toast.show('Uploading a video failed', Toast.LONG);
        dispatchLocalVideos();
      },
    );
  };
  const dispatchLocalVideos = async () => {
    dispatch(setMyLocalVideos(await getVideosList()));
  };
  const handleClose = () => {
    onCancel();
    // navigation.popToTop();
  };
  const handleSyncVideo = async (isDraft) => {
    setIsDraft(isDraft);
    setProcessingVideo(true);
    setShowDescription(false);
    setStartSync(true);
    // processVideo();
  };
  const handleTogglePlaying = () => {
    setPreviewPlaying(!previewPlaying);
  };
  const handlePreviewEnded = () => {
    setPreviewPlaying(false);
  };

  const renderSuggestionsRow = ({item}) => {
    console.log('items in render', item);
    if (item.fullname != null) {
      return (
        <TouchableOpacity
          onPress={() => {
            let cmt =
              keyword.length > 0 ? title.slice(0, -keyword.length) : title;
            setTitle(cmt.concat(`${item.username}` + ' '));
            commentInputRef.current.stopTracking();
            setUsers([...pseudoUsers]);
            setKeyword('');
          }}>
          <VUView style={suggestionStyle.suggestionListItem}>
            <Image
              source={{uri: item.profile}}
              style={suggestionStyle.userImg}
            />
            <VUView>
              <VUText style={suggestionStyle.fullName}>{item.fullname}</VUText>
              <VUText style={suggestionStyle.userName}>@{item.username}</VUText>
            </VUView>
          </VUView>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  let videoSource = {};
  if (uploadVideo) {
    const {path = ''} = video;
    videoSource = {
      uri: path,
      codec: 'mp4',
    };
  } else {
    videoSource = {
      uri: finalVideo ? `file://${finalVideo}` : video.uri,
      codec: 'mp4',
    };
  }
  if (showDescription) {
    return (
      <SafeAreaView flex={1} bg={AppStyles.color.bgWhite}>
        <KeyboardAvoidingView
          flex={1}
          behavior={Platform.OS == 'ios' ? 'padding' : 'enabled'}>
          <ScrollView flex={1}>
            <VUView>
              <VUView flexDirection="row" justifyContent="flex-end" p={2}>
                <VUTouchableOpacity onPress={handleClose}>
                  <IonIcon
                    bold
                    name="close"
                    size={34}
                    color={AppStyles.color.blueBtnColor}
                  />
                </VUTouchableOpacity>
              </VUView>
              <VUView>
                <VUText
                  fontSize={18}
                  fontFamily={AppStyles.fontName.robotoBold}
                  color={AppStyles.color.blueBtnColor}
                  textAlign="center">
                  Prepare for submission
                </VUText>
              </VUView>
              <VUView style={{margin: 12}}>
                <View
                  style={{
                    width: '100%',
                    height: isKeyboardVisible ? 200 : 450,
                    borderRadius: 4,
                  }}>
                  <VUVideo
                    flex={1}
                    ref={videoPlayer}
                    source={videoSource}
                    volume={10}
                    width="100%"
                    height={isKeyboardVisible ? 200 : 450}
                    resizeMode="cover"
                    repeat={true}
                    paused={true}
                  />
                </View>
                <VUView>
                  {/* <VUTextInput
                    borderBottomColor={AppStyles.color.white}
                    borderBottomWidth={1}
                    py={2}
                    px={3}
                    p={1}
                    color={AppStyles.color.white}
                    onChangeText={text => setTitle(text)}
                    value={title}
                    placeholder="Write a caption"
                    placeholderTextColor={AppStyles.color.white}
                    mt={20}
                  /> */}
                  <MentionsTextInput
                    ref={commentInputRef}
                    textInputStyle={{
                      borderBottomWidth: 1,
                      borderBottomColor: AppStyles.color.blueBtnColor,
                      fontSize: 14,
                      width: Dimensions.get('screen').width * 0.9,
                      color: AppStyles.color.textBlue,
                    }}
                    suggestionsPanelStyle={{backgroundColor: '#fff'}}
                    loadingComponent={() => {
                      return (
                        <VUView style={suggestionStyle.loadingComponent}>
                          <VUText
                            style={{
                              fontSize: 15,
                              color: AppStyles.color.black,
                            }}>
                            No User Found
                          </VUText>
                        </VUView>
                      );
                    }}
                    textInputMinHeight={50}
                    textInputMaxHeight={80}
                    trigger={'@'}
                    triggerLocation={'anywhere'} // 'new-word-only', 'anywhere'
                    value={title}
                    onChangeText={(val) => {
                      setTitle(val);
                    }}
                    triggerCallback={(res) => updateSuggestion(res)}
                    renderSuggestionsRow={renderSuggestionsRow}
                    suggestionsData={users} // array of objects
                    keyExtractor={(item, index) => item.name}
                    suggestionRowHeight={45}
                    horizontal={false} // default is true, change the orientation of the list
                    MaxVisibleRowCount={3} // this is required if horizontal={false}
                    placeholder={'Write a caption'}
                    placeholderTextColor={AppStyles.color.blueBtnColor}
                  />
                </VUView>
              </VUView>
              <VUView
                bottom={0}
                left={0}
                flex={1}
                width="100%"
                mt={20}
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center">
                <VUTouchableOpacity
                  onPress={() => {
                    handleSyncVideo(true);
                  }}
                  px={3}
                  py={2}
                  mb={3}
                  ml={2}
                  width="40%"
                  borderWidth={2}
                  borderColor={AppStyles.color.blueBtnColor}
                  borderRadius={24}>
                  <VUText
                    fontFamily={AppStyles.fontName.robotoBold}
                    color={AppStyles.color.blueBtnColor}
                    textAlign="center">
                    Draft
                  </VUText>
                </VUTouchableOpacity>
                <VUTouchableOpacity
                  onPress={() => {
                    handleSyncVideo(false);
                  }}
                  px={3}
                  py={2}
                  mb={3}
                  ml={2}
                  width="40%"
                  backgroundColor={AppStyles.color.blueBtnColor}
                  borderWidth={2}
                  borderColor={AppStyles.color.blueBtnColor}
                  borderRadius={24}>
                  <VUText
                    fontFamily={AppStyles.fontName.robotoBold}
                    color="#fff"
                    textAlign="center">
                    Post
                  </VUText>
                </VUTouchableOpacity>
              </VUView>
            </VUView>
            {uploading && (
              <VUView
                position="absolute"
                top={0}
                bottom={0}
                left={0}
                right={0}
                flex={1}
                justifyContent="center"
                alignItems="center"
                bg="rgba(0,0,0,0.8)">
                <VUText color="#ccc" my={3}>
                  Uploading
                </VUText>
                <AnimatedCircularProgress
                  size={120}
                  width={8}
                  fill={progress}
                  tintColor="#E9326D"
                  backgroundColor="#3d5875"
                />
              </VUView>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  if (processingVideo || loading) {
    return (
      <VUView bg="#000" flex={100}>
        <Overlay>
          <VUText color="#ccc">Syncing Video and Audio</VUText>
          <ActivityIndicator animating={processingVideo || loading} />
        </Overlay>
      </VUView>
    );
  }

  return (
    <SafeAreaView flex={1}>
      <KeyboardAvoidingViewWrapper>
        <KeyboardAvoidingView flex={1}>
          {/* <VUView flex={1} justify="space-between">
            {competition && (
              <VUView alignItems="center">
                <VUText color="#000" fontSize={14} fontWeight="bold">
                  {competitionTitle}
                </VUText>
              </VUView>
            )}
            <View flex={1}>
              <VUTouchableOpacity flex={1} onPress={handleTogglePlaying}>
                <View flex={1}>
                  <VUVideo
                    flex={1}
                    ref={videoPlayer}
                    source={videoSource}
                    volume={10}
                    resizeMode="cover"
                    repeat={true}
                    onEnd={handlePreviewEnded}
                    paused={!previewPlaying}
                  />
                  <VUView
                    position="absolute"
                    width="100%"
                    alignItems="center"
                    justifyContent="center"
                    flex={1}
                    top={0}
                    bottom={0}>
                    {!previewPlaying && (
                      <FontAwesomeIcon name="play" size={36} />
                    )}
                  </VUView>
                </View>
              </VUTouchableOpacity>
            </View>
            <View padding={10}>
              
              {!loading && (
                <VUView
                  flexDirection="row"
                  justifyContent="space-around"
                  my={2}>
                  <VUTouchableOpacity
                    borderWidth={2}
                    borderColor="#E9326D"
                    alignItems="center"
                    px={4}
                    py={1}
                    borderRadius={25}
                    onPress={handleCancelVideo}>
                    <VUText color="#E9326D">Cancel</VUText>
                  </VUTouchableOpacity>
                  <VUTouchableOpacity
                    borderWidth={2}
                    borderColor="#E9326D"
                    alignItems="center"
                    px={4}
                    py={1}
                    borderRadius={25}
                    onPress={handleUploadVideo}>
                    <VUText color="#E9326D">Submit</VUText>
                  </VUTouchableOpacity>
                </VUView>
              )}
            </View>
          </VUView> */}
          {uploading && (
            <VUView
              position="absolute"
              top={0}
              bottom={0}
              left={0}
              right={0}
              flex={1}
              justifyContent="center"
              alignItems="center"
              bg="rgba(0,0,0,0.8)">
              <VUText color="#ccc" my={3}>
                Uploading
              </VUText>
              <AnimatedCircularProgress
                size={120}
                width={8}
                fill={progress}
                tintColor="#E9326D"
                backgroundColor="#3d5875"
              />
            </VUView>
          )}
        </KeyboardAvoidingView>
      </KeyboardAvoidingViewWrapper>
    </SafeAreaView>
  );
};

export default EnterDetails;
