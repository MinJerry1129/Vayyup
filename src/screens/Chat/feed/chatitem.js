import React, {useEffect, useState, memo} from 'react';
import {AppStyles} from 'src/AppStyles';
import firestore from '@react-native-firebase/firestore';
import {VUView,VUText, VUImage, VUTouchableOpacity, VUVideo, SafeAreaView,VUTextInput} from 'common-components';
import {IonIcon,AntDesignIcon} from 'src/icons';
import {useNavigation} from '@react-navigation/native';
import {Alert, Keyboard,StyleSheet,Dimensions} from 'react-native';
import ImageView from "react-native-image-viewing";

function ChatItem({item,index,userid, currentuserid,onEditMsg}){
    const windowWidth = Dimensions.get('window').width;
    const navigation = useNavigation();
    const [msg, setMsg] = useState(item);
    const [visible, setIsVisible] = useState(false);
    const [playvideo, setPlayVideo] = useState(true);

    const images = [
        {
          uri: item.text,
        }
      ];
    

  const convertTSToDate = (timestamp) => {
    let t = new Date(timestamp * 1000);
    return t.toLocaleString();
  };
  const onDeleteComment = async (msg) => {
    const batch = firestore().batch();
    const smsgRef = firestore()
      .collection('chats')
      .doc(userid)
      .collection('userlist')
      .doc(currentuserid)
      .collection('chatlist')
      .doc(msg._id);
    batch.delete(smsgRef);

    const rmsgRef = firestore()
      .collection('chats')
      .doc(currentuserid)
      .collection('userlist')
      .doc(userid)
      .collection('chatlist')
      .doc(msg._id);
    batch.delete(rmsgRef);
    await batch.commit();
  };
  const onEditComment = (msg) => {
    onEditMsg(msg, index);
  };
    const onLongPressComment = (msg) => {
      if (msg.status == 'send') {
        if (msg.type == 'text') {
          Alert.alert(
            'Manage Message',
            'Are you sure you want to manage the Message?',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'Delete', onPress: onDeleteComment.bind(this, msg)},
              {text: 'Edit', onPress: onEditComment.bind(this, msg)},
            ],
          );
        } else if (msg.type == 'image') {
          Alert.alert(
            'Manage Message',
            'Are you sure you want to manage the Message?',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'Delete', onPress: onDeleteComment.bind(this, msg)},
            ],
          );
        }
      } else {
        console.log("you're not user");
      }
    };
    
    const handleUserProfilePressed = (msg) => {
        dissMissKeyBoard(true, function() {
            setTimeout(() => {
            navigation.navigate('UserProfile', {
                user: {...msg.user, id: msg.user._id},
                showBack: true,
            });
            }, 125);
        });
    };

    const onVisibleImageView=() =>{
        setIsVisible(true);
    }

    const onPlayVideo=()=>{
        let playstatus = playvideo;
        setPlayVideo(!playstatus);
    }
    
    function dissMissKeyBoard(isKeyboardNeedToClose, callback) {
        Keyboard.dismiss();
        callback();
    }      

    return(
        <VUView >            
            {msg.status != "send" ?
                <VUView flexDirection="row" justifyContent="space-between">
                    <VUView
                        key={`followers-${msg._id}`}
                        flexDirection="row"
                        py={1}
                        px={1}
                        m={'1px'}>
                        <VUView justifyContent="space-between">
                            <VUView></VUView>
                            <VUTouchableOpacity onPress = {handleUserProfilePressed.bind(this, msg)}>
                                {msg.user.avatar ? (
                                    <VUView m={'5px'}>
                                    <VUImage
                                        width="35px"
                                        height="35px"
                                        source={{uri: msg.user.avatar}}
                                        resizeMode="cover"
                                        borderRadius={20}
                                    />
                                    </VUView>
                                ) : (
                                    <IonIcon name="person-circle-outline" size={40} color="#bbb" />
                                )}
                            </VUTouchableOpacity>
                            
                            <VUView></VUView>
                        </VUView>
                        <VUView justifyContent="space-between" bg={"#5E17EB"} py={2} px={2} borderRadius={10} maxWidth={windowWidth - 50}>
                            {msg.type == "text" &&
                                <VUText fontSize={14} color={AppStyles.color.white} mb={1}>
                                    {msg.text}
                                </VUText>
                            }
                            {msg.type == "image" &&
                                <VUTouchableOpacity onPress={onVisibleImageView}>
                                    <VUImage
                                        width={windowWidth - 100}
                                        height="200px"
                                        source={{uri: msg.text}}
                                        resizeMode="cover"
                                        borderRadius={20}
                                    />
                                </VUTouchableOpacity>
                            }
                            {msg.type == "video" &&
                                <VUTouchableOpacity onPress={onPlayVideo}>
                                    {playvideo?
                                        <VUView
                                            width={windowWidth - 100}
                                            height={200}
                                            alignItems="center"
                                            justifyContent="center"
                                            bg={AppStyles.color.black}>
                                            <AntDesignIcon name={'play'} size={64} color="#bbb" />
                                        </VUView>
                                        :
                                        <VUVideo
                                            source={{
                                                uri: msg.text,
                                                codec: 'mp4',
                                            }}
                                            volume={0}
                                            width={windowWidth - 100}
                                            height={200}
                                            resizeMode="contain"
                                            repeat={true}
                                            paused={playvideo}
                                        />
                                    }
                                </VUTouchableOpacity>
                            }                           
                            <VUText fontSize={"9px"} color={AppStyles.color.white} mb={1}>
                            {convertTSToDate(msg.createdAt.seconds)}
                            </VUText>                        
                        </VUView>                       
                    </VUView>
                    <VUView></VUView>
                </VUView>                
                :
                <VUTouchableOpacity onLongPress={onLongPressComment.bind(this, msg)}>
                    <VUView flexDirection="row" justifyContent="space-between">
                        <VUView flex={1}></VUView>
                        <VUView
                            key={`followers-${msg._id}`}
                            flexDirection="row"
                            py={1}
                            px={1}
                            m={'1px'}>
                            <VUView flex={1}></VUView>
                            <VUView justifyContent="space-between" maxWidth={windowWidth - 50} bg={AppStyles.color.primary} py={2} px={2} borderRadius={10}>                        
                                {msg.type == "text" &&
                                    <VUText fontSize={14} color={AppStyles.color.white} mb={1}>
                                        {msg.text}
                                    </VUText>
                                }
                                {msg.type == "image" &&
                                    <VUTouchableOpacity onPress={onVisibleImageView} onLongPress={onLongPressComment.bind(this, msg)}>
                                        <VUImage
                                            width={windowWidth - 100}
                                            height="200px"
                                            source={{uri: msg.text}}
                                            resizeMode="cover"
                                            borderRadius={20}
                                        />
                                    </VUTouchableOpacity>
                                }
                                {msg.type == "video" &&
                                    <VUTouchableOpacity onPress={onPlayVideo} onLongPress={onLongPressComment.bind(this, msg)}>
                                        {playvideo?
                                        <VUView
                                            width={windowWidth - 100}
                                            height={200}
                                            alignItems="center"
                                            justifyContent="center"
                                            bg={AppStyles.color.black}>
                                            <AntDesignIcon name={'play'} size={64} color="#bbb" />
                                        </VUView>
                                        :
                                        <VUVideo
                                            source={{
                                                uri: msg.text,
                                                codec: 'mp4',
                                            }}
                                            volume={0}
                                            width={windowWidth - 100}
                                            height={200}
                                            resizeMode="contain"
                                            repeat={true}
                                            paused={playvideo}
                                        />
                                        }
                                    </VUTouchableOpacity>
                                }
                                <VUText fontSize={"9px"} color={AppStyles.color.white} mb={1}>
                                    {convertTSToDate(msg.createdAt.seconds)}
                                </VUText>
                            </VUView>
                            <VUView justifyContent="space-between">
                                <VUView></VUView>
                                {msg.user.avatar ? (
                                    <VUView m={'2px'}>
                                    <VUImage
                                        width="25px"
                                        height="25px"
                                        source={{uri: msg.user.avatar}}
                                        resizeMode="cover"
                                        borderRadius={15}
                                    />
                                    </VUView>
                                ) : (
                                    <IonIcon name="person-circle-outline" size={30} color="#bbb" />
                                )}
                                <VUView></VUView>
                            </VUView>              
                        </VUView>                
                    </VUView>
                </VUTouchableOpacity>
            }                
            
            {msg.type == "image" &&
                <ImageView
                    images={images}
                    imageIndex={0}
                    visible={visible}
                    animationType={"slide"}
                    swipeToCloseEnabled={false}
                    onRequestClose={()=>setIsVisible(false)}
                />
            }

        </VUView>
        
    );
}

export default memo(ChatItem);
