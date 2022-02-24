import React, {useEffect} from 'react';
import {AppStyles} from 'src/AppStyles';
import {VUView, VayyUpLogo} from 'common-components';
import { Image } from 'react-native';

const Splash = ({navigation, route}) => {
  const {onloading} = route.params;
  useEffect(() => {
    if (onloading.onloading === 'firstTime') {
      navigation.navigate('Onboarding');
    } else {
      navigation.navigate('PromoVideo');
    }
  }, [onloading]);
  return (
    <VUView
      bg={AppStyles.color.bgWhite}
      flex={1}
      justifyContent="center"
      alignItems="center">
        <Image 
          source={require('../../../assets/logo-5.png')}
          style={{
            width : 120,
            height : 120
          }}
          resizeMode={'contain'}
        />
      {/* <VayyUpLogo size={200} /> */}
    </VUView>
  );
};

export default Splash;
