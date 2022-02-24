import React from 'react';
import {View, StyleSheet} from 'react-native';
import {VUImage} from '../../common-components';

const Filter = ({uploadedImage}) => {
  return (
    <VUImage
      width="100%"
      height={500}
      resizeMode="contain"
      source={{
        uri: uploadedImage,
      }}
    />
  );
};

export default Filter;
