import React, {useState, useRef,useEffect} from 'react';
import {View} from 'react-native';
import dynamicStyles from './styles';
import VUTabItem from './VUTabItem';
import ActionSheet from 'react-native-actions-sheet';
import {VUView, VUText, VUTouchableOpacity} from '../../common-components';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import {useSelector} from 'react-redux';

const photoModalTab = {
  name: 'Photo',
  key: 'Photo-6UB4BaeaA8m662ywhstar',
};

export default function BottomTabs(props) {
  const {state, navigation, tabBarIcon, colorTitle} = props;
  const styles = dynamicStyles();

  const [isTransparentTab, setIsTransparentTab] = useState(true);
  const actionSheetRef = useRef();
  const [currentUser, following] = useSelector(state => [
    state.auth.user,
    state.social.following,
  ]);
  const [statusmsg, setStatusMsg] = useState(false);
    useEffect(() => {
    const loadData = async () => {
      await firestore()
      .collection('chats')
      .doc(currentUser.id)
      .collection("userlist")
      .where('status','==','no')
      .onSnapshot(snapshot =>{
        if(snapshot){          
          const users = [];
          snapshot.forEach(obj => 
            {
              if(!obj._data.archive || obj._data.archive == "no"){
                users.push({...obj.data(), itemid: obj.id})
              }            
            });
          if (users.length > 0){
            setStatusMsg(true)
          }else{
            setStatusMsg(false)
          }
        }else{
          setStatusMsg(false);
        }
      });
    };
    loadData();
  }, [currentUser]);

  const customRoutes = [...state.routes];
  const indexToInsert = Math.floor(customRoutes.length / 2);
  customRoutes.splice(indexToInsert, 0, photoModalTab);

  const onAddPress = () => {
    actionSheetRef.current?.setModalVisible();
  };
  const redirectRecordScreen = () => {
    navigation.navigate('Record');
    actionSheetRef.current?.setModalVisible();
  };
  const handleCamera = async () => {
    actionSheetRef.current?.setModalVisible();
    navigation.navigate('AddCaptions', {
      isGalleryImage: false,
    });
  };

  const handleGallery = async () => {
    actionSheetRef.current?.setModalVisible();
    navigation.navigate('AddCaptions', {
      isGalleryImage: true,
    });
  };

  const onTabItemPress = routeName => {
    // if (
    //   routeName?.toLowerCase() === 'home' ||
    //   routeName?.toLowerCase() === 'myvideos'
    // ) {
    //   setIsTransparentTab(true);
    // } else {
    //   setIsTransparentTab(false);
    // }
    setIsTransparentTab(true);
    navigation.navigate(routeName);
  };

  const getIsFocus = (stateIndex, currentTabIndex) => {
    if (stateIndex >= indexToInsert) {
      const adjustedStateIndex = stateIndex + 1;
      return adjustedStateIndex === currentTabIndex;
    }
    return state.index === currentTabIndex;
  };

  const renderTabItem = (route, index) => {
    return (
      <VUTabItem
        key={index + ''}
        tabIcons={tabBarIcon}
        focus={getIsFocus(state.index, index)}
        routeName={route.name}
        onPress={onTabItemPress}
        isAddPhoto={route.name?.toLowerCase() === 'photo'}
        colorTitle={colorTitle}
        isTransparentTab={isTransparentTab}
        msgstatus={statusmsg}
        onAddPress={onAddPress}
      />
    );
  };

  return (
    <View>
      <ActionSheet ref={actionSheetRef}>
        <VUView mt={4} mb={4}>
          <VUView width="100%">
            <VUTouchableOpacity onPress={redirectRecordScreen} my={2} mx={4}>
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
                Upload photos
              </VUText>
            </VUTouchableOpacity>
          </VUView>
        </VUView>
      </ActionSheet>
      <View
        style={[
          styles.tabContainer,
          isTransparentTab
            ? {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }
            : {backgroundColor: '#f5f5f5'},
        ]}>
        {customRoutes.map(renderTabItem)}
      </View>
    </View>
  );
}
