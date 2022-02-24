import * as React from 'react';
import {SearchBar} from 'react-native-elements';
import {Image} from 'react-native';

export const MySearchBar = ({placeholder, onChangeText, value}) => {
  return (
    <SearchBar
      placeholder={placeholder}
      onChangeText={onChangeText}
      value={value}
      lightTheme
      containerStyle={{backgroundColor: 'transparent',borderWidth: 0, borderBottomColor: 'transparent',
      borderTopColor: 'transparent'}}
      inputContainerStyle={{backgroundColor:'#eee',width:'100%',height:40,borderRadius:4,opacity: 0.67}}
      inputStyle={{fontSize:14,fontFamily: 'Roboto-Regular',includeFontPadding:false,color:'#000'}}
      searchIcon={
        <Image
          source={require('../../assets/icons/karoke_search_1.png')}
          style={{width: 24, height: 24, resizeMode: 'contain'}}
        />
      }
    />
  );
};
