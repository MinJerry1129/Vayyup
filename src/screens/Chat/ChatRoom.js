import React, {useEffect, useState, useRef} from 'react';
import {AppStyles} from 'src/AppStyles';
import {FlatList, Dimensions, Keyboard, PermissionsAndroid} from 'react-native';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import {
  VUView,
  VUScrollView,
  VUText,
  VUImage,
  VUTouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  VUTextInput,
  Overlay,
  KeyboardAvoidingView,
} from 'common-components';
import {IonIcon} from 'src/icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ChatItem from 'screens/Chat/feed/chatitem';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';
import {useSelector} from 'react-redux';
import ActionSheet from 'react-native-actions-sheet';
import Header from 'common-components/Header';
import * as Progress from 'react-native-progress';

const ChatRoom = ({route, onBack}) => {
  const navigation = useNavigation();
  const chatlistRef = useRef();
  const actionSheetRef = useRef();
  const routesLength = useNavigationState((state) => state.routes.length);
  const windowWidth = Dimensions.get('window').width;
  const [loading, setLoading] = useState(true);
  const [uploadingimage, setUploadingImage] = useState(false);
  const [editmsg, setEditMsg] = useState(false);
  let [userlist, setUserList] = useState([]);
  let [msgdocid, setMsgDocid] = useState('');
  let [msgs, setMsgs] = useState([]);
  let [msg, setMsg] = useState('');
  let [msgtype, setMsgType] = useState('text');
  let [msgcount, setMsgCount] = useState(0);
  const [myarchive, setMyArchive] = useState('no');
  const [parchive, setPArchive] = useState('no');
  const user = useSelector((state) => state.auth.user);
  const {currentuser = {}} = route.params;

  useEffect(() => {
    setLoading(true);
    firestore()
      .collection('chats')
      .doc(user.id)
      .collection('userlist')
      .doc(currentuser.id)
      .onSnapshot((snapshot) => {
        if (snapshot._data) {
          setMyArchive(snapshot._data.archive ? snapshot._data.archive : 'no');
        } else {
          setMyArchive('no');
        }
      });
    firestore()
      .collection('chats')
      .doc(currentuser.id)
      .collection('userlist')
      .doc(user.id)
      .onSnapshot((snapshot) => {
        if (snapshot._data) {
          setPArchive(snapshot._data.archive ? snapshot._data.archive : 'no');
        } else {
          setPArchive('no');
        }
      });

    firestore()
      .collection('chats')
      .doc(user.id)
      .collection('userlist')
      .doc(currentuser.id)
      .collection('chatlist')
      .orderBy('date', 'desc')
      .onSnapshot((snapshot) => {
        if (snapshot) {
          const batch = firestore().batch();

          const smsgRef = firestore()
            .collection('chats')
            .doc(user.id)
            .collection('userlist')
            .doc(currentuser.id);
          batch.update(smsgRef, {
            ['status']: 'yes',
          });
          batch.commit();

          const list = [];
          snapshot.forEach((obj) => list.push({...obj.data(), id: obj.id}));
          const allMessages = [
            ...msgs,
            ...list
              .filter((message) => message.date)
              .map((message) => ({
                _id: message.id,
                text: message.text,
                createdAt: message.date,
                type: message.type,
                status: message.status,
                user: {
                  _id: message.user.uid,
                  name: message.user.name,
                  avatar: message.user.profile,
                },
              })),
          ];
          setMsgs([]);
          setMsgs(allMessages);
          setMsgCount(allMessages.length);
          setLoading(false);
        } else {
          setMsgs([]);
          setLoading(false);
        }
      });
  }, [user, currentuser, chatlistRef]);

  const handleSendText = async () => {
    const docid = new Date().getTime();
    if (!editmsg) {
      if (msg.trim() != '') {
        const {fullname = '', profile = '', id = ''} = user;
        let timestamp = firebase.firestore.FieldValue.serverTimestamp();
        firestore()
          .collection('chats')
          .doc(user.id)
          .collection('userlist')
          .doc(currentuser.id)
          .collection('chatlist')
          .doc(docid.toString())
          .set({
            text: msg,
            date: timestamp,
            type: 'text',
            status: 'send',
            user: {
              name: fullname,
              profile: profile,
              uid: id,
            },
          });
        firestore()
          .collection('chats')
          .doc(user.id)
          .collection('userlist')
          .doc(currentuser.id)
          .set({
            lastmsg: msg,
            lastdate: timestamp,
            type: 'send',
            status: 'yes',
            fullname: currentuser.fullname,
            profile: currentuser.profile,
            id: currentuser.id,
            archive: 'no',
            archive: myarchive,
          });
        firestore()
          .collection('chats')
          .doc(currentuser.id)
          .collection('userlist')
          .doc(user.id)
          .collection('chatlist')
          .doc(docid.toString())
          .set({
            text: msg,
            date: timestamp,
            type: 'text',
            status: 'receive',
            user: {
              name: fullname,
              profile: profile,
              uid: id,
            },
          });
        firestore()
          .collection('chats')
          .doc(currentuser.id)
          .collection('userlist')
          .doc(user.id)
          .set({
            lastmsg: msg,
            lastdate: timestamp,
            type: 'receive',
            status: 'no',
            fullname: fullname,
            profile: profile,
            id: id,
            archive: 'no',
            archive: parchive,
          });

        setMsg('');
      }
    } else {
      const batch = firestore().batch();

      const smsgRef = firestore()
        .collection('chats')
        .doc(user.id)
        .collection('userlist')
        .doc(currentuser.id)
        .collection('chatlist')
        .doc(msgdocid);
      batch.update(smsgRef, {
        ['text']: msg,
      });

      const rmsgRef = firestore()
        .collection('chats')
        .doc(currentuser.id)
        .collection('userlist')
        .doc(user.id)
        .collection('chatlist')
        .doc(msgdocid);
      batch.update(rmsgRef, {
        ['text']: msg,
      });
      await batch.commit();
      setMsg('');
      setEditMsg(false);
    }
  };

  const handleSendImage = async (imageurl) => {
    const docid = new Date().getTime();

    const {fullname = '', profile = '', id = ''} = user;
    let timestamp = firebase.firestore.FieldValue.serverTimestamp();
    firestore()
      .collection('chats')
      .doc(user.id)
      .collection('userlist')
      .doc(currentuser.id)
      .collection('chatlist')
      .doc(docid.toString())
      .set({
        text: imageurl,
        date: timestamp,
        type: 'image',
        status: 'send',
        user: {
          name: fullname,
          profile: profile,
          uid: id,
        },
      });

    firestore()
      .collection('chats')
      .doc(user.id)
      .collection('userlist')
      .doc(currentuser.id)
      .set({
        lastmsg: 'image',
        lastdate: timestamp,
        type: 'send',
        status: 'yes',
        fullname: currentuser.fullname,
        profile: currentuser.profile,
        id: currentuser.id,
        archive: myarchive,
      });

    firestore()
      .collection('chats')
      .doc(currentuser.id)
      .collection('userlist')
      .doc(user.id)
      .collection('chatlist')
      .doc(docid.toString())
      .set({
        text: imageurl,
        date: timestamp,
        type: 'image',
        status: 'receive',
        user: {
          name: fullname,
          profile: profile,
          uid: id,
        },
      });
    firestore()
      .collection('chats')
      .doc(currentuser.id)
      .collection('userlist')
      .doc(user.id)
      .set({
        lastmsg: 'image',
        lastdate: timestamp,
        type: 'receive',
        status: 'no',
        fullname: fullname,
        profile: profile,
        id: id,
        archive: parchive,
      });
  };

  const handleSendVideo = async (videourl) => {
    const docid = new Date().getTime();

    const {fullname = '', profile = '', id = ''} = user;
    let timestamp = firebase.firestore.FieldValue.serverTimestamp();
    firestore()
      .collection('chats')
      .doc(user.id)
      .collection('userlist')
      .doc(currentuser.id)
      .collection('chatlist')
      .doc(docid.toString())
      .set({
        text: videourl,
        date: timestamp,
        type: 'video',
        status: 'send',
        user: {
          name: fullname,
          profile: profile,
          uid: id,
        },
      });

    firestore()
      .collection('chats')
      .doc(user.id)
      .collection('userlist')
      .doc(currentuser.id)
      .set({
        lastmsg: 'video',
        lastdate: timestamp,
        type: 'send',
        status: 'yes',
        fullname: currentuser.fullname,
        profile: currentuser.profile,
        id: currentuser.id,
        archive: myarchive,
      });

    firestore()
      .collection('chats')
      .doc(currentuser.id)
      .collection('userlist')
      .doc(user.id)
      .collection('chatlist')
      .doc(docid.toString())
      .set({
        text: videourl,
        date: timestamp,
        type: 'video',
        status: 'receive',
        user: {
          name: fullname,
          profile: profile,
          uid: id,
        },
      });
    firestore()
      .collection('chats')
      .doc(currentuser.id)
      .collection('userlist')
      .doc(user.id)
      .set({
        lastmsg: 'video',
        lastdate: timestamp,
        type: 'receive',
        status: 'no',
        fullname: fullname,
        profile: profile,
        id: id,
        archive: parchive,
      });
  };

  const handleEditMsg = (item) => {
    setEditMsg(true);
    let msg_str = item.text;
    setMsg(msg_str);
    let msg_docid = item._id;
    setMsgDocid(msg_docid);
  };

  const chatrenderItem = ({item, index}) => (
    <ChatItem
      key={item.id}
      item={item}
      index={index}
      userid={user.id}
      onEditMsg={handleEditMsg}
      currentuserid={currentuser.id}
    />
  );
  const handleBackPressed = () => {
    dissMissKeyBoard(true, function () {
      setTimeout(() => {
        if (routesLength === 1) {
          navigation.navigate('VayyUp');
        } else {
          navigation.goBack();
        }
      }, 125);
    });
  };
  function dissMissKeyBoard(isKeyboardNeedToClose, callback) {
    Keyboard.dismiss();
    callback();
  }

  const handleUploadCertificates = async () => {
    actionSheetRef.current?.setModalVisible();
  };

  const handleUplodVideo = async () => {
    ImagePicker.openPicker({
      mediaType: 'video',
      compressVideoPreset: 'MediumQuality',
    })
      .then(async (videos) => {
        actionSheetRef.current?.hide();
        var video = videos.path;

        setUploadingImage(true);
        try {
          const filePage = 'chats/' + video.split('/').pop();
          const reference = storage().ref(filePage);
          await reference.putFile(video);
          const uploadedVideo = await reference.getDownloadURL();

          handleSendVideo(uploadedVideo);
          setUploadingImage(false);
        } catch (error) {
          setUploadingImage(false);
        }
      })
      .catch((error) => {
        console.log('error:', error);
      });
  };

  const handleGallery = async () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: false,
      compressImageMaxHeight: 1024,
      compressImageQuality: 0.8,
    }).then(async (selectedImages) => {
      actionSheetRef.current?.hide();
      var image = selectedImages.path;
      setUploadingImage(true);
      try {
        const filePage = 'chats/' + image.split('/').pop();
        const reference = storage().ref(filePage);
        await reference.putFile(image);
        const uploadedImage = await reference.getDownloadURL();
        handleSendImage(uploadedImage);
        setUploadingImage(false);
      } catch (error) {
        setUploadingImage(false);
      }
    });
  };

  const handleCamera = async () => {
    ImagePicker.openCamera({
      cropping: false,
      compressImageMaxHeight: 1024,
      compressImageQuality: 0.8,
    }).then(async (selectedImages) => {
      actionSheetRef.current?.hide();
      var image = selectedImages.path;
      setUploadingImage(true);
      try {
        const filePage = 'chats/' + image.split('/').pop();
        const reference = storage().ref(filePage);
        await reference.putFile(image);
        const uploadedImage = await reference.getDownloadURL();
        handleSendImage(uploadedImage);
        setUploadingImage(false);
      } catch (error) {
        setUploadingImage(false);
      }
    });
  };

  return (
    <KeyboardAvoidingView>
      <SafeAreaView>
        <VUView
          bg={AppStyles.color.bgWhite}
          flex={1}
          justifyContent="space-between">
          {/* <VUView width="100%" py={2} flexDirection="row" justifyContent="space-between">
            <VUView width={40}>
              <VUTouchableOpacity onPress={handleBackPressed}>
                <IonIcon name="chevron-back" size={36} color={AppStyles.color.textBlue} />
              </VUTouchableOpacity>
            </VUView>
            <VUView alignSelf="center">
              <VUText
                  fontSize={18}
                  fontFamily={AppStyles.fontName.robotoBold}
                  color={AppStyles.color.textBlue}>
                  {currentuser.fullname}
              </VUText>
            </VUView>
              <VUView width={40} />
          </VUView>
          <VUView width="100%" height="1px" bg={AppStyles.color.textBlue} /> */}
          <Header
            headerTitle={currentuser.fullname}
            onLeftPress={handleBackPressed}
          />
          <VUView flex={1}>
            {loading ? (
              <ActivityIndicator animating={loading} />
            ) : (
              <FlatList
                inverted
                ref={chatlistRef}
                data={msgs}
                renderItem={chatrenderItem}
                keyExtractor={(item) => item.id}
              />
            )}
          </VUView>
          {uploadingimage && (
            <Progress.Bar indeterminate={true} width={windowWidth} />
          )}
          <VUView width="100%" height="1px" bg={AppStyles.color.textBlue} />
          <VUView
            width="100%"
            flexDirection="row"
            justifyContent="space-between">
            <VUView width={5} height="100%" />
            <VUTextInput
              width={windowWidth - 90}
              placeholder="Write message here ..."
              placeholderTextColor={AppStyles.color.textBlue}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              multiline={true}
              onChangeText={(text) => setMsg(text)}
              value={msg}
              color={AppStyles.color.textBlue}
            />
            <VUView
              width={90}
              flexDirection="column"
              flexDirection="row"
              justifyContent="space-between">
              <VUView width={5} />
              <VUTouchableOpacity
                onPress={handleUploadCertificates}
                alignSelf="center">
                <IonIcon
                  name="attach-outline"
                  size={30}
                  color={AppStyles.color.textBlue}
                />
              </VUTouchableOpacity>
              <VUTouchableOpacity onPress={handleSendText} alignSelf="center">
                <FontAwesome
                  name="send-o"
                  size={20}
                  color={AppStyles.color.textBlue}
                />
              </VUTouchableOpacity>
              <VUView width={15} />
            </VUView>
          </VUView>
          <ActionSheet ref={actionSheetRef}>
            <VUView mt={2} mb={4}>
              <VUView width="100%">
                <VUTouchableOpacity onPress={handleUplodVideo} my={2} mx={4}>
                  <VUText fontSize={18} textAlign="center" color="#666">
                    Upload Video
                  </VUText>
                </VUTouchableOpacity>
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
        </VUView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;
