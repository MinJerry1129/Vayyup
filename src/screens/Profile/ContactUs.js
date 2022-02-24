import React, {useState, useEffect} from 'react';
import {ScrollView, Platform} from 'react-native';
import Toast from 'react-native-simple-toast';
import {useSelector} from 'react-redux';

import {useNavigation} from '@react-navigation/native';

import {AppStyles, globalStyles} from 'src/AppStyles';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import * as yup from 'yup';
import 'yup-phone';
import {IonIcon} from 'src/icons';

import {
  VUTextInput,
  KeyboardAvoidingView,
  SafeAreaView,
  VUView,
  VUText,
  VUTouchableOpacity,
} from 'common-components';
import DropDownPicker from 'react-native-dropdown-picker';
import Header from '../../common-components/Header';

const ContactUs = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [message, setMessage] = useState('');
  const [items, setItems] = useState([
    {label: 'Report Bug', value: 'Report Bug'},
    {label: 'Feedback', value: 'Feedback'},
    {label: 'Suggest feature', value: 'Suggest feature'},
  ]);

  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  useEffect(() => {
    setValue('Report Bug');
  }, []);
  const handleBackPressed = () => {
    navigation.navigate('Settings');
  };
  const handleSubmittedIssue = () => {
    if (message.trim().length <= 0) {
      alert('Please fill out the required fields.');
      return;
    }
    firestore().collection('appreports').add({
      email: user.email,
      issue: value,
      message: message,
      date: firebase.firestore.FieldValue.serverTimestamp(),
    });
    Toast.show(
      'Thanks for your feedback. We will get back to you soon',
      Toast.LONG,
    );
    clearData();
  };
  const clearData = () => {
    setValue('Report Bug');
    setMessage('');
  };
  return (
    <SafeAreaView flex={1} bg={AppStyles.color.bgWhite} pb={3}>
      <ScrollView flex={1}>
        <KeyboardAvoidingView>
          {/* <VUView alignItems="flex-start">
            <VUTouchableOpacity onPress={handleBackPressed}>
              <IonIcon
                name="chevron-back"
                size={36}
                color={AppStyles.color.textBlue}
              />
            </VUTouchableOpacity>
          </VUView>
          <VUView alignItems="center" pb={10}>
            <VUText
              fontSize={18}
              fontFamily={AppStyles.fontName.robotoBold}
              color={AppStyles.color.textBlue}>
              Contact Us
            </VUText>
          </VUView> */}
           <Header 
          headerTitle={'Contact Us'}
          onLeftPress={handleBackPressed}
        />
          <VUView flex={1} mb={10} px={3} pt={3}>
            <VUTextInput
              borderBottomColor={AppStyles.color.textBlue}
              borderBottomWidth={1}
              py={2}
              px={3}
              p={1}
              color={AppStyles.color.textBlue}
              editable={false}
              name="email"
              value={user.email}
            />
            {Platform.OS == 'ios' ? (
              <VUView mt={30} zIndex={5}>
                <DropDownPicker
                  open={open}
                  value={value}
                  items={items}
                  setOpen={setOpen}
                  setValue={setValue}
                  setItems={setItems}
                  textStyle={{
                    fontFamily: AppStyles.fontName.robotoRegular,
                  }}
                />
              </VUView>
            ) : (
              <VUView mt={30}>
                <DropDownPicker
                  open={open}
                  value={value}
                  items={items}
                  setOpen={setOpen}
                  setValue={setValue}
                  setItems={setItems}
                  textStyle={{
                    fontFamily: AppStyles.fontName.robotoRegular,
                  }}
                />
              </VUView>
            )}

            <VUView mt={30}>
              <VUTextInput
                borderBottomColor={AppStyles.color.textBlue}
                borderBottomWidth={1}
                py={2}
                px={3}
                p={1}
                color={AppStyles.color.textBlue}
                name="Message"
                placeholderTextColor={AppStyles.color.textBlue}
                multiline={true}
                placeholder="Write a Message"
                onChangeText={setMessage}
                value={message}
              />
            </VUView>
            <VUView mt={50}>
              <VUTouchableOpacity
                alignItems="center"
                justifyContent="center"
                width="100%"
                height={45}
                borderColor={AppStyles.color.blueBtnColor}
                borderWidth={1}
                onPress={handleSubmittedIssue}
                borderRadius={24}>
                <VUText
                  fontSize={16}
                  fontFamily={AppStyles.fontName.robotoBold}
                  color={AppStyles.color.blueBtnColor}>
                  Submit
                </VUText>
              </VUTouchableOpacity>
            </VUView>
          </VUView>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactUs;
