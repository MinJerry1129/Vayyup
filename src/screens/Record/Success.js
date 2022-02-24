import React, { useState, useEffect } from 'react';
import { ScrollView, Image } from 'react-native';
import firebase from '@react-native-firebase/app';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  VUView,
  VUText,
  VUTouchableOpacity,
  SafeAreaView,
} from 'common-components';
import { AppStyles, globalStyles } from 'src/AppStyles';
import { setSuccessVideo } from 'src/redux/reducers/video.actions';

import { RESET_ACTION } from 'redux/reducers/action.types';

var randomImages;
var randomIndex;

const Success = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [load, setLoad] = useState(true);
  const successImage = useSelector(
    (state) => state.videos.sucessVideo,
  );
 
  useEffect(async () => {
    // await Image.prefetch(successImage);
    const snapshot = await firebase
      .firestore()
      .collection('successimage')
      .get();


    var length = snapshot.docs.length;
    randomIndex = Math.min(Math.floor(Math.random() * length), length);
    randomImages = snapshot.docs[randomIndex]._data;
    dispatch(setSuccessVideo(randomImages.image));

    setLoad(false);
  }, []);

  return (
    <SafeAreaView bg={AppStyles.color.bgWhite}>
      <ScrollView>
        <VUView flex={1} p={2}>
          <VUView alignItems="center">
            <VUText
              fontSize={30}
              fontFamily={AppStyles.fontName.robotoBold}
              color={AppStyles.color.grey}>
              Success
            </VUText>
          </VUView>
          <VUView p={2} alignItems="center" justifyContent="center">
            {/* {load ? (
              <VUView width="100%" height={500} justifyContent="center">
                <ActivityIndicator color="#fff" animating={true} />
              </VUView>
            ) : ( */}
            <Image
              style={globalStyles.successImageView}
              resizeMode="contain"
              source={{
                uri: successImage ? successImage.sucessVideo : null,
              }}
            />
            {/* )} */}
          </VUView>
          <VUView flex={1} justifyContent="flex-end">
            <VUView p={2} alignItems="center" justifyContent="center">
              <VUTouchableOpacity
                onPress={() => {
                  navigation.navigate('Profile', { detail: 'success' });
                }}
                alignItems="center"
                justifyContent="center"
                width="55%"
                height={45}
                borderColor={AppStyles.color.blueBtnColor}
                borderWidth={1}
                borderRadius={6}
                mb={16}>
                <VUText
                  fontSize={16}
                  fontFamily={AppStyles.fontName.robotoBold}
                  color={AppStyles.color.blueBtnColor}>
                  Go to profile
                </VUText>
              </VUTouchableOpacity>
              <VUTouchableOpacity
                onPress={() => {
                  navigation.popToTop();
                }}
                alignItems="center"
                justifyContent="center"
                width="55%"
                height={45}
                borderColor={AppStyles.color.blueBtnColor}
                borderWidth={1}
                borderRadius={6}>
                <VUText
                  fontSize={16}
                  fontFamily={AppStyles.fontName.robotoBold}
                  color={AppStyles.color.blueBtnColor}>
                  Done
                </VUText>
              </VUTouchableOpacity>
            </VUView>
          </VUView>
        </VUView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Success;
