import React from 'react';
import {Text, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';

import {
  PageHeader,
  View,
  VerticalView,
  Container,
  SafeAreaView,
  PrimaryOutlinedButton,
} from 'common-components';

const VideoSubmitted = (props) => {
  const {id} = props.route.params;
  const navigation = useNavigation();

  const handleBackToCompetition = () => {
    navigation.dispatch(StackActions.popToTop(1));
  };

  const Recording = () => {
    return (
      <Container>
        <VerticalView flex={1} justify="space-between">
          <View style={styles.container}>
            <PageHeader>{id ? 'Good Luck !' : 'Success'}</PageHeader>
            <Text>Your video successfully submitted.</Text>
            <Text>It will take while to appear in your video feed.</Text>
          </View>
          <View style={{flex: 1}}>
            <Image
              style={[styles.image, {flex: 1}]}
              source={require('src/../assets/sundar-c.jpg')}
              resizeMode="contain"
            />
          </View>
          <PrimaryOutlinedButton onPress={handleBackToCompetition}>
            {id ? 'Goto Competitions' : 'Back'}
          </PrimaryOutlinedButton>
        </VerticalView>
      </Container>
    );
  };

  return (
    <SafeAreaView>
      <Recording />
    </SafeAreaView>
  );
};

export default VideoSubmitted;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 50,
  },
  title: {
    color: '#E8505B',
    fontSize: 30,
    fontWeight: 'bold',
  },
  image: {
    width: 'auto',
    height: 300,
    resizeMode: 'contain',
    margin: 20,
  },
  buttonWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#fff',
    borderColor: '#E33838',
    borderStyle: 'solid',
    borderWidth: 3,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#E33838',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
