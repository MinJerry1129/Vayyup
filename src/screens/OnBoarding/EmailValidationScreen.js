import React, {useState, useEffect} from 'react';
import Button from 'react-native-button';
import {AppStyles} from 'src/AppStyles';
import {ActivityIndicator} from 'react-native';
import firebase from '@react-native-firebase/app';
import {useStorage} from 'src/services/storage';
import {VUView, VUText} from 'common-components';

const EmailValidationScreen = ({navigation}) => {
  const [verified, setVerified] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useStorage(
    'email-verification-sent',
  );

  useEffect(() => {
    if (emailVerificationSent !== 'sent' && emailVerificationSent !== null) {
      firebase.auth().currentUser.sendEmailVerification();
      setEmailVerificationSent('sent');
    }
    const interval = setInterval(() => {
      firebase.auth().currentUser.reload();
    }, 3000);

    const unsubscribeOnUserChanged = firebase
      .auth()
      .onUserChanged(({emailVerified = false}) => {
        if (emailVerified) {
          clearInterval(interval);
          setVerified(true);
          unsubscribeOnUserChanged();
        }
      });
    return unsubscribeOnUserChanged;
  }, []);

  const handleGotoDashboard = () => {
    const {uid} = firebase.auth().currentUser;

    navigation.navigate('Onboarding', {uid});
  };

    return (
        <VUView flex={1} alignItems="center" justifyContent="center" bg={AppStyles.color.bgWhite}>
            {verified && <>
                <VUText fontSize={20} color={AppStyles.color.textBlue}>Your email successfully verified.</VUText>
                <Button onPress={handleGotoDashboard}>Goto Dashboard</Button>
            </>}
            {!verified && <>
                <ActivityIndicator size='large' animating={true} color="#fff" />
                <VUText fontSize={20} color={AppStyles.color.textBlue}>Verify Your Email</VUText>
                <VUText px={3} fontSize={16} color={AppStyles.color.textBlue}>Please Check Your email and verify your email address.</VUText>
            </>}
        </VUView>
    );
}

export default EmailValidationScreen;
