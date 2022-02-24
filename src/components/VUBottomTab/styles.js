import {StyleSheet} from 'react-native';
import {ifIphoneX} from 'react-native-iphone-x-helper';

const dynamicStyles = () => {
  return StyleSheet.create({
    tabContainer: {
      position: 'absolute',
      bottom: 0,
      ...ifIphoneX(
        {
          height: 80,
        },
        {
          height: 50,
        },
      ),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // borderTopWidth: 1,
      // borderTopColor: '#CCC',
    },
    buttonContainer: {
      width: '20%',
      height: 130,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 10,
      paddingTop: 2,
    },
    addContainer: {
      width: 45,
      height: 35,
     // padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: '#fff',
      position: 'absolute',
      // bottom: 40,
      borderColor: '#4910BC',
      borderWidth: 2.5,
    },
    icon: {
      height: 28,
      width: 28,
    },
    addIcon: {
      height: 15,
      width: 15,
      tintColor: '#010101',
    },
    focusTintColor: {
      tintColor: '#010101',
    },
    unFocusTintColor: {},
  });
};

export default dynamicStyles;
