import React, {useEffect} from 'react';
import {AppStyles,globalStyles} from '../../AppStyles';
import {useNavigation} from '@react-navigation/core';
import {useDispatch} from 'react-redux';
import {StackActions} from '@react-navigation/native';
import {Dimensions, StyleSheet} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {FontAwesomeIcon} from 'src/icons';
import {setShowPromo} from 'src/redux/reducers/actions';

import {VUView, VUImage} from 'common-components';
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: AppStyles.color.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotStyle: {backgroundColor: AppStyles.color.white},
  activeDotStyle: {backgroundColor: AppStyles.color.primary},
});
const list = [
  {
    id: '1',
    image: require('src/../assets/onboarding/screen1.jpg'),
  },
  {
    id: '2',
    image: require('src/../assets/onboarding/screen2.jpg'),
  },
];

const Onboarding = props => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleDone = async () => {
    dispatch(setShowPromo(true));
    AsyncStorage.setItem('first-time', 'already-logged');
    navigation.dispatch({...StackActions.replace('PromoVideo')});
  };

  const renderItem = ({item}) => {
    return (
      <VUView
        key={item.id}
        flex={1}
        alignItems="center"
        justifyContent="center">
        <VUImage
          source={item.image}
          resizeMode="cover"
          height={height}
          width={width}
        />
      </VUView>
    );
  };

  const renderNextButton = () => {
    return (
      <VUView style={globalStyles.buttonCircle}>
        <FontAwesomeIcon
          centered
          name="arrow-right"
          color={AppStyles.color.white}
        />
      </VUView>
    );
  };

  const renderDoneButton = () => {
    return (
      <VUView style={globalStyles.buttonCircle}>
        <FontAwesomeIcon name="check" color={AppStyles.color.white} />
      </VUView>
    );
  };

  return (
    <AppIntroSlider
      renderItem={renderItem}
      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      data={list}
      onDone={handleDone}
      dotStyle={globalStyles.dotStyle}
      activeDotStyle={globalStyles.activeDotStyle}
    />
  );
};

export default Onboarding;