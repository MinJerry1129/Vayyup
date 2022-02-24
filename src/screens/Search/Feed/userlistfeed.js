import React, {useEffect, useState, memo} from 'react';
import {AppStyles} from 'src/AppStyles';
import {VUView, VUText, VUImage, VUTouchableOpacity} from 'common-components';
import {IonIcon} from 'src/icons';
import {useNavigation} from '@react-navigation/native';

function UserListFeed({item,index}){
    const [user, setUser] = useState(item);
    const navigation = useNavigation();
    
    const handleUserProfilePressed = (connectedUser) => {
        
        navigation.push('UserProfile', {
          user: connectedUser,
          showBack: true,
        });
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
                    {user.username}
                    </VUText>
                    <VUText fontSize={14} color={AppStyles.color.textBlue} mb={1}>
                        {user.fullname}
                    </VUText>
                </VUView>
                </VUView>
            </VUView>
        </VUTouchableOpacity>
    )
}

export default memo(UserListFeed);
