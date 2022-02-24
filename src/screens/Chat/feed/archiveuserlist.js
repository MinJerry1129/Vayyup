import React, {useEffect, useState,memo} from 'react';
import {AppStyles} from 'src/AppStyles';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import {VUView,VUText, VUImage, VUTouchableOpacity, ActivityIndicator, SafeAreaView,VUTextInput} from 'common-components';
import {IonIcon,FontAwesomeIcon} from 'src/icons';
import {useNavigation} from '@react-navigation/native';
import {Alert} from 'react-native';

function ArchiveUserList({item,index,userid}){
    const [user, setUser] = useState(item);
    const navigation = useNavigation();
    
    const handleChatRoom = (connectedUser) => {
        navigation.push('ChatRoom', {
            currentuser: connectedUser
        });
    };
    const onLongPressChat = (connectedUser) => {
        Alert.alert(
            'Manage Chat',
            'Are you sure you want to manage the Chat?',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'Delete', onPress: onDeleteChat.bind(this, connectedUser)},
              {text: 'UnArchive', onPress: onUnArchiveChat.bind(this, connectedUser)},
            ],
        );
    };
    const convertTSToDate = (lastdate) =>{
        if(lastdate){
            let t = new Date(lastdate.seconds * 1000);
            return t.toLocaleString();
        }
        return "";
    }

    const onDeleteChat = async (connectedUser) =>{
        const batch = firestore().batch();
        const snapshot = await firestore()
        .collection('chats')
        .doc(userid)
        .collection('userlist')
        .doc(connectedUser.id)
        .collection("chatlist")
        .get();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        const chatRef = firestore()
        .collection('chats')
        .doc(userid)
        .collection('userlist')
        .doc(connectedUser.id);
        batch.delete(chatRef);
        batch.commit();
    }

    const onUnArchiveChat = (connectedUser) =>{
        const batch = firestore().batch();
        const smsgRef = firestore()
        .collection('chats')
        .doc(userid)
        .collection('userlist')
        .doc(connectedUser.id);
        batch.update(smsgRef, {
            ['archive']: "no",
        });
        batch.commit();
    }

    return(
        <VUTouchableOpacity onPress={handleChatRoom.bind(this, user)} onLongPress={onLongPressChat.bind(this,user)}>
            <VUView
                key={`ChatLists-${user.id}`}
                flexDirection="row"
                py={2}
                px={3}>
                <VUView justifyContent="space-between">
                    <VUView></VUView>
                    <VUView>
                        {user.profile ? (
                            <VUView m={'5px'} alignItems="center">
                                <VUImage
                                    width="65px"
                                    height="65px"
                                    source={{uri: user.profile}}
                                    resizeMode="cover"
                                    borderRadius={40}
                                />
                            </VUView>
                        ) : (
                            <IonIcon name="person-circle-outline" size={75} color="#bbb" />
                        )}
                        {user.status == "no" && <IonIcon name="ellipse" style={{position: 'absolute', top:53, left:53}} size={15} color="#f00" />}
                    </VUView>
                    <VUView></VUView>
                </VUView>
                <VUView
                    flex={1}
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    my={3}
                    mx={2}>
                    <VUView>
                        <VUText fontSize={16} color={AppStyles.color.textBlue} fontFamily={AppStyles.fontName.robotoMedium} mb={1}>
                        {user.fullname}
                        </VUText>
                        <VUText fontSize={14} color={AppStyles.color.textBlue} fontFamily={AppStyles.fontName.robotoRegular} numberOfLines={2} mb={1}>
                            {user.lastmsg}
                        </VUText>
                        <VUText fontSize={10} color={AppStyles.color.textBlue}  fontFamily={AppStyles.fontName.robotoRegular} mb={1}>
                            {convertTSToDate(user.lastdate)}
                        </VUText>
                    </VUView>
                </VUView>                
            </VUView>            
        </VUTouchableOpacity>
    );
}

export default memo(ArchiveUserList);
