import React, {useState, useEffect} from 'react';
import {TouchableOpacity, Dimensions} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {
  VUView,
  VUText,
  VUImage,
  VUTouchableOpacity,
  SafeAreaView,
} from 'common-components';
import {AppStyles} from 'src/AppStyles';
import {IonIcon, FontAwesomeIcon, FontAwesome5Icon} from 'src/icons';
import {RESET_ACTION} from 'redux/reducers/action.types';
import Header from '../../common-components/Header';
import {settingsStyles} from './styles';

const routes = [
  {
    route: 'ContactUs',
    icon: 'chatbubble-outline',
    text: 'Contact Us',
  },
  {
    route: 'BlockUserList',
    icon: 'close-circle-outline',
    text: 'Blocked Users',
  },
];

const Settings = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleContactUs = () => {
    navigation.navigate('ContactUs');
  };
  const handleBlockUserList = () => {
    navigation.navigate('BlockUserList');
  };
  const handleLogout = async () => {
    await firebase.auth().signOut();
    dispatch({type: RESET_ACTION});
    // await AsyncStorage.removeItem('first-time');
  };

  const handleBackPressed = () => {
    // navigation.navigate('Profile');
    navigation.goBack();
  };

  const renderItem = (item, index) => {
    return (
      <VUTouchableOpacity
        style={settingsStyles.itemView}
        onPress={() => navigation.navigate(item.route)}>
        <>
          <VUView style={settingsStyles.leftIconView}>
            {item.text == 'Contact Us' ? (
              <VUImage
                source={require('../../../assets/contactUs2.png')}
                style={settingsStyles.iconSize}
                resizeMode={'contain'}
              />
            ) : (
              <IonIcon
                name={item.icon}
                style={{
                  fontSize: 22,
                  color: '#000',
                }}
              />
            )}
          </VUView>
          <VUText style={settingsStyles.text}>{item.text}</VUText>
          <VUView style={settingsStyles.leftIconView}>
            <IonIcon
              name={'chevron-forward'}
              style={{
                fontSize: 20,
                color: '#000',
              }}
            />
          </VUView>
        </>
      </VUTouchableOpacity>
    );
  };

  return (
    <SafeAreaView bg={AppStyles.color.bgWhite}>
      <VUView flex={1} pb={2}>
        <Header headerTitle={'Settings'} onLeftPress={handleBackPressed} />
        {routes.map((item, index) => {
          return renderItem(item, index);
        })}
        <VUTouchableOpacity
          style={settingsStyles.itemView}
          onPress={() => handleLogout()}>
          <>
            <VUView style={settingsStyles.leftIconView}>
              <IonIcon
                name={'power'}
                style={{
                  fontSize: 22,
                  color: AppStyles.color.btnColor,
                }}
              />
            </VUView>
            <VUText
              style={[
                settingsStyles.text,
                {
                  color: AppStyles.color.btnColor,
                },
              ]}>
              Logout
            </VUText>
          </>
        </VUTouchableOpacity>

        {/* <VUView alignItems="flex-start">
          <VUTouchableOpacity onPress={handleBackPressed}>
            <IonIcon
              name="chevron-back"
              size={36}
              color={AppStyles.color.textBlue}
            />
          </VUTouchableOpacity>
        </VUView>
        <VUView alignItems="center" p={3}>
          <VUText
            fontSize={16}
            fontFamily={AppStyles.fontName.robotoBold}
            color={AppStyles.color.textBlue}>
            Settings
          </VUText>
        </VUView> */}

        {/* <VUView p={2} alignItems="center" justifyContent="center">
          <VUTouchableOpacity
            onPress={handleEditProfile}
            alignItems="center"
            justifyContent="center"
            width="85%"
            height={45}
            borderColor={AppStyles.color.textBlue}
            borderWidth={1}
            borderRadius={24}>
            <VUText
              fontSize={16}
              fontFamily={AppStyles.fontName.robotoBold}
              color={AppStyles.color.textBlue}>
              Edit Profile
            </VUText>
          </VUTouchableOpacity>
        </VUView> */}

        {/* <VUView p={2} mt={10} alignItems="center" justifyContent="center">
        
          <VUTouchableOpacity
            onPress={handleContactUs}
            alignItems="center"
            justifyContent="center"
            width="85%"
            height={45}
            borderColor={AppStyles.color.textBlue}
            borderWidth={1}
            borderRadius={24}>
            <VUText
              fontSize={16}
              fontFamily={AppStyles.fontName.robotoBold}
              color={AppStyles.color.textBlue}>
              Contact Us
            </VUText>
          </VUTouchableOpacity>
        </VUView>
        <VUView p={2} mt={10} alignItems="center" justifyContent="center">
          <VUTouchableOpacity
            onPress={handleBlockUserList}
            alignItems="center"
            justifyContent="center"
            width="85%"
            height={45}
            borderColor={AppStyles.color.textBlue}
            borderWidth={1}
            borderRadius={24}>
            <VUText
              fontSize={16}
              fontFamily={AppStyles.fontName.robotoBold}
              color={AppStyles.color.textBlue}>
              Blocked Users
            </VUText>
          </VUTouchableOpacity>
        </VUView> */}
        {/* <VUView flex={1} justifyContent="flex-end"> */}
        {/* <VUView p={2} alignItems="center" justifyContent="center">
            <VUTouchableOpacity
              onPress={handleLogout}
              alignItems="center"
              justifyContent="center"
              width="85%"
              height={45}
              borderColor={AppStyles.color.blueBtnColor}
              borderWidth={1}
              borderRadius={24}>
              <VUText
                fontSize={16}
                fontFamily={AppStyles.fontName.robotoBold}
                color={AppStyles.color.blueBtnColor}>
                Logout
              </VUText>
            </VUTouchableOpacity>
          </VUView> */}

        {/* </VUView> */}
      </VUView>
    </SafeAreaView>
  );
};

export default Settings;
