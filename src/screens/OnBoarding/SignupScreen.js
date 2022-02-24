import React from 'react';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Keyboard,
  Linking,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import {AppStyles, globalStyles} from 'src/AppStyles';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import {Formik} from 'formik';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import * as yup from 'yup';
import 'yup-phone';

import {
  VUText,
  Wrapper,
  VUTextInput,
  PrimaryButton,
  View,
  ErrorText,
  VUView,
} from 'common-components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TermsURL = 'https://vrdfilmfactory.com/terms-and-conditions';

class SignupScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    this.authSubscription = auth().onAuthStateChanged(user => {
      this.setState({
        loading: false,
        user,
      });
    });
  }

  componentWillUnmount() {
    this.authSubscription();
  }

  onRegister = async (values, {setErrors}) => {
    const {email, password, fullname, phone} = values;
    this.setState({loading: true});
    try {
      const response = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      const user_uid = response.user._user.uid;
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      var data = {
        email: email.trim(),
        fullname,
        phone,
        following: 0,
        followers: 0,
        fcmToken: fcmToken,
      };
      await firestore()
        .collection('users')
        .doc(user_uid)
        .set({
          email: email.trim(),
          fullname,
          phone,
          following: 0,
          followers: 0,
          fcmToken: fcmToken,
        });
      this.setState({loading: false});
    } catch (error) {
      const {message, code} = error;
      if (code === 'auth/email-already-in-use') {
        setErrors({email: 'Email already registered.'});
        this.setState({loading: false});
      } else {
        this.setState({loading: false}, () => {
          Alert.alert(message);
        });
      }
    }
  };

  handleBack = () => {
    const {navigation} = this.props;
    navigation.goBack();
  };

  render() {
    const initialValues = {
      fullname: '',
      phone: '',
      email: '',
      password: '',
      acceptTerms: false,
    };
    const SignupValidationSchema = yup.object().shape({
      fullname: yup.string().required('Name is required'),
      email: yup
        .string()
        .email('Please enter valid email')
        .required('Email Address is Required'),
      password: yup
        .string()
        .min(8, ({min}) => `Password must be at least ${min} characters`)
        .required('Password is required'),
      phone: yup
        .string()
        .phone()
        .required(),
      acceptTerms: yup
        .boolean()
        .required()
        .oneOf([true], 'Accept the terms and conditions'),
    });

    return (
      <KeyboardAwareScrollView style={{ backgroundColor: AppStyles.color.bgWhite }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <VUView bg={AppStyles.color.bgWhite} flex={1}>
            <VUView alignItems="center">
              <Wrapper >
                <VUText fontSize={18} letterSpacing={0.5} marginTop={40} fontFamily={AppStyles.fontName.robotoBold}
                  color={AppStyles.color.textBlue} >
                  Create new account
                </VUText>
              </Wrapper>

              <Formik
                validationSchema={SignupValidationSchema}
                initialValues={initialValues}
                onSubmit={this.onRegister}>
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isValid,
                  setFieldValue,
                }) => (
                    <>
                      <View marginTop={80} backgroundColor={AppStyles.color.bgWhite} width={AppStyles.textInputWidth.main}>
                        <VUTextInput
                          borderBottomColor={AppStyles.color.textBlue}
                          borderBottomWidth={1}
                          py={2}
                          px={3}
                          p={1}
                          color={AppStyles.color.textBlue}
                          name="fullname"
                          placeholder="Name"
                          placeholderTextColor={AppStyles.color.textBlue}
                          onChangeText={handleChange('fullname')}
                          onBlur={handleBlur('fullname')}
                          value={values.name}
                        />
                        {errors.fullname && touched.fullname && (
                          <ErrorText>{errors.fullname}</ErrorText>
                        )}
                      </View>
                      <View marginTop={14} backgroundColor={AppStyles.color.bgWhite} width={AppStyles.textInputWidth.main}>
                        <VUTextInput
                          borderBottomColor={AppStyles.color.textBlue}
                          borderBottomWidth={1}
                          py={2}
                          px={3}
                          p={1}
                          color={AppStyles.color.textBlue}
                          name="phone"
                          placeholder="Phone"
                          placeholderTextColor={AppStyles.color.textBlue}
                          onChangeText={handleChange('phone')}
                          onBlur={handleBlur('phone')}
                          value={values.phone}
                        />
                        {errors.phone && touched.phone && (
                          <ErrorText>{errors.phone}</ErrorText>
                        )}
                      </View>
                      <View marginTop={14} backgroundColor={AppStyles.color.bgWhite} width={AppStyles.textInputWidth.main}>
                        <VUTextInput
                          borderBottomColor={AppStyles.color.textBlue}
                          borderBottomWidth={1}
                          py={2}
                          px={3}
                          p={1}
                          color={AppStyles.color.textBlue}
                          name="email"
                          placeholder="E-Mail"
                          placeholderTextColor={AppStyles.color.textBlue}
                          onChangeText={handleChange('email')}
                          onBlur={handleBlur('email')}
                          value={values.email}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCompleteType="off"
                          autoCorrect={false}
                        />
                        {errors.email && touched.email && (
                          <ErrorText>{errors.email}</ErrorText>
                        )}
                      </View>
                      <View marginTop={14} backgroundColor={AppStyles.color.bgWhite} width={AppStyles.textInputWidth.main}>
                        <VUTextInput
                          borderBottomColor={AppStyles.color.textBlue}
                          borderBottomWidth={1}
                          py={2}
                          px={3}
                          p={1}
                          color={AppStyles.color.textBlue}
                          name="password"
                          placeholder="Password"
                          placeholderTextColor={AppStyles.color.textBlue}
                          secureTextEntry
                          onChangeText={handleChange('password')}
                          onBlur={handleBlur('password')}
                          value={values.password}
                          autoCapitalize="none"
                          autoCompleteType="off"
                          autoCorrect={false}
                        />
                        {errors.password && touched.password && (
                          <ErrorText>{errors.password}</ErrorText>
                        )}
                      </View>
                      <VUView
                        marginTop={30}
                        flexDirection="row"
                        alignItems="center">
                        <CheckBox
                          boxType="square"
                          value={values.acceptTerms}
                          onValueChange={(nextValue) =>
                            setFieldValue('acceptTerms', nextValue)
                          }
                          tintColors={{ true: AppStyles.color.blueBtnColor, false: AppStyles.color.grayText }}
                          onFillColor={{ true: AppStyles.color.grey }}
                        />
                        <VUText ml={2} color={AppStyles.color.grey}> I Agree to the </VUText>
                        <TouchableOpacity
                          onPress={() => {
                            Linking.openURL(TermsURL);
                          }}>
                          <VUText color={AppStyles.color.textBlue} style={{ textDecorationLine: 'underline' }}>
                            Terms and conditions
                        </VUText>
                        </TouchableOpacity>
                      </VUView>
                      <VUView
                        alignItems="center"
                        width={AppStyles.textInputWidth.main}>
                        {this.state.loading ? (
                          <ActivityIndicator
                            style={{ marginTop: 30 }}
                            size="large"
                            animating={this.state.loading}
                            color={AppStyles.color.tint}
                          />
                        ) : (
                            <>
                              <PrimaryButton
                                width="50%"
                                style={{ fontFamily: AppStyles.fontName.robotoBold, fontSize: 14 }}
                                onPress={handleSubmit}
                                disabled={!isValid}>
                                Create Account
                          </PrimaryButton>
                          {errors.acceptTerms && touched.acceptTerms && (
                            <ErrorText>{errors.acceptTerms}</ErrorText>
                          )}
                        </>
                      )}
                    </VUView>
                  </>
                )}
              </Formik>
              <VUView
                alignItems="center"
                flexDirection="row"
                marginTop={40}
              >
                <VUText fontSize="14" weight="normal" color={AppStyles.color.grayText} fontFamily={AppStyles.fontName.robotoRegular}>
                  Have an account already?
                </VUText>
                <TouchableOpacity onPress={this.handleBack}>
                  <VUText
                    fontSize="14"
                    weight="normal"
                    ml={2}
                    color={AppStyles.color.textBlue}
                    style={{ textDecorationLine: 'underline' }}
                  >
                    Sign in
                  </VUText>
                </TouchableOpacity>
              </VUView>
            </VUView>
          </VUView>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    );
  }
}

export default SignupScreen;