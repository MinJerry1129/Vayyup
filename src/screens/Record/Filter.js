import React from 'react';
import {StyleSheet, View, Slider, Text} from 'react-native';
import {AppStyles} from 'src/AppStyles';

export default ({name, minimum, maximum, onChange}) => (
  <View style={styles.container}>
    <Text style={styles.text}>{name}</Text>
    <Slider
      style={styles.slider}
      minimumValue={minimum}
      maximumValue={maximum}
      onValueChange={onChange}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 300,
    paddingLeft: 20,
  },
  text: {textAlign: 'center', color: AppStyles.color.btnColor, fontSize: 15},
  slider: {width: 150},
});
