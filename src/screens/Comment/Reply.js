import React, { useState, useEffect, useRef } from 'react';
import { Platform, FlatList, Dimensions, Alert, StyleSheet, Image, TouchableOpacity, View, Text } from 'react-native';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-simple-toast';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import { useSelector } from 'react-redux';
import { Keyboard } from 'react-native';
import {
  VUView,
  VUTouchableOpacity,
  VUText,
  SafeAreaView,
  VUTextInput,
  VUImage,
  KeyboardAvoidingView
} from 'common-components';
import Overlay from 'common-components/Overlay';
import ActivityIndicator from 'common-components/ActivityIndicator';
import { AppStyles } from 'src/AppStyles';
import { useNavigation } from '@react-navigation/core';
import { IonIcon } from 'src/icons';
import MentionsTextInput from 'react-native-mentions';
import ParsedText from 'react-native-parsed-text';
import { getFollowers, getFollowing } from 'src/services/social';
import { EU } from 'react-native-mentions-editor'
import { getBlocking } from 'src/services/social';
import { suggestionStyle } from '../../AppStyles';
import Header from '../../common-components/Header';

const Reply = ({ route, onBack }) => {
  const emojidata = [
    { id: '0', text: '🤣', },
    { id: '1', text: '😍', },
    { id: '2', text: '❤️', },
    { id: '3', text: '🔥', },
    { id: '4', text: '👏', },
    { id: '5', text: '😱', },
    { id: '6', text: '😛', },
    { id: '7', text: '🌹', },
    { id: '8', text: '👌', },
    { id: '9', text: '👍', },
    { id: '10', text: '😯', },
    { id: '11', text: '💯', },
  ];

  const windowWidth = Dimensions.get('window').width;
  const [commentmsg, setCommentMsg] = useState("");
  const [keyword, setKeyword] = useState("");
  const { item = {}, comment = {}, type } = route.params;
  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [sendloading, setSendLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [likelist, setLikeList] = useState([]);
  const [editreply, setEditReply] = useState(false);
  const [replyid, setReplyID] = useState("");
  const [blocklist, setBlockList] = useState([]);

  const dispatch = useDispatch();
  const videoType = type === 'competition' ? 'entries' : 'videos';
  const navigation = useNavigation();
  const commentInputRef = useRef();
  const [users, setUsers] = useState([]);
  const [pseudoUsers, setPseudoUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const blockusers = await getBlocking(user.id)
      setBlockList(blockusers);
      firestore()
        .collection(videoType)
        .doc(item.id)
        .collection('comments')
        .doc(comment._id)
        .collection('like')
        .where("uid", "==", user.id)
        .onSnapshot(snapshot => {
          if (snapshot) {
            const list = [];
            snapshot.forEach((obj) => {
              list.push({ ...obj.data(), id: obj.id })
            });
            const alllikes = [
              ...likelist,
              ...list
            ];
            setLikeList(alllikes);
          } else {
            setLikeList([])
          }
        })

      firestore()
        .collection(videoType)
        .doc(item.id)
        .collection('comments')
        .doc(comment._id)
        .collection('reply')
        .orderBy('date')
        .onSnapshot(snapshot => {
          if (snapshot) {
            const list = [];
            snapshot.forEach((obj) => {
              const comment_data = obj.data();
              let exist = blockusers.filter(function (v) { return v.id == comment_data.user.uid; });
              if (exist.length == 0) {
                list.push({ ...obj.data(), id: obj.id })
              }
            });
            const allReplies = [
              ...replies,
              ...list
                .filter(reply => reply.date)
                .map(reply => ({
                  _id: reply.id,
                  text: reply.text,
                  createdAt: reply.date.toDate(),
                  like: reply.like,
                  user: {
                    _id: reply.user.uid,
                    name: reply.user.name,
                    avatar: reply.user.profile,
                  },
                })),
            ];
            setReplies(allReplies);
            setLoading(false);
          } else {
            setReplies([]);
          }
        });
    }
    loadData()
  }, [item, dispatch, videoType, type, user]);

  useEffect(async () => {
    let tempUsers = [];
    firestore()
      .collection('users')
      .where('id', '!=', user.id)
      .get()
      .then((res) => {

        if (res.size > 0) {
          res.forEach((docs) => {
            if (docs.data().hasOwnProperty('username'))
              tempUsers.push(docs.data())
          })
        }
      })
    setUsers(tempUsers);
    setPseudoUsers(tempUsers);
  }, [])


  const handleSaveComment = async () => {
    if (!editreply) {
      if (commentmsg.trim() != "") {
        setSendLoading(true)
        const { fullname = '', profile = '', id = '' } = user;
        let comment1 = commentmsg.split(" ");

        for (let a in comment1) {
          if (comment1[a].includes('@')) {
            let userName = comment1[a].slice(1, comment1[a].length)
            let user = pseudoUsers.find(item => item.username == userName);
            if (user != undefined) {
              comment1[a] = `@[${userName}](id:${user.id})`
            }
          }
        }

        await firestore()
          .collection(videoType)
          .doc(item.id)
          .collection('comments')
          .doc(comment._id)
          .collection('reply')
          .add({
            text: comment1.join(" "),
            date: firebase.firestore.FieldValue.serverTimestamp(),
            like: 0,
            user: {
              name: fullname,
              profile: profile,
              uid: id,
            },
          });

        const batch = firestore().batch();
        const replyRef = firestore()
          .collection(videoType)
          .doc(item.id)
          .collection('comments')
          .doc(comment._id);
        batch.update(replyRef, {
          ["reply"]: firebase.firestore.FieldValue.increment(1),
        });

        const commentRef = firestore()
          .collection(videoType)
          .doc(item.id);
        // batch.update(commentRef, {
        //   ["comments"]: firebase.firestore.FieldValue.increment(1),
        // });

        await batch.commit();
        setCommentMsg("")
        setSendLoading(false)
      }
    } else {
      if (commentmsg.trim() != "") {
        let comment1 = commentmsg.split(" ");

        for (let a in comment1) {
          if (comment1[a].includes('@')) {
            let userName = comment1[a].slice(1, comment1[a].length)
            let user = pseudoUsers.find(item => item.username == userName);
            if (user != undefined) {
              comment1[a] = `@[${userName}](id:${user.id})`
            }
          }
        }

        setSendLoading(true)
        const batch = firestore().batch();
        const likeRef = firestore()
          .collection(videoType)
          .doc(item.id)
          .collection('comments')
          .doc(comment._id)
          .collection('reply')
          .doc(replyid);
        batch.update(likeRef, {
          ["text"]: comment1.join(" "),
        });
        await batch.commit();
        setCommentMsg("")
        setEditReply(false)
        setSendLoading(false)
      } else {
        setEditReply(false)
      }

    }
  }

  const onEditComment = async (reply) => {
    let commentText = comment.text.split(" ");
    for (let a in commentText) {
      if (commentText[a].includes('@')) {
        let reg = /@\[([^\]]+?)\]\(id:([^\]]+?)\)/gim;
        let indexes = [];
        let match;
        while ((match = reg.exec(commentText[a]))) {
          indexes.push({
            username: match[1],
            id: match[2],
            type: EU.specialTagsEnum.mention
          });
          commentText[a] = '@' + indexes[0]?.username
        }
      }
    }

    setReplyID(reply._id);
    setCommentMsg(commentText.join(" "));
    setEditReply(true);
  }

  const onDeleteComment = async (reply) => {
    setSendLoading(true)
    const batch = firestore().batch();
    const deleteRef = firestore()
      .collection(videoType)
      .doc(item.id)
      .collection('comments')
      .doc(comment._id)
      .collection('reply')
      .doc(reply._id);
    batch.delete(deleteRef);

    const replyRef = firestore()
      .collection(videoType)
      .doc(item.id)
      .collection('comments')
      .doc(comment._id);
    batch.update(replyRef, {
      ["reply"]: firebase.firestore.FieldValue.increment(-1),
    });
    await batch.commit();
    setSendLoading(false)
    Toast.show('Comment Deleted Successfully.', Toast.LONG);
  }

  const onLongPressComment = (reply) => {
    if (reply.user._id === user.id) {
      Alert.alert(
        "Manage Reply",
        "Are you sure you want to manage the Reply?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "Delete", onPress: (onDeleteComment.bind(this, reply)) },
          { text: "Edit", onPress: (onEditComment.bind(this, reply)) }
        ]
      )
    } else {
      console.log("you're not user");
    }
  }
  const onLikeComment = async (reply) => {
    let exist = likelist.filter(function (v) { return v.replyid == reply._id });
    if (exist.length == 0) {
      await firestore()
        .collection(videoType)
        .doc(item.id)
        .collection('comments')
        .doc(comment._id)
        .collection('like')
        .add({
          replyid: reply._id,
          uid: user.id
        });

      const batch = firestore().batch();
      const likeRef = firestore()
        .collection(videoType)
        .doc(item.id)
        .collection('comments')
        .doc(comment._id)
        .collection('reply')
        .doc(reply._id);
      batch.update(likeRef, {
        ["like"]: firebase.firestore.FieldValue.increment(1),
      });
      await batch.commit();
    }
  }

  const onUnLikeComment = async (reply) => {
    const snapshot = await firestore()
      .collection(videoType)
      .doc(item.id)
      .collection('comments')
      .doc(comment._id)
      .collection('like')
      .where('replyid', '==', reply._id)
      .where('uid', '==', user.id)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const batch = firestore().batch();
      const doc = snapshot.docs[0];
      batch.delete(doc.ref);

      const likeRef = firestore()
        .collection(videoType)
        .doc(item.id)
        .collection('comments')
        .doc(comment._id)
        .collection('reply')
        .doc(reply._id);
      batch.update(likeRef, {
        ["like"]: firebase.firestore.FieldValue.increment(-1),
      });
      await batch.commit();
    }
  }

  const checklike = (reply) => {
    let exist = likelist.filter(function (v) { return v.replyid == reply._id });
    if (exist.length == 0) {
      return true;
    } else {
      return false;
    }
  }

  const updateSuggestion = (text) => {
    let tempUsers = [...pseudoUsers];
    let suggestions = [];
    let filterText = text.slice(1, text.length);
    setKeyword(filterText);
    for (let a in tempUsers) {
      if (tempUsers[a].hasOwnProperty('username') && tempUsers[a].username.toLowerCase().includes(filterText.toLowerCase())) {
        suggestions.push(tempUsers[a])
      }
      else { }
    }
    setUsers(suggestions)
  }

  const handleUserProfilePressedFromComment = (res) => {

    let reg = /@\[([^\]]+?)\]\(id:([^\]]+?)\)/gim;
    let indexes = [];
    let match;
    while ((match = reg.exec(res))) {
      indexes.push({
        username: match[1],
        id: match[2],
        type: EU.specialTagsEnum.mention
      });
    }
    dissMissKeyBoard(true, function () {
      setTimeout(() => {
        navigation.navigate('UserProfile', {
          userId: indexes[0]?.id,
          showBack: true,
        });
      }, 125);
    })
  }

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
        type: EU.specialTagsEnum.mention
      });
    }
    return '@' + indexes[0]?.username;
    // let match = matchingString.match(pattern);

    // return `@${match[1]}`;
  }


  const renderItem = ({ item: reply }) => (
    <VUTouchableOpacity onLongPress={onLongPressComment.bind(this, reply)}>
      <VUView
        key={`reply-${reply.id}`}
        flexDirection="row"
        py={2}
        px={2} >
        <VUView>
          <VUTouchableOpacity onPress={handleUserProfilePressed.bind(this, reply)}>
            {reply.user.avatar ? (
              <VUView m={'5px'}>
                <VUImage
                  width={60}
                  height={60}
                  source={{ uri: reply.user.avatar }}
                  resizeMode="stretch"
                  borderRadius={100}
                />
              </VUView>
            ) : (
              <IonIcon name="person-circle-outline" size={60} color="#bbb" />
            )}
          </VUTouchableOpacity>
        </VUView>
        <VUView
          flex={1}
          flexDirection="column"
          justifyContent="space-between">
          <VUView
            my={1}
            mx={1}>
            <VUView>
              <VUTouchableOpacity onPress={handleUserProfilePressed.bind(this, reply)}>
                <VUText fontSize={12} fontFamily={AppStyles.fontName.robotoBold} color={AppStyles.color.textBlue}>
                  @{reply.user.name}
                </VUText>
              </VUTouchableOpacity>
            </VUView>
          </VUView>
          <VUView
            my={1}
            mx={1}>
            <VUView>
              <ParsedText
                style={{
                  fontSize: 12,
                  fontFamily: AppStyles.fontName.robotoRegular,
                  color: AppStyles.color.textBlue
                }}
                parse={
                  [{
                    pattern: /@\[([^\]]+?)\]\(id:([^\]]+?)\)/gim,
                    style: { fontFamily: AppStyles.fontName.robotoBold, color: AppStyles.color.textBlue },
                    onPress: (res) => handleUserProfilePressedFromComment(res),
                    renderText: renderText
                  }]
                }
                childrenProps={{ allowFontScaling: false }}
              >
                {reply.text}
              </ParsedText>
              {/* <VUText fontSize={12} fontFamily={AppStyles.fontName.robotoRegular} color={AppStyles.color.white}>
                      {reply.text}
                    </VUText> */}
            </VUView>
          </VUView>
        </VUView>
        <VUView width={30} flexDirection="row" alignItems="center">
          <VUView>
            {checklike(reply) ? (
              <VUTouchableOpacity onPress={onLikeComment.bind(this, reply)} alignSelf="center" ><IonIcon name="heart-outline" size={25} color={AppStyles.color.textBlue} /></VUTouchableOpacity>

            ) : (
              <VUTouchableOpacity onPress={onUnLikeComment.bind(this, reply)} alignSelf="center" ><IonIcon name="heart" size={25} color="#F00" /></VUTouchableOpacity>

            )}
            <VUText fontSize={12} textAlign="center" fontFamily={AppStyles.fontName.robotoRegular} color={AppStyles.color.textBlue} mb={1}>
              {reply.like}
            </VUText>
          </VUView>
        </VUView>
      </VUView>
    </VUTouchableOpacity>
  );

  const handleBackPressed = () => {
    dissMissKeyBoard(true, function () {
      setTimeout(() => {
        navigation.goBack();
      }, 125);
    });
  };
  function dissMissKeyBoard(isKeyboardNeedToClose, callback) {
    Keyboard.dismiss();
    callback();
  }
  // if (loading) {
  //   return (
  //     <Overlay>
  //       <ActivityIndicator />
  //     </Overlay>
  //   );
  // }
  const handleUserProfilePressed = (comment) => {
    dissMissKeyBoard(true, function () {
      setTimeout(() => {
        navigation.navigate('UserProfile', {
          user: { ...user, id: comment.user._id },
          showBack: true,
        });
      }, 125);
    });
  };
  const addEmojiMsg = (text) => {
    setCommentMsg(commentmsg + text)
  }
  const renderEmojiItem = ({ item }) => (
    <VUTouchableOpacity onPress={addEmojiMsg.bind(this, item.text)} >
      <VUView style={styles.item}>
        <VUText style={styles.title}>{item.text}</VUText>
      </VUView>
    </VUTouchableOpacity>
  );

  const renderSuggestionsRow = ({ item }) => {
    if (item.fullname != null) {
      return (
        <TouchableOpacity onPress={() => {
          let cmt = keyword.length > 0 ? commentmsg.slice(0, - keyword.length) : commentmsg;
          setCommentMsg(cmt.concat(`${item.username}` + ' '));
          commentInputRef.current.stopTracking()
          setUsers([...pseudoUsers])
          setKeyword('');
        }}>

          <VUView style={suggestionStyle.suggestionListItem}>
            {item.profile ? (
              <Image
                source={{ uri: item.profile }}
                style={suggestionStyle.userImg}
              />) : null}
            <VUView>
              <VUText style={suggestionStyle.fullName}>
                {item.fullname}
              </VUText>
              <VUText style={suggestionStyle.userName}>
                @{item.username}
              </VUText>
            </VUView>
          </VUView>
        </TouchableOpacity>
      )
    }
    else {
      return null
    }
  }


  return (
    <KeyboardAvoidingView>
      <SafeAreaView bg={AppStyles.color.bgWhite}>

        <Header
          headerTitle={'Replies'}
          onLeftPress={handleBackPressed}
        />
        {sendloading &&
          <VUView>
            <ActivityIndicator animating={sendloading} />
          </VUView>
        }
        <FlatList
          data={replies}
          renderItem={renderItem}
          keyExtractor={item => item._id}
        />
        <VUView>
          <FlatList
            horizontal
            data={emojidata}
            renderItem={renderEmojiItem}
            keyExtractor={item => item.id}
          />
        </VUView>
        <VUView width="100%" height="1px" bg={AppStyles.color.textBlue} />

        <VUView
          width="100%"
          flexDirection="row"
          justifyContent="space-between">
          <VUView width={5} height="100%" />
          {/* <VUTextInput
                width = {windowWidth - 60}            
                placeholder="Comment here..."        
                placeholderTextColor={AppStyles.color.white}
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                multiline={true}
                onChangeText={text => setCommentMsg(text) }
                value={commentmsg}
                color = {AppStyles.color.white}
              /> */}
          <MentionsTextInput
            ref={commentInputRef}
            textInputStyle={suggestionStyle.textInput}
            suggestionsPanelStyle={{ backgroundColor: '#fff' }}
            loadingComponent={() => {
              return (
                <VUView style={suggestionStyle.loadingComponent}>
                  <VUText style={{
                    fontSize: 15,
                    color: AppStyles.color.black,
                  }}>
                    No User Found
                  </VUText>
                </VUView>
              )
            }}
            textInputMinHeight={50}
            textInputMaxHeight={80}
            trigger={'@'}
            triggerLocation={'anywhere'} // 'new-word-only', 'anywhere'
            value={commentmsg}
            onChangeText={(val) => { setCommentMsg(val) }}
            triggerCallback={(res) => updateSuggestion(res)}
            renderSuggestionsRow={renderSuggestionsRow}
            suggestionsData={users} // array of objects
            keyExtractor={(item, index) => item.name}
            suggestionRowHeight={45}

            horizontal={false} // default is true, change the orientation of the list
            MaxVisibleRowCount={3} // this is required if horizontal={false}
            placeholder={'Comment here...'}
            placeholderTextColor={AppStyles.color.textBlue}
          />


          <VUView width={40} flexDirection="column" justifyContent="space-between">
            <VUView height={5} />
            <VUTouchableOpacity onPress={handleSaveComment} alignSelf="center" >
              <IonIcon name="send" size={20} color={AppStyles.color.textBlue} />
            </VUTouchableOpacity>
            <VUView height={5} />
          </VUView>
        </VUView>
      </SafeAreaView>
    </KeyboardAvoidingView>

  );
};
const styles = StyleSheet.create({
  item: {
    padding: 2,
    marginHorizontal: 3,
  },
  title: {
    fontSize: 18,
  },
});
export default Reply;