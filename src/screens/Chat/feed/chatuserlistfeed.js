import React, {useEffect, useState,memo} from 'react';
import {AppStyles} from 'src/AppStyles';
import { FlatList, Dimensions } from 'react-native';
import {FlatListSlider} from 'react-native-flatlist-slider';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import {VUView,VUText, VUImage, VUTouchableOpacity, ActivityIndicator, SafeAreaView,VUTextInput} from 'common-components';
import {IonIcon,FontAwesomeIcon} from 'src/icons';
import { ScrollView } from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';

function ChatUserListFeed({item,index}){
    const [user, setUser] = useState(item);
    const navigation = useNavigation();
    
    const handleUserProfilePressed = (connectedUser) => {
        if(connectedUser.type == "group"){
            navigation.push('GroupChatRoom', {
                currentuser: connectedUser
            });
        }else{
            navigation.push('ChatRoom', {
                currentuser: connectedUser
            });
        }
        
    };
    return(
        <VUTouchableOpacity onPress={handleUserProfilePressed.bind(this, user)}>
            <VUView
                key={`followers-${user.id}`}
                flexDirection="row"
                py={2}
                px={3}>
                <VUView>
                {user.profile ? (
                    <VUView m={'5px'}>
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
                {user.type == "group" && <FontAwesomeIcon name="group" style={{position: 'absolute', top:50, left:50}} size={20} color="#4910BC" />}
                </VUView>
                <VUView
                flex={1}
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                my={3}
                mx={2}>
                <VUView>
                    <VUText fontSize={16} color={AppStyles.color.textBlue} fontWeight="bold" mb={1}>
                    {user.type?user.fullname:user.username}
                    </VUText>
                    <VUText fontSize={14} color={AppStyles.color.textBlue} mb={1}>
                        {user.type?user.lastmsg:user.fullname}
                    </VUText>
                </VUView>
                </VUView>
            </VUView>
        </VUTouchableOpacity>
    );
}

export default memo(ChatUserListFeed);