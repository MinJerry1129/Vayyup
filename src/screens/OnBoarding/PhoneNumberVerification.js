import React, {useState, useEffect} from 'react';
import {AppStyles, globalStyles} from 'src/AppStyles';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-simple-toast';
import {randomString} from 'src/services/numFormatter';
import {
  VUView,
  VUText,
  View,
  VUTextInput,
  VUTouchableOpacity,
  ActivityIndicator,
} from 'common-components';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import AsyncStorage from '@react-native-async-storage/async-storage';

let resendOtpTimerInterval;
const OTP_TIME_LIMIT = 120;
const PhoneNumberVerification = ({navigation}) => {
  const [phone, setPhone] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [code, setCode] = useState('');
  const [confirmResult, setConfirmResult] = useState(null);
  const [countrycode, setCountrycode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [ButtonDisableTime, setButtonDisableTime] = useState(OTP_TIME_LIMIT);
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  useEffect(() => {}, []);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const validatePhoneNumber = () => {
    var regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(countrycode + phone);
  };

  const handleSendOTP = async () => {
    setLoading(true);
    if (validatePhoneNumber()) {
      // const confirmation = await auth().verifyPhoneNumber(countrycode + phone);
      // setConfirmResult(confirmation);
      // setShowOtp(true);
      // setLoading(false);

      firebase
        .auth()
        .signInWithPhoneNumber(countrycode + phone)
        .then(function (confirmationResult) {
          setConfirmResult(confirmationResult);
          setShowOtp(true);
          setLoading(false);
        })
        .catch(function (error) {
          Toast.show(`Error , ${error}`, Toast.LONG);
        });
    } else {
      setLoading(false);
      alert('Invalid mobile number');
    }

    // setLoading(true);

    // if (validatePhoneNumber()) {
    //   firebase
    //     .auth()
    //     .signInWithPhoneNumber(countrycode + phone)
    //     .then(function(confirmationResult) {
    //       setConfirmResult(confirmationResult);
    //       setShowOtp(true);
    //       setLoading(false);
    //     })
    //     .catch(function(error) {

    //     });
    // } else {
    //   setLoading(false);
    //   alert('Invalid mobile number');
    // }
  };

  const handleVerifyOTP = () => {
    Toast.show('loading...', Toast.LONG);
    setLoading(true);
    if (code.length == 6) {
      var credential = firebase.auth.PhoneAuthProvider.credential(
        confirmResult.verificationId,
        code,
      );
      auth()
        .signInWithCredential(credential)
        .then(onSignupSuccess)
        .catch(onSignupFailed);
    } else {
      alert('Please enter a 6 digit OTP code.');
    }
    setLoading(false);
  };

  const onSignupSuccess = async ({user}) => {
    AsyncStorage.setItem('@loggedInUserID:id', user.uid);
    const fcmToken = await AsyncStorage.getItem('fcmToken');
    const {displayName = '', email = '', photoURL = '', uid} = user;

    const snapshot = await firestore().collection('users').doc(user.uid).get();
    if (!snapshot.exists) {
      var userDict = {
        id: uid,
        fullname: displayName == null ? '' : displayName,
        email: email == null ? '' : email,
        profile: photoURL == null ? '' : photoURL,
        username: randomString(
          8,
          '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        ),
        following: 0,
        followers: 0,
        videos: 0,
        fcmToken: fcmToken,
        phone: phone,
        isVerified: false,
      };
      await firestore().collection('users').doc(user.uid).set(userDict);
    }
  };

  const onSignupFailed = (error) => {
    Toast.show('Invalid Token', Toast.LONG);
  };

  const startResendOtp = () => {
    if (resendOtpTimerInterval) {
      clearInterval(resendOtpTimerInterval);
    }
    resendOtpTimerInterval = setInterval(() => {
      if (ButtonDisableTime <= 0) {
        clearInterval(resendOtpTimerInterval);
      } else {
        setButtonDisableTime(ButtonDisableTime - 1);
      }
    }, 1000);
  };

  useEffect(() => {
    startResendOtp();
    return () => {
      if (resendOtpTimerInterval) {
        clearTimeout(resendOtpTimerInterval);
      }
    };
  }, [ButtonDisableTime]);

  return (
    <VUView flex={1} justifyContent="center" bg={AppStyles.color.bgWhite}>
      {showOtp ? (
        <VUView
          alignItems="center"
          justifyContent="center"
          bg={AppStyles.color.bgWhite}>
          <VUText p={3} fontSize={16} color={AppStyles.color.black}>
            Enter OTP
          </VUText>
          <OTPInputView
            style={globalStyles.otpInputView}
            pinCount={6}
            selectionColor={AppStyles.color.textBlue}
            // code={this.state.code} //You can supply this prop or not. The component will be used as a controlled / uncontrolled component respectively.
            // onCodeChanged = {code => { this.setState({code})}}
            autoFocusOnLoad
            codeInputFieldStyle={{
              width: 30,
              height: 45,
              borderWidth: 0,
              borderBottomWidth: 1,
              color: AppStyles.color.textBlue,
            }}
            codeInputHighlightStyle={{
              borderColor: AppStyles.color.blueBtnColor,
            }}
            onCodeChanged={(code) => {
              setCode(code);
            }}
          />
          <VUView>
            {ButtonDisableTime > 0 ? (
              <VUText textAlign="center" color="#000">
                Resend OTP in {ButtonDisableTime}s{' '}
              </VUText>
            ) : (
              <VUTouchableOpacity onPress={handleSendOTP}>
                <VUText
                  textAlign="center"
                  color="#000"
                  textDecorationLine="underline">
                  Click here to Re-send OTP
                </VUText>
              </VUTouchableOpacity>
            )}
          </VUView>
          <VUView
            width="100%"
            alignItems="center"
            justifyContent="center"
            marginTop="20%">
            {loading ? (
              <ActivityIndicator animating={loading} />
            ) : (
              <VUTouchableOpacity
                onPress={handleVerifyOTP}
                bg={AppStyles.color.blueBtnColor}
                width="70%"
                disabled={code.length == 6 ? false : true}
                opacity={code.length == 6 ? 1 : 0.5}
                p={2}
                borderRadius={24}>
                <VUText textAlign="center" color="#fff">
                  Submit
                </VUText>
              </VUTouchableOpacity>
            )}
          </VUView>
        </VUView>
      ) : (
        <VUView
          alignItems="center"
          justifyContent="center"
          bg={AppStyles.color.bgWhite}>
          <VUText p={3} fontSize={16} color={AppStyles.color.textBlue}>
            Enter your mobile number
          </VUText>
          <View
            marginTop={14}
            p={3}
            backgroundColor={AppStyles.color.bgWhite}
            width={AppStyles.textInputWidth.main}
            flexDirection="row">
            <VUTextInput
              borderColor={AppStyles.color.textBlue}
              borderWidth={1}
              width="20%"
              py={2}
              px={3}
              p={2}
              color={AppStyles.color.textBlue}
              name="phone"
              placeholder=""
              placeholderTextColor={AppStyles.color.textBlue}
              onChangeText={(val) => setCountrycode(val)}
              value={countrycode}
              keyboardType="phone-pad"
              maxLength={4}
              letterSpacing={1}
            />
            <VUTextInput
              borderColor={AppStyles.color.textBlue}
              borderWidth={1}
              width="80%"
              py={2}
              px={3}
              p={2}
              color={AppStyles.color.textBlue}
              name="phone"
              placeholder="Phone"
              placeholderTextColor={AppStyles.color.textBlue}
              onChangeText={(val) => setPhone(val)}
              value={phone}
              keyboardType="phone-pad"
              maxLength={10}
              letterSpacing={1}
            />
          </View>
          <VUView
            width="100%"
            alignItems="center"
            justifyContent="center"
            marginTop="20%">
            {loading ? (
              <ActivityIndicator animating={loading} />
            ) : (
              <VUTouchableOpacity
                onPress={handleSendOTP}
                bg={AppStyles.color.blueBtnColor}
                width="70%"
                p={2}
                borderRadius={24}>
                <VUText textAlign="center" color="#fff">
                  Send OTP
                </VUText>
              </VUTouchableOpacity>
            )}
          </VUView>
        </VUView>
      )}
    </VUView>
  );
};

export default PhoneNumberVerification;
