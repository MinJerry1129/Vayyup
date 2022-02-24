import React, {useState, useEffect} from 'react';
import {TouchableOpacity, Dimensions, FlatList,Alert,StyleSheet} from 'react-native';
import {getBlockers, getBlocking,unblockUser} from 'src/services/social';
import Toast from 'react-native-simple-toast';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {AppStyles} from 'src/AppStyles';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import * as yup from 'yup';
import 'yup-phone';
import {FontAwesomeIcon, IonIcon} from 'src/icons';

const windowDimensions = Dimensions.get('window');

import {SafeAreaView, VUView, VUText, VUTouchableOpacity, VUImage,Overlay,ActivityIndicator} from 'common-components';
import Header from '../../common-components/Header';

const BlockUserList = () => {
  const [loading, setLoading] = useState(false);
  const [profileBlocking, setProfileBlocking] = useState([]);
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setProfileBlocking(await getBlocking(user.id));
      setLoading(false);
    };
    loadData();
  }, [user.id]);

  const handleBackPressed = () => {
    navigation.navigate('Settings');
  };

  const setUnBlockUser = async (userFollower) => {
    setLoading(true);
    await unblockUser(userFollower, user);
    setProfileBlocking(await getBlocking(user.id));
    setLoading(false);
  }

  const handleUnBlockPressed = (userFollower) => {
    
    Alert.alert(
      "",
      "Are you sure you want to unblock "+ userFollower.name + "?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Confirm", onPress: (setUnBlockUser.bind(this, userFollower)) }
      ]
    )
  };

  const styles = StyleSheet.create({
    overlay: {
      backgroundColor: 'rgb(255,255,255)'
    },    
  });

  const renderItem = ({item: userFollower}) => (
    <VUView
      key={`followers-${userFollower.id}`}
      flexDirection="row"
      py={2}
      px={2} >
      <VUView>
        {userFollower.profile ? (
          <VUView m={'5px'}>
            <VUImage
              width="65px"
              height="65px"
              source={{uri: userFollower.profile}}
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
          <VUText fontSize={12} fontFamily={AppStyles.fontName.robotoRegular} color={AppStyles.color.textBlue} mb={1}>
            {userFollower.name}
            {/* Username */}
          </VUText>
        </VUView>
      </VUView>

      <VUView flexDirection="row" alignItems="center">
        <VUTouchableOpacity
          onPress={handleUnBlockPressed.bind(this, userFollower)}
          my={3}
          mx={2}
          px={3}
          py={1}
          borderWidth={1}
          borderColor={AppStyles.color.textBlue}
          borderRadius={24}>
          <VUText color={AppStyles.color.textBlue}>Unblock</VUText>
        </VUTouchableOpacity>
      </VUView>
    </VUView>
  );


  return (
    <SafeAreaView flex={1} bg={AppStyles.color.bgWhite} pb={3}>
          {/* <VUView
            width="100%"
            py={2}
            flexDirection="row"
            justifyContent="space-between">
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
                Blocked Users
              </VUText>
            </VUView>
            <VUView width={40} />
          </VUView>
          <VUView width="100%" height = "1px" bg={AppStyles.color.textBlue}/> */}
          
          <Header 
          headerTitle={'Blocked Users'}
          onLeftPress={handleBackPressed}
        />

          {loading ? 
            <VUView>
              <ActivityIndicator animating={loading}/>
            </VUView>
            :
            <VUView flex={1} mb={10} px={3}>
              {profileBlocking.length === 0 && (
                <VUView alignItems="center" mt={5}>
                  <VUText color={AppStyles.color.grey}>No blocked user</VUText>
                </VUView>
              )}
              {profileBlocking.length > 0 && (
                <FlatList
                  data={profileBlocking}
                  renderItem={renderItem}
                  keyExtractor={item => item.id}
                />
              )}            
            </VUView>
          }
          
    </SafeAreaView>
  );
  
};

export default BlockUserList;
