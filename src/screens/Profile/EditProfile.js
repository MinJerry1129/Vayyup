import React, {useState, useRef} from 'react';
import {TouchableOpacity, Keyboard, Dimensions} from 'react-native';
import Toast from 'react-native-simple-toast';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {AppStyles} from 'src/AppStyles';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import {Formik} from 'formik';
import * as yup from 'yup';
import 'yup-phone';
import ImagePicker from 'react-native-image-crop-picker';
import {IonIcon} from 'src/icons';
import storage from '@react-native-firebase/storage';
import {login} from 'redux/reducers/actions';
import {AvatarContainer, Avatar} from './styles';

const windowDimensions = Dimensions.get('window');

import {
  VUTextInput,
  ErrorText,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  VUView,
  VUText,
  VUTouchableWithoutFeedback,
  VUScrollView,
  VUTouchableOpacity,
  VUImage,
} from 'common-components';
import {Platform} from 'react-native';
import Header from '../../common-components/Header';

const EditProfile = () => {
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errormsgfullname, seterrormsgFullname] = useState('');
  const user = useSelector((state) => state.auth.user);
  const {dob, certificates = []} = user;
  const [images, setImages] = useState(certificates);
  const [date, setDate] = useState(dob && dob.toDate ? dob.toDate() : dob);

  const actionSheetRef = useRef();
  const phoneRegExp =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

  const EditProfileSchema = yup.object().shape({
    email: yup.string().email('Please enter valid email'),

    phone: yup
      .string()
      .matches(phoneRegExp, 'Phone number is not valid')
      .min(10, 'to short')
      .max(15, 'to long'),
  });

  const initialValues = {
    fullname: user.fullname,
    phone: user.phone == null ? '' : user.phone,
    education: user.education,
    email: user.email == null ? '' : user.email,
    gender: user.gender,
    location: user.location,
    username: user.username,
    bio: user.bio,
  };

  const handleUpdate = async (values) => {
    const {fullname, gender, username, email, phone, location, education, bio} =
      values;
    // if (
    //   education == undefined ||

    //   education == '' ||
    //   fullname == undefined ||
    //   fullname == '' ||
    //   phone == undefined ||
    //   phone == '' ||
    //   gender == undefined ||
    //   gender == '' ||
    //   location == undefined ||
    //   location == '' ||
    //   date == undefined ||
    //   date == '' ||
    //   username == '' ||
    //   username == undefined ||
    //   email == undefined ||
    //   email == ''
    // ) {
    //   Toast.show('Please fill all fields', Toast.SHORT);
    // } else {
    setLoading(true);
    try {
      const {education, fullname, phone, gender, location, email, bio} = values;

      const errors = {};

      const uploadedImages = await Promise.all(
        images
          .filter((image) => !certificates.includes(image))
          .map(async (image) => {
            const filePage = 'users/' + image.split('/').pop();
            const reference = storage().ref(filePage);
            await reference.putFile(image);
            return reference.getDownloadURL();
          }),
      );
      var userDict = {
        fullname: fullname == undefined || fullname == null ? '' : fullname,
        education: education == undefined || education == null ? '' : education,
        phone: phone == undefined || phone == null ? '' : phone,
        dob: date == undefined || date == null ? '' : date,
        gender: gender == undefined || gender == null ? '' : gender,
        location: location == undefined || location == null ? '' : location,
        username: username == undefined || username == null ? '' : username,
        email: email,
        bio: bio == undefined || bio == null ? '' : bio,
        certificates: [...certificates, ...uploadedImages],
      };

      if (
        initialValues.username !== username ||
        initialValues.fullname !== fullname
      ) {
        const usernameData = await firestore()
          .collection('users')
          .where('username', '==', username)
          .get();
        const fullnameData = await firestore()
          .collection('users')
          .where('fullname', '==', username)
          .get();

        if (fullnameData.empty && usernameData.empty) {
          firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .update(userDict)
            .then((res) => {
              console.log('res', res);
            });
          dispatch(login({...user, ...userDict}));
          navigation.goBack();
        } else {
          setShowError(true);
          seterrormsgFullname('username already exist');
          setLoading(false);
        }
      }

      /////////////////////////////////////////////////

      //        else if (username !== '' && initialValues.username !== username) {
      //           const userData = await firestore()
      //             .collection('users')
      //             .where('fullname', '==', fullname)
      //             .get();

      //           if (userData.empty) {
      //             firestore()
      //               .collection('users')
      //               .doc(firebase.auth().currentUser.uid)
      //               .update(userDict)
      //               .then(res => {

      //               });
      //             dispatch(login({...user, ...userDict}));
      //             navigation.goBack();
      //           } else {
      //             setShowError(true);
      //             seterrormsgFullname('username already exist');
      //             setLoading(false);
      //           }
      //       }

      ///////////////////////////////////////////////////////////////
      else if (phone !== '' && initialValues.phone !== phone) {
        const userData = await firestore()
          .collection('users')
          .where('phone', '==', phone)
          .get();

        if (userData.empty) {
          firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .update(userDict)
            .then((res) => {
              console.log('res', res);
            });
          dispatch(login({...user, ...userDict}));
          navigation.goBack();
        } else {
          setShowError(true);
          setErrorMessage('Phone number already exist');
          setLoading(false);
        }
      } else {
        firestore()
          .collection('users')
          .doc(firebase.auth().currentUser.uid)
          .update(userDict)
          .then((res) => {
            console.log('res', res);
          });
        dispatch(login({...user, ...userDict}));
        navigation.goBack();
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleUploadPhoto = () => {
    ImagePicker.openPicker({
      width: 600,
      height: 600,
      compressImageMaxHeight: 600,
      compressImageMaxWidth: 600,
      maxFiles: 1,
      mediaType: 'photo',
      cropping: true,
    }).then(async (response) => {
      const {path: uri} = response;
      setLoading(true);
      try {
        const filePage = 'profiles/' + uri.split('/').pop();
        const reference = storage().ref(filePage);
        await reference.putFile(uri);
        const loggedInUser = firebase.auth().currentUser;
        const url = await reference.getDownloadURL();
        await firestore().collection('users').doc(loggedInUser.uid).update({
          profile: url,
        });
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    });
  };

  const handleDateChanged = (selectedDate) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

  const handleCancelDate = () => {
    setShowDatePicker(false);
  };

  const handleUploadCertificates = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      compressImageMaxHeight: 600,
      compressImageQuality: 0.8,
    }).then((selectedImages) => {
      setImages([...images, ...selectedImages.map((image) => image.path)]);
    });
  };

  const handleShowGenderPicker = async () => {
    actionSheetRef.current?.setModalVisible();
  };

  const handleGenderSelected = () => {
    actionSheetRef.current?.setModalVisible(false);
  };

  const handleBackPressed = () => {
    // navigation.navigate('Settings');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView>
      <SafeAreaView bg={AppStyles.color.bgWhite}>
        {/* <VUView alignItems="flex-start">
          <VUTouchableOpacity onPress={handleBackPressed}>
            <IonIcon
              name="chevron-back"
              size={36}
              color={AppStyles.color.textBlue}
            />
          </VUTouchableOpacity>
        </VUView> */}
        <Header headerTitle={'Edit Profile'} onLeftPress={handleBackPressed} />
        <VUView alignItems="center" pb={14} px={3} pt={3}>
          {/* <VUText
            fontSize={16}
            fontFamily={AppStyles.fontName.robotoBold}
            color={AppStyles.color.textBlue}>
            Edit Profile
          </VUText> */}
          <TouchableOpacity onPress={handleUploadPhoto}>
            {user.profile ? (
              <AvatarContainer>
                <Avatar source={{uri: user.profile}} resizeMode="contain" />
              </AvatarContainer>
            ) : (
              <IonIcon name="person-circle-outline" size={100} color="#bbb" />
            )}
          </TouchableOpacity>
        </VUView>
        <VUView
          flex={1}
          pl={Platform.OS === 'ios' ? 16 : 0}
          pr={Platform.OS === 'ios' ? 16 : 0}
          px={3}>
          <VUTouchableWithoutFeedback flex={1} onPress={Keyboard.dismiss}>
            <Formik
              validationSchema={EditProfileSchema}
              initialValues={initialValues}
              onSubmit={handleUpdate}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                setFieldTouched,
                values,
                errors,
                touched,
                isValid,
              }) => (
                <VUView flex={1} alignItems="center" justifyContent="flex-end">
                  <VUScrollView flex={1} width="100%">
                    <VUView flex={1} mb={18}>
                      <VUTextInput
                        borderBottomColor={AppStyles.color.grayText}
                        borderBottomWidth={1}
                        py={2}
                        px={3}
                        p={1}
                        color={AppStyles.color.textBlue}
                        name="fullname"
                        placeholder="Name"
                        placeholderTextColor={AppStyles.color.textBlue}
                        onChangeText={(value) =>
                          setFieldValue('fullname', value.trimStart())
                        }
                        onBlur={(value) => setFieldTouched('fullname', value)}
                        value={values.fullname}
                      />
                      {errors.fullname && touched.fullname && (
                        <ErrorText>{errors.fullname}</ErrorText>
                      )}
                    </VUView>
                    <VUView
                      flexDirection="row"
                      width="100%"
                      mb={10}
                      justifyContent="space-between">
                      <VUTouchableOpacity
                        width={'30%'}
                        onPress={() => {
                          setFieldValue('gender', 'Male');
                        }}>
                        <VUView
                          flexDirection="row"
                          bg={
                            values.gender == 'Male'
                              ? AppStyles.color.blueBtnColor
                              : AppStyles.color.white
                          }
                          borderWidth={1}
                          borderColor={
                            values.gender == 'Male'
                              ? AppStyles.color.blueBtnColor
                              : AppStyles.color.grayText
                          }
                          py={2}
                          borderRadius={4}
                          alignItems="center">
                          <VUImage
                            width={40}
                            height={40}
                            resizeMode="contain"
                            source={require('src/../assets/male.png')}
                          />
                          <VUText
                            fontSize={12}
                            fontFamily={AppStyles.fontName.robotoBold}
                            color={
                              values.gender == 'Male'
                                ? AppStyles.color.grayText
                                : AppStyles.color.textBlue
                            }>
                            Male
                          </VUText>
                        </VUView>
                      </VUTouchableOpacity>

                      <VUTouchableOpacity
                        width={'30%'}
                        onPress={() => {
                          setFieldValue('gender', 'Female');
                        }}>
                        <VUView
                          flexDirection="row"
                          bg={
                            values.gender == 'Female'
                              ? AppStyles.color.blueBtnColor
                              : AppStyles.color.white
                          }
                          borderWidth={1}
                          borderColor={
                            values.gender == 'Female'
                              ? AppStyles.color.bgColor
                              : AppStyles.color.grayText
                          }
                          py={2}
                          borderRadius={4}
                          alignItems="center">
                          <VUImage
                            width={40}
                            height={40}
                            resizeMode="contain"
                            //style={styles.logo}
                            source={require('src/../assets/female.png')}
                          />
                          <VUText
                            fontSize={12}
                            fontFamily={AppStyles.fontName.robotoBold}
                            color={
                              values.gender == 'Female'
                                ? AppStyles.color.grayText
                                : AppStyles.color.textBlue
                            }>
                            Female
                          </VUText>
                        </VUView>
                      </VUTouchableOpacity>
                      <VUTouchableOpacity
                        width={'30%'}
                        onPress={() => {
                          setFieldValue('gender', 'Others');
                        }}>
                        <VUView
                          flexDirection="row"
                          bg={
                            values.gender == 'Others'
                              ? AppStyles.color.blueBtnColor
                              : AppStyles.color.white
                          }
                          borderWidth={1}
                          borderColor={
                            values.gender == 'Others'
                              ? AppStyles.color.blueBtnColor
                              : AppStyles.color.grayText
                          }
                          py={2}
                          borderRadius={4}
                          alignItems="center">
                          <VUImage
                            width={40}
                            height={40}
                            resizeMode="contain"
                            //style={styles.logo}
                            source={require('src/../assets/female.png')}
                          />
                          <VUText
                            fontSize={12}
                            fontFamily={AppStyles.fontName.robotoBold}
                            color={
                              values.gender == 'Others'
                                ? AppStyles.color.grayText
                                : AppStyles.color.textBlue
                            }>
                            Others
                          </VUText>
                        </VUView>
                      </VUTouchableOpacity>
                    </VUView>
                    <VUView flex={1} mb={18}>
                      <VUTextInput
                        borderBottomColor={AppStyles.color.grayText}
                        borderBottomWidth={1}
                        py={2}
                        px={3}
                        p={1}
                        color={AppStyles.color.textBlue}
                        placeholder="username"
                        name="username"
                        placeholderTextColor={AppStyles.color.textBlue}
                        placeholderTextColor={AppStyles.color.textBlue}
                        onChangeText={(value) =>
                          setFieldValue('username', value.trimStart())
                        }
                        onBlur={(value) => setFieldTouched('username', value)}
                        value={values.username}
                      />
                      {errors.username && touched.username && (
                        <ErrorText>{errors.username}</ErrorText>
                      )}
                      {showError && <ErrorText>{errormsgfullname}</ErrorText>}
                    </VUView>
                    <VUView flex={1} mb={18}>
                      <VUTextInput
                        borderBottomColor={AppStyles.color.grayText}
                        borderBottomWidth={1}
                        py={2}
                        px={3}
                        p={1}
                        color={AppStyles.color.textBlue}
                        name="bio"
                        placeholder="Bio"
                        placeholderTextColor={AppStyles.color.textBlue}
                        onChangeText={(value) =>
                          setFieldValue('bio', value.trimStart())
                        }
                        onBlur={(value) => setFieldTouched('bio', value)}
                        value={values.bio}
                        maxLength={200}
                      />
                      {errors.bio && touched.bio && (
                        <ErrorText>{errors.bio}</ErrorText>
                      )}
                    </VUView>
                    <VUView flex={1} mb={18}>
                      <VUTextInput
                        borderBottomColor={AppStyles.color.grayText}
                        borderBottomWidth={1}
                        py={2}
                        px={3}
                        p={1}
                        color={
                          initialValues.email != undefined &&
                          initialValues.email != ''
                            ? '#999'
                            : AppStyles.color.textBlue
                        }
                        editable={
                          initialValues.email !== undefined &&
                          initialValues.email !== ''
                            ? false
                            : true
                        }
                        name="email"
                        placeholderTextColor={AppStyles.color.textBlue}
                        placeholder="Email"
                        onChangeText={(value) =>
                          setFieldValue('email', value.trim())
                        }
                        onBlur={(value) => setFieldTouched('email', value)}
                        value={values.email}
                        keyboardType="email-address"
                      />
                      {errors.email && touched.email && (
                        <ErrorText>{errors.email}</ErrorText>
                      )}
                    </VUView>

                    <VUView flex={1} mb={18}>
                      <VUTextInput
                        borderBottomColor={AppStyles.color.grayText}
                        borderBottomWidth={1}
                        py={2}
                        px={3}
                        p={1}
                        color={AppStyles.color.textBlue}
                        name="phone"
                        placeholder="Phone Number"
                        placeholderTextColor={AppStyles.color.textBlue}
                        onChangeText={(value) =>
                          setFieldValue('phone', value.trim())
                        }
                        onBlur={(value) => setFieldTouched('phone', value)}
                        value={values.phone}
                        valign="center"
                        editable={true}
                        keyboardType="phone-pad"
                        maxLength={15}
                      />
                      {errors.phone && touched.phone && (
                        <ErrorText>{errors.phone}</ErrorText>
                      )}
                      {showError && <ErrorText>{errorMessage}</ErrorText>}
                    </VUView>

                    <VUView flex={1} mb={18}>
                      <VUTextInput
                        borderBottomColor={AppStyles.color.grayText}
                        borderBottomWidth={1}
                        py={2}
                        px={3}
                        p={1}
                        color={AppStyles.color.textBlue}
                        name="location"
                        placeholder="Location"
                        placeholderTextColor={AppStyles.color.textBlue}
                        onChangeText={(value) =>
                          setFieldValue('location', value.trimStart())
                        }
                        onBlur={(value) => setFieldTouched('location', value)}
                        value={values.location}
                      />
                      {errors.location && touched.location && (
                        <ErrorText>{errors.location}</ErrorText>
                      )}
                    </VUView>

                    <VUView flexDirection="row">
                      <VUView
                        flex={1}
                        width={'50%'}
                        mr={2}
                        borderBottomColor={AppStyles.color.grayText}
                        borderBottomWidth={1}
                        mb={10}
                        py={1}>
                        <TouchableOpacity
                          px={3}
                          onPress={() => setShowDatePicker(true)}>
                          <VUText
                            px={3}
                            fontSize={14}
                            color={
                              date instanceof Date
                                ? AppStyles.color.textBlue
                                : AppStyles.color.textBlue
                            }>
                            {date instanceof Date
                              ? moment(date).format('DD-MM-YYYY')
                              : 'DD-MM-YYYY'}
                          </VUText>
                        </TouchableOpacity>
                      </VUView>
                      <VUView flex={1} mb={10} width={'50%'}>
                        <VUTextInput
                          borderBottomColor={AppStyles.color.grayText}
                          borderBottomWidth={1}
                          py={2}
                          px={3}
                          p={1}
                          color={AppStyles.color.textBlue}
                          name="education"
                          placeholder="Education"
                          placeholderTextColor={AppStyles.color.textBlue}
                          onChangeText={(value) =>
                            setFieldValue('education', value.trimStart())
                          }
                          onBlur={(value) =>
                            setFieldTouched('education', value)
                          }
                          value={values.education}
                        />
                        {errors.education && touched.education && (
                          <ErrorText>{errors.education}</ErrorText>
                        )}
                      </VUView>
                    </VUView>

                    {/* <VUView
                      width="100%"
                      bg="#fff"
                      py={1}
                      px={2}
                      borderTopWidth={1}
                      borderTopColor={'#bbb'}
                      borderBottomWidth={1}
                      borderBottomColor={'#bbb'}
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center">
                      <VUView flex={1}>
                        <VUText fontSize={12}>Gender</VUText>
                      </VUView>
                      <VUView flex={1}>
                        <TouchableOpacity onPress={handleShowGenderPicker}>
                          <VUText
                            px={3}
                            fontSize={14}
                            color={
                              date instanceof Date
                                ? AppStyles.color.white
                                : AppStyles.color.white
                            }>
                            {date instanceof Date
                              ? moment(date).format('DD-MM-YYYY')
                              : 'DD-MM-YYYY'}
                          </VUText>
                        </TouchableOpacity>
                      </VUView>
                      <VUView flex={1} mb={10} width={'50%'}>
                        <VUTextInput
                          borderBottomColor={AppStyles.color.white}
                          borderBottomWidth={1}
                          py={2}
                          px={3}
                          p={1}
                          color={AppStyles.color.white}
                          name="education"
                          placeholder="Education"
                          placeholderTextColor={AppStyles.color.white}
                          onChangeText={(value) =>
                            setFieldValue('education', value.trimStart())
                          }
                          onBlur={(value) =>
                            setFieldTouched('education', value)
                          }
                          value={values.education}
                        />
                        {errors.education && touched.education && (
                          <ErrorText>{errors.education}</ErrorText>
                        )}
                      </VUView>
                    </VUView>

                    {/* <VUText mx={2} mt={3} mb={2}  color={AppStyles.color.textBlue}>
                      Upload Awards and Recognitions
                  </VUText>
                    <VUView
                      flex={1}
                      alignItems="center"
                      mt={40}
                      width="100%"
                      py={3}>
                      {loading ? (
                        <ActivityIndicator animating={loading} />
                      ) : (
                        <VUView
                          flex={1}
                          width="100%"
                          alignItems="center"
                          justifyContent="center">
                          <VUTouchableOpacity
                            onPress={handleSubmit}
                            disabled={!isValid}
                            alignItems="center"
                            justifyContent="center"
                            width="100%"
                            height={45}
                            borderColor={AppStyles.color.btnColor}
                            borderWidth={1}
                            borderRadius={24}>
                            <VUText
                              fontSize={16}
                              fontFamily={AppStyles.fontName.poppinsBold}
                              color={AppStyles.color.btnColor}>
                              Save Details
                            </VUText>
                          </VUTouchableOpacity>
                        </VUView>
                      </VUScrollView>
                    </VUView> */}
                    <VUView
                      flex={1}
                      alignItems="center"
                      mt={40}
                      width="100%"
                      py={3}>
                      {loading ? (
                        <ActivityIndicator animating={loading} />
                      ) : (
                        <VUView
                          flex={1}
                          width="100%"
                          alignItems="center"
                          justifyContent="center">
                          <VUTouchableOpacity
                            onPress={handleSubmit}
                            disabled={!isValid}
                            alignItems="center"
                            justifyContent="center"
                            width="100%"
                            height={45}
                            borderColor={AppStyles.color.blueBtnColor}
                            borderWidth={1}
                            borderRadius={24}>
                            <VUText
                              fontSize={16}
                              fontFamily={AppStyles.fontName.robotoBold}
                              color={AppStyles.color.blueBtnColor}>
                              Save Details
                            </VUText>
                          </VUTouchableOpacity>
                        </VUView>
                        // <PrimaryButton
                        //   marginTop={0}
                        //   onPress={handleSubmit}
                        //   disabled={!isValid}>
                        //   Update{'  '}
                        // </PrimaryButton>
                      )}
                    </VUView>
                  </VUScrollView>
                </VUView>
              )}
            </Formik>
          </VUTouchableWithoutFeedback>
        </VUView>
        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={handleDateChanged}
          onCancel={handleCancelDate}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;
