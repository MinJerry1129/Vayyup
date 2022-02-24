import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import dynamicStyles from './styles';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {EntypoIcon} from 'src/icons';
import User from 'common-components/icons/User';
import {VUText} from 'common-components';
import {IonIcon} from 'src/icons';
import { VUView,VUImage} from '../../common-components';

const color = {
  normal: '#C4C4C4',
  focused: '#4910BC',
};

const routes = {
  Home: {
    icon: <FontAwesome name="home" size={20} color={color.normal} />,
    focusIcon: <FontAwesome name="home" size={20} color={color.focused} />,
    label: 'Home',
  },
  Search: {
    icon: <IonIcon name="search" size={20} color={color.normal} />,
    focusIcon: <IonIcon name="search" color={color.focused} />,
    label: 'Search',
  },
  Chat: {
    icon: <FontAwesome name="wechat" size={20} color={color.normal} />,
    highlightIcon: <VUImage height={25} resizeMode="contain" source={require('../../../assets/chat.png')}/>,
    focusIcon: <FontAwesome name="wechat" size={20} color={color.focused} />,
    label: 'Chat',
  },
  Profile: {
    icon: <User size={20} color={color.normal} />,
    focusIcon: <User size={20} color={color.focused} />,
    label: 'Profile',
  },
  Photo: {
    // icon: <EntypoIcon size={28} name="plus" color={'#4910BC'} />,
    icon: <EntypoIcon size={28} name="plus" color={'#4910BC'} />,
    label: 'Photo',
  },
};

function VUTabItem({
  onPress,
  focus,
  routeName,
  isAddPhoto,
  isTransparentTab,
  onAddPress,
  msgstatus
}) {
  const styles = dynamicStyles();
  const {icon,highlightIcon, focusIcon, label} = routes[routeName] || {};
  const onTabPress = () => {
    onPress(routeName);
  };

  if (isAddPhoto) {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={onAddPress} style={[styles.addContainer]}>
          {icon}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={onTabPress}>      
      {focus ? focusIcon : 
        <VUView>
          {label=="Chat" && msgstatus ? highlightIcon :icon}
        </VUView>
      }
      <VUText fontSize={10} color={focus ? '#fff' : color.normal}>
        {label}
      </VUText>
    </TouchableOpacity>
  );
}

export default VUTabItem;
