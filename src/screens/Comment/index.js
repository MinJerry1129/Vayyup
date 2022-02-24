import React, { useState, useEffect, useRef } from 'react';
import { Platform, FlatList, Dimensions, Alert, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
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
import { AppStyles, suggestionStyle } from 'src/AppStyles';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { updateFeed } from 'src/redux/reducers/actions';
import { useNavigation } from '@react-navigation/core';
import { IonIcon } from 'src/icons';
import { updateVideo } from 'src/redux/reducers/video.actions';
import MentionsTextInput from 'react-native-mentions';
import ParsedText from 'react-native-parsed-text';
import { getFollowers, getFollowing } from 'src/services/social';
import { EU } from 'react-native-mentions-editor'
import { followUser, unfollowUser } from 'src/services/social';
import { getBlocking } from 'src/services/social';
import Header from '../../common-components/Header';

const Comment = ({ route, onBack }) => {
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
  const { item = {}, index, type } = route.params;
  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [sendloading, setSendLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [likelist, setLikeList] = useState([]);
  const [blocklist, setBlockList] = useState([]);
  const [editcomment, setEditComment] = useState(false);
  const [commentid, setCommentID] = useState("");

  const [commentmsg, setCommentMsg] = useState("");
  const [keyword, setKeyword] = useState("");

  const dispatch = useDispatch();
  const videoType = type === 'competition' || type === 'myCompetitionVideos' ? 'entries' : 'videos';
  const navigation = useNavigation();
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
          .where('id', '==', followers[a].id)
          .get()
          .then((res) => {

            if (res.size > 0) {
              res.forEach((docs) => {
                if (docs.data().hasOwnProperty('username'))
                  tempUsers.push(docs.data())
              })
            }
          })
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

  }, [])

  useEffect(() => {
    const loadData = async () => {
      const blockusers = await getBlocking(user.id)
      firestore()
        .collection(videoType)
        .doc(item.id)
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

      setBlockList(blockusers);
      firestore()
        .collection(videoType)
        .doc(item.id)
        .collection('comments')
        .orderBy('date')
        .onSnapshot(snapshot => {
          if (snapshot) {
            const list = [];
            try {
              snapshot.forEach((obj) => {
                const comment_data = obj.data();
                let exist = blockusers.filter(function (v) { return v.id == comment_data.user.uid; });
                if (exist.length == 0) {
                  list.push({ ...obj.data(), id: obj.id })
                }
              });
            } catch (e) {
              console.log(e);
            }

            const allComments = [
              ...comments,
              ...list
                .filter(comment => comment.date)
                .map(comment => ({
                  _id: comment.id,
                  text: comment.text,
                  createdAt: comment.date.toDate(),
                  like: comment.like,
                  reply: comment.reply,
                  user: {
                    _id: comment.user.uid,
                    name: comment.user.name,
                    avatar: comment.user.profile,
                  },
                })),
            ];
            setComments(allComments);
            setLoading(false);
          } else {
            setComments([]);
          }
        });
    }
    loadData()
  }, [item, dispatch, index, videoType, type, user]);

  const handleSaveComment = async () => {
    if (!editcomment) {
      if (commentmsg.trim() != "") {
        const { fullname = '', profile = '', id = '', username = '' } = user;
        console.log("comment", commentmsg);
        let comment = commentmsg.split(" ");

        console.log('comment.length', comment.length)
        for (let a in comment) {
          if (comment[a].includes('@')) {
            let userName = comment[a].slice(1, comment[a].length)
            let user = pseudoUsers.find(item => item.username == userName);
            if (user != undefined) {
              comment[a] = `@[${userName}](id:${user.id})`
            }
          }
        }

        setSendLoading(true)
        await firestore()
          .collection(videoType)
          .doc(item.id)
          .collection('comments')
          .add({
            text: comment.join(" "),
            date: firebase.firestore.FieldValue.serverTimestamp(),
            like: 0,
            reply: 0,
            user: {
              name: fullname,
              profile: profile,
              uid: id,
              username: username
            },
          });
        setCommentMsg("")

        const batch = firestore().batch();
        const replyRef = firestore()
          .collection(videoType)
          .doc(item.id);
        // batch.update(replyRef, {
        //   ["comments"]: firebase.firestore.FieldValue.increment(1),
        // });
        await batch.commit();


        if (type === 'competition') {
          dispatch(
            updateFeed({ ...item, comments: comments.length + 1 }, index),
          );
        } else if (type != 'myCompetitionVideos' && type != 'myVideos') {
          dispatch(
            updateVideo({ ...item, comments: comments.length + 1 }, index),
          );
        }
        setSendLoading(false)
      } else {
        console.log("ddddddddddddddddddddddddddddd")
      }
    } else {
      if (commentmsg.trim() != "") {
        console.log("comment", commentmsg);
        let comment = commentmsg.split(" ");

        console.log('comment.length', comment.length)
        for (let a in comment) {
          if (comment[a].includes('@')) {
            let userName = comment[a].slice(1, comment[a].length)
            let user = pseudoUsers.find(item => item.username == userName);
            if (user != undefined) {
              comment[a] = `@[${userName}](id:${user.id})`
            }
          }
        }

        setSendLoading(true)
        const batch = firestore().batch();
        const likeRef = firestore()
          .collection(videoType)
          .doc(item.id)
          .collection('comments')
          .doc(commentid);
        batch.update(likeRef, {
          ["text"]: comment.join(" "),
        });
        await batch.commit();
        setCommentMsg("");
        setEditComment(false);
        setSendLoading(false);
      } else {
        setEditComment(false);
      }
    }

  }

  const onDeleteComment = async comment => {

        setSendLoading(true);
        const batch = firestore().batch();
        const blockingRef = firestore()
          .collection(videoType)
          .doc(item.id)
          .collection('comments')
          .doc(comment._id);
        batch.delete(blockingRef);
    
        const replyRef = firestore()
          .collection(videoType)
          .doc(item.id);
        batch.update(replyRef, {
          ['comments']: firebase.firestore.FieldValue.increment(-1),
        });
    
        await batch.commit();
    
        if (type === 'competition') {
          dispatch(updateFeed({ ...item, comments: comments.length - 1 }, index));
        } else if (type != 'myCompetitionVideos' && type != 'myVideos') {
          dispatch(updateVideo({ ...item, comments: comments.length - 1 }, index));
        }
    
        setSendLoading(false);
        Toast.show('Comment Deleted Successfully.', Toast.LONG);
      };

  const onEditComment = async (comment) => {
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

    setCommentID(comment._id);
    setCommentMsg(commentText.join(" "));
    setEditComment(true);
  }

  const onLongPressComment = (comment) => {
    console.log(user.id);
    if (comment.user._id === user.id) {
      Alert.alert(
        "Manage Comment & Replies",
        "Are you sure you want to manage the comment?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          { text: "Delete", onPress: (onDeleteComment.bind(this, comment)) },
          { text: "Edit", onPress: (onEditComment.bind(this, comment)) }
        ]
      )
    }
  }

  const handleReplyComment = (comment) => {
    navigation.navigate('Reply', { type, item, comment });
  }
  const onLikeComment = async (comment) => {
    let exist = likelist.filter(function (v) { return v.commentid == comment._id });
    if (exist.length == 0) {
      await firestore()
        .collection(videoType)
        .doc(item.id)
        .collection('like')
        .add({
          commentid: comment._id,
          uid: user.id
        });

      const batch = firestore().batch();
      const likeRef = firestore()
        .collection(videoType)
        .doc(item.id)
        .collection('comments')
        .doc(comment._id);
      batch.update(likeRef, {
        ["like"]: firebase.firestore.FieldValue.increment(1),
      });
      await batch.commit();
    }
  }

  const onUnLikeComment = async (comment) => {
    const snapshot = await firestore()
      .collection(videoType)
      .doc(item.id)
      .collection('like')
      .where('commentid', '==', comment._id)
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
        .doc(comment._id);
      batch.update(likeRef, {
        ["like"]: firebase.firestore.FieldValue.increment(-1),
      });
      await batch.commit();
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
    console.log('suggested users', suggestions);
    setUsers(suggestions)
  }

  const checklike = (comment) => {
    let exist = likelist.filter(function (v) { return v.commentid == comment._id });
    if (exist.length == 0) {
      return true;
    } else {
      return false;
    }
  }


  const handleUserProfilePressedFromComment = (res) => {
    console.log('res', res)

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
    console.log('pattern matches ===>', indexes[0]?.id)
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
  }

  const renderItem = ({ item: comment }) => (
    <VUTouchableOpacity
      onLongPress={onLongPressComment.bind(this, comment)}
      onPress={handleReplyComment.bind(this, comment)}>
      <VUView key={`comment-${comment.id}`} flexDirection="row" py={2} px={2}>
        <VUView>
          <VUTouchableOpacity
            onPress={handleUserProfilePressed.bind(this, comment)}>
            {comment.user.avatar ? (
              <VUView m={'5px'}>
                <VUImage
                  width={60}
                  height={60}
                  source={{ uri: comment.user.avatar }}
                  resizeMode="stretch"
                  borderRadius={100}
                />
              </VUView>
            ) : (
              <IonIcon name="person-circle-outline" size={60} color="#bbb" />
            )}
          </VUTouchableOpacity>
        </VUView>
        <VUView flex={1} flexDirection="column" justifyContent="space-between">
          <VUView my={1} mx={1}>
            <VUView>
              <VUTouchableOpacity
                onPress={handleUserProfilePressed.bind(this, comment)}>
                <VUText
                  fontSize={12}
                  fontFamily={AppStyles.fontName.robotoBold}
                  color={AppStyles.color.textBlue}>
                  @{comment.user.name}
                </VUText>
              </VUTouchableOpacity>
            </VUView>
          </VUView>
          <VUView my={1} mx={1}>
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
                {comment.text}
              </ParsedText>

            </VUView>
          </VUView>
          <VUView my={1} mx={1}>
            <VUView>
              <VUText
                fontSize={10}
                fontFamily={AppStyles.fontName.robotoBold}
                color={AppStyles.color.textBlue}>
                {comment.reply === 0 ? (
                  <>Reply</>
                ) : (
                  <>{comment.reply} Replies</>
                )}
              </VUText>
            </VUView>
          </VUView>
        </VUView>
        <VUView width={30} flexDirection="row" alignItems="center">
          <VUView>
            {checklike(comment) ? (
              <VUTouchableOpacity
                onPress={onLikeComment.bind(this, comment)}
                alignSelf="center">
                <IonIcon
                  name="heart-outline"
                  size={25}
                  color={AppStyles.color.textBlue}
                />
              </VUTouchableOpacity>
            ) : (
              <VUTouchableOpacity
                onPress={onUnLikeComment.bind(this, comment)}
                alignSelf="center">
                <IonIcon name="heart" size={25} color="#F00" />
              </VUTouchableOpacity>
            )}
            <VUText
              fontSize={12}
              textAlign="center"
              fontFamily={AppStyles.fontName.robotoRegular}
              color={AppStyles.color.textBlue}
              mb={1}>
              {comment.like}
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

  if (loading) {
    return (
      <Overlay>
        <ActivityIndicator animating={loading} />
      </Overlay>
    );
  }

  const addEmojiMsg = (text) => {
    console.log(text)
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
    // console.log('items in render' , item)
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
            <Image
              source={{ uri: item.profile }}
              style={suggestionStyle.userImg}
            />
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
        <Header headerTitle={'Comments'} onLeftPress={handleBackPressed} />
        <VUView flex={1}>
          {sendloading && (
            <VUView>
              <ActivityIndicator animating={sendloading} />
            </VUView>
          )}
          {/* {count > 1 ? */}

          <FlatList
            data={comments}
            renderItem={renderItem}
            keyExtractor={item => item._id}
          />
        </VUView>

        <VUView>

          <FlatList
            horizontal
            data={emojidata}
            renderItem={renderEmojiItem}
            keyExtractor={item => item.id}
          />
        </VUView>

        <VUView width="100%" height="1px" bg={AppStyles.color.textBlue} />
        <VUView width="100%" flexDirection="row" justifyContent="space-between">
          <VUView width={5} height="100%" />

          <MentionsTextInput
            ref={commentInputRef}
            useNativeDriver={false}
            textInputStyle={suggestionStyle.textInput}
            suggestionsPanelStyle={{ backgroundColor: '#fff' }}
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
            value={commentmsg}
            onChangeText={val => {
              setCommentMsg(val);
            }}
            triggerCallback={res => updateSuggestion(res)}
            renderSuggestionsRow={renderSuggestionsRow}
            suggestionsData={users} // array of objects
            keyExtractor={(item, index) => item.name}
            suggestionRowHeight={45}
            horizontal={false} // default is true, change the orientation of the list
            MaxVisibleRowCount={3} // this is required if horizontal={false}
            placeholder={'Comment here...'}
            placeholderTextColor={AppStyles.color.textBlue}
          />
          <VUView
            width={40}
            flexDirection="column"
            justifyContent="space-between">
            <VUView height={5} />
            <VUTouchableOpacity onPress={handleSaveComment} alignSelf="center">
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
export default Comment;