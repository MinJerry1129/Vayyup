import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useNavigation} from '@react-navigation/native';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
  View,
  VUImage,
  VUText,
  VUTextInput,
  VUTouchableOpacity,
  VUView,
} from 'common-components';
import GLImage from 'gl-react-image';
import {Surface} from 'gl-react-native';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import {
  Brightness,
  ColorMatrix,
  concatColorMatrices,
  contrast,
  Cool,
  Grayscale,
  invert,
  Kodachrome,
  Night,
  Predator,
  saturate,
  Sepia,
  Technicolor,
  Temperature,
  Threshold,
  Tint,
  Vintage,
  Warm,
} from 'react-native-color-matrix-image-filters';
import ImageFilters from 'react-native-gl-image-filters';
import ImagePicker from 'react-native-image-crop-picker';
import PhotoEditor from 'react-native-photo-editor';
import {useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {AppStyles} from 'src/AppStyles';
import {IonIcon} from 'src/icons';
import Filter from '../../components/FilterImage/Filter';
import Editor from './Editor';
import FilterSlider from './Filter';
var RNFS = require('react-native-fs');

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const watermarkURL =
  'https://firebasestorage.googleapis.com/v0/b/vayyup-app.appspot.com/o/vayy-up.png?alt=media&token=9c319671-021a-43e3-ba45-a281d7094cb6';
const AddCaptions = ({route = {}}) => {
  const {params = {}} = route;
  const [load, setLoad] = useState(false);
  const actionSheetRef = useRef();
  const [currentUser, following] = useSelector((state) => [
    state.auth.user,
    state.social.following,
  ]);
  const [title, setTitle] = useState('');
  const [uploadedImage, setuploadedImage] = useState('');
  const navigation = useNavigation();
  const [isFilter, setFilter] = useState(false);
  const [filterData, setFilterData] = useState('original');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleEdit, setModalVisibleEdit] = useState(false);
  const [modalVisibleEditType, setModalVisibleEditType] = useState('');
  const [ImageWidth, setImageWidth] = useState(0);
  const [ImageHeight, setImageHeight] = useState(0);
  var filterImage = '';
  const filterType = [
    {
      id: '1',
      type: 'original',
      image: require('../../../assets/filter/1.png'),
    },
    {
      id: '2',
      type: 'Grayscale',
      image: require('../../../assets/filter/2.png'),
    },
    {
      id: '3',
      type: 'Sepia',
      image: require('../../../assets/filter/3.png'),
    },
    // {
    //   id: '4',
    //   type: 'ColorMatrix',
    //   image: require('../../../assets/filter/4.png'),
    // },
    // {
    //   id: '5',
    //   type: 'MatrixAlter',
    //   image: require('../../../assets/filter/5.jpg'),
    // },
    {
      id: '4',
      type: 'Saturate',
      image: require('../../../assets/filter/6.jpg'),
    },
    {
      id: '10',
      type: 'Temperature',
      image: require('../../../assets/filter/7.jpg'),
    },
    // {
    //   id: '8',
    //   type: 'Predator',
    //   image: require('../../../assets/filter/8.jpg'),
    // },
    {
      id: '9',
      type: 'Night',
      image: require('../../../assets/filter/9.jpg'),
    },
    {
      id: '5',
      type: 'Vintage',
      image: require('../../../assets/filter/10.jpg'),
    },
    {
      id: '6',
      type: 'Kodachrome',
      image: require('../../../assets/filter/11.jpg'),
    },
    {
      id: '7',
      type: 'Cool',
      image: require('../../../assets/filter/12.jpg'),
    },
    {
      id: '8',
      type: 'Technicolor',
      image: require('../../../assets/filter/13.jpg'),
    },
  ];
  const settings = [
    {
      name: 'hue',
      minValue: 0,
      maxValue: 6.3,
    },
    {
      name: 'blur',
      minValue: 0,
      maxValue: 30,
    },
    {
      name: 'sepia',
      minValue: -5,
      maxValue: 5,
    },
    {
      name: 'sharpen',
      minValue: 0,
      maxValue: 15,
    },
    {
      name: 'negative',
      minValue: -2.0,
      maxValue: 2.0,
    },
    {
      name: 'contrast',
      minValue: -10.0,
      maxValue: 10.0,
    },
    {
      name: 'saturation',
      minValue: 0.0,
      maxValue: 2,
    },
    {
      name: 'brightness',
      minValue: 0,
      maxValue: 5,
    },
    {
      name: 'temperature',
      minValue: 0.0,
      maxValue: 40000.0,
    },
  ];
  const init = {
    ...settings,
    hue: 0,
    blur: 0,
    sepia: 0,
    sharpen: 0,
    negative: 0,
    contrast: 1,
    saturation: 1,
    brightness: 1,
    temperature: 6500,
  };
  const [filtersState, setFiltersState] = useState({...settings, ...init});
  useEffect(() => {
    console.log('++++', params);
    navigation.addListener('focus', () => {
      console.log('----', params.image);
    });
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        openCameraOrGallery();
      }, 2000);
    } else {
      openCameraOrGallery();
    }
  }, [params.isGalleryImage]);
  const openCameraOrGallery = (async) => {
    console.log('curr', currentUser);
    console.log('receivedImg', params.uploadedImage);
    if (!params.isGalleryImage) {
      ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: false,
        compressImageMaxHeight: 600,
        // compressImageQuality: 0.5,
      })
        .then(async (selectedImages) => {
          console.log('thx', selectedImages);
          var images = [selectedImages.path];

          setuploadedImage(images);
        })
        .catch((error) => {
          navigation.popToTop();
          console.log(error + 'OPEN PICKER AGAIN');
        });
    } else {
      ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: false,
        compressImageMaxHeight: 600,
        //  compressImageQuality: 0.8,
      })
        .then(async (selectedImages) => {
          console.log(selectedImages);
          var images = [selectedImages.path];
          setuploadedImage(images);
        })
        .catch((error) => {
          navigation.popToTop();
          console.log(error + 'OPEN PICKER AGAIN');
        });
    }
  };
  const loadImages = async (status) => {
    setLoad(true);
    try {
      const {certificates = []} = currentUser;
      const uploadedImages = await Promise.all(
        uploadedImage
          .filter((image) => !certificates.includes(image))
          .map(async (image) => {
            const filePage = 'users/' + image.split('/').pop();
            const reference = storage().ref(filePage);
            await reference.putFile(image);
            return reference.getDownloadURL();
          }),
      );
      handleUploadImagesOnVideos(status, uploadedImages.toString());
    } catch (error) {
      console.log('uploadedImage', JSON.stringify(error));
    }
  };
  useEffect(() => {
    console.log('uploadedImageuploadedImage', JSON.stringify(uploadedImage));
  }, [uploadedImage]);
  const openTextEditor = async (type) => {
    if (type == 'image') {
      setModalVisibleEdit(true);
      setModalVisibleEditType(type);
      return;
    }
    const hiddenControls = [];
    if (type === 'text') {
      hiddenControls.push('crop');
      hiddenControls.push('draw');
      hiddenControls.push('save');
      hiddenControls.push('share');
      hiddenControls.push('sticker');
    } else if (type === 'image') {
      hiddenControls.push('crop');
      hiddenControls.push('draw');
      hiddenControls.push('save');
      hiddenControls.push('share');
      hiddenControls.push('text');
    } else if (type === 'sticker') {
      hiddenControls.push('crop');
      hiddenControls.push('draw');
      hiddenControls.push('save');
      hiddenControls.push('share');
      hiddenControls.push('text');
    }
    let photoPath = uploadedImage?.toString();
    console.log('photoPath', photoPath);
    const pictureFolder = RNFetchBlob.fs.dirs.PictureDir + '/karaokApp1/';
    let exists = await RNFetchBlob.fs.exists(pictureFolder);
    if (exists) {
      console.log('photoPath exists', exists);
      let isDir = await RNFetchBlob.fs.isDir(pictureFolder);
      console.log('pictureFolder exists', pictureFolder);
      console.log('isDir exists', isDir);
      if (isDir) {
        let filename = photoPath.split('/')[photoPath.split('/').length - 1];
        console.log('isDir', filename);
        let exists = await RNFetchBlob.fs.exists(pictureFolder + filename);
        console.log('photoPath filename', exists);
        if (exists) {
          await RNFetchBlob.fs.unlink(pictureFolder + filename);
        }
        let createEmptyFile = await RNFetchBlob.fs.createFile(
          pictureFolder + filename,
          '',
          'base64',
        );
        let _copy = await RNFetchBlob.fs.cp(
          photoPath,
          pictureFolder + filename,
        );
        PhotoEditor.Edit({
          path: createEmptyFile,
          hiddenControls: hiddenControls,
          colors: undefined,
          onDone: async (path) => {
            const pictureFolder = RNFetchBlob.fs.dirs.PictureDir;
            let filename = path.split('/')[path.split('/').length - 1];
            let newPhoto = await RNFetchBlob.fs.createFile(
              pictureFolder + filename,
              '',
              'base64',
            );
            await RNFetchBlob.fs.cp(path, pictureFolder + filename);
            setuploadedImage(['file://' + newPhoto]);
          },
          onCancel: () => {
            console.log('on cancel');
          },
        });
      }
    } else {
      console.log("test");
      const permissionStatus =
        Platform.OS === 'android' ? await hasAndroidPermission() : true;
      if (permissionStatus) {
        RNFetchBlob.fs
          .mkdir(pictureFolder)
          .then(() => {
            openTextEditor(type);
          })
          .catch((e) => {
            alert('Directory Creating Error : ' + e.message);
          });
      }
    }
  };
  function hasAndroidPermission() {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    console.log("permission sTring::::", permission);
    return PermissionsAndroid.check(permission).then((hasPermission) => {
      if (!hasPermission) {
        return PermissionsAndroid.request(permission).then(
          (status) => status === 'granted',
        );
      }
      return hasPermission;
    });
  }
  const openStyleTransfer = async () => {
    console.log('data=>>>>', uploadedImage.toString());
    navigation.navigate('StyleTransfer', {
      imageUri: uploadedImage.toString(),
      saveImage: saveImportedImage,
    });
  };

  const saveImportedImage = (uri) => {
    setuploadedImage(uri);
  };
  const handleUploadImagesOnVideos = async (status, imageURL) => {
    const {
      fullname = '',
      profile = '',
      location = '',
      username = '',
    } = currentUser;
    console.log('true%%%%%%%%%%%%%%%%%%%%%5');
    console.log('uploadedImage', imageURL);
    const document = {
      url: imageURL,
      votes: 0,
      uid: currentUser.id,
      watermarked: true,
      title: title,
      user: {
        name: fullname,
        profile: profile,
        location: location,
        username: username,
      },
      playback: {
        dash: imageURL,
        hls: imageURL,
      },
      isPublished: status,
      isVerified: currentUser.isVerified ? true : false,
      date: firebase.firestore.FieldValue.serverTimestamp(),
      isImage: true,
    };
    console.log('document', document);
    try {
      await firestore().collection('videos').add(document);
    } catch (e) {
      console.log('error', e);
    }
    setLoad(false);
    navigation.navigate('Profile');
  };
  const handleClose = () => {
    navigation.popToTop();
  };
  const renderItem6 = ({item}) => (
    <View style={{backgroundColor: AppStyles.color.btnColor, marginRight: 10}}>
      <TouchableOpacity onPress={() => setFilterData(item.type)}>
        <ImageBackground
          source={item.image}
          imageStyle={{resizeMode: 'stretch'}}
          style={{height: 50, width: 80, padding: 20}}></ImageBackground>
        <Text
          style={{
            alignSelf: 'center',
            color: 'white',
            // fontFamily: 'GTWalsheimPro-Regular',
          }}>
          {item.type}
        </Text>
      </TouchableOpacity>
    </View>
  );
  const saveImage = async () => {
    if (!this.image) return;
    const result = await this.image.glView.capture();
    filterImage = result.uri;
    console.log('>>>>', filterImage);
    setuploadedImage([result.uri]);
  };
  return (
    <SafeAreaView flex={1} bg={AppStyles.color.bgColor}>
      <KeyboardAvoidingView
        flex={1}
        behavior={Platform.OS == 'ios' ? 'padding' : 'enabled'}>
        <ScrollView flex={1}>
          <VUView>
            <VUView flexDirection="row" justifyContent="flex-end" p={2}>
              <VUTouchableOpacity onPress={handleClose}>
                <IonIcon
                  bold
                  name="close"
                  size={34}
                  color={AppStyles.color.btnColor}
                />
              </VUTouchableOpacity>
            </VUView>
            <VUView>
              <VUText
                fontSize={18}
                fontFamily={AppStyles.fontName.poppinsBold}
                color={AppStyles.color.btnColor}
                textAlign="center">
                Prepare for submission
              </VUText>
            </VUView>
            <VUView style={{margin: 12}}>
              <View
                style={{
                  width: '100%',
                  height: 450,
                  borderRadius: 4,
                  backgroundColor: AppStyles.color.bgColor,
                }}>
                {/* {load ? (
                  <ActivityIndicator color="#FFF" animating={true} />
                ) : ( */}
                {/* <FiltterImage filterType={} innerView={}></FiltterImage> */}
                {filterData === 'original' ? (
                  <VUImage
                    width="100%"
                    height={500}
                    resizeMode="contain"
                    source={{
                      uri: uploadedImage.toString(),
                    }}
                  />
                ) : filterData === 'Grayscale' ? (
                  <Grayscale>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Grayscale>
                ) : filterData === 'Sepia' ? (
                  <Tint amount={0.5}>
                    <Sepia>
                      <Filter uploadedImage={uploadedImage.toString()} />
                    </Sepia>
                  </Tint>
                ) : filterData === 'ColorMatrix' ? (
                  <ColorMatrix
                    matrix={concatColorMatrices([
                      saturate(-0.9),
                      contrast(5.2),
                      invert(),
                    ])}>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </ColorMatrix>
                ) : filterData === 'MatrixAlter' ? (
                  <ColorMatrix
                    matrix={[saturate(-0.9), contrast(2.2), invert()]}>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </ColorMatrix>
                ) : filterData === 'Saturate' ? (
                  <ColorMatrix matrix={saturate(-0.9)}>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </ColorMatrix>
                ) : filterData === 'Hue' ? (
                  <ColorMatrix matrix={Hue(-0.1)}>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </ColorMatrix>
                ) : filterData === 'Temperature' ? (
                  <Temperature amount={1.0}>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Temperature>
                ) : filterData === 'Brightness' ? (
                  <Brightness>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Brightness>
                ) : filterData === 'Predator' ? (
                  <Predator>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Predator>
                ) : filterData === 'Night' ? (
                  <Night>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Night>
                ) : filterData === 'Warm' ? (
                  <Warm>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Warm>
                ) : filterData === 'Vintage' ? (
                  <Vintage>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Vintage>
                ) : filterData === 'Threshold' ? (
                  <Threshold>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Threshold>
                ) : filterData === 'Kodachrome' ? (
                  <Kodachrome>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Kodachrome>
                ) : filterData === 'Cool' ? (
                  <Cool>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Cool>
                ) : filterData === 'Technicolor' ? (
                  <Technicolor>
                    <Filter uploadedImage={uploadedImage.toString()} />
                  </Technicolor>
                ) : (
                  <View></View>
                )}
              </View>
              <VUView>
                <VUTextInput
                  borderBottomColor={AppStyles.color.white}
                  borderBottomWidth={1}
                  py={2}
                  px={3}
                  p={1}
                  color={AppStyles.color.white}
                  onChangeText={(text) => setTitle(text)}
                  value={title}
                  placeholder="Write a caption"
                  placeholderTextColor={AppStyles.color.white}
                  mt={20}
                />
              </VUView>
            </VUView>
            {load ? (
              <ActivityIndicator color="#FFF" animating={true} />
            ) : (
              <VUView
                bottom={0}
                left={0}
                flex={1}
                width="100%"
                mt={20}
                flexDirection="row"
                justifyContent="space-evenly"
                alignItems="center">
                <VUTouchableOpacity
                  onPress={() => {
                    loadImages(false);
                  }}
                  px={3}
                  py={2}
                  mb={3}
                  ml={2}
                  width="40%"
                  borderWidth={2}
                  borderColor={AppStyles.color.btnColor}
                  borderRadius={24}>
                  <VUText
                    fontFamily={AppStyles.fontName.poppinsBold}
                    color={AppStyles.color.btnColor}
                    textAlign="center">
                    Draft
                  </VUText>
                </VUTouchableOpacity>
                <VUTouchableOpacity
                  onPress={() => {
                    loadImages(true);
                  }}
                  px={3}
                  py={2}
                  mb={3}
                  ml={2}
                  width="40%"
                  backgroundColor={AppStyles.color.btnColor}
                  borderWidth={2}
                  borderColor={AppStyles.color.btnColor}
                  borderRadius={24}>
                  <VUText
                    fontFamily={AppStyles.fontName.poppinsBold}
                    color="#fff"
                    textAlign="center">
                    Post
                  </VUText>
                </VUTouchableOpacity>
              </VUView>
            )}
          </VUView>
          {/* {uploading && (
            <VUView
              position="absolute"
              top={0}
              bottom={0}
              left={0}
              right={0}
              flex={1}
              justifyContent="center"
              alignItems="center"
              bg="rgba(0,0,0,0.8)">
              <VUText color="#ccc" my={3}>
                Uploading
              </VUText>
              <AnimatedCircularProgress
                size={120}
                width={8}
                fill={progress}
                tintColor="#E9326D"
                backgroundColor="#3d5875"
              />
            </VUView>
          )} */}
        </ScrollView>
        {isFilter ? (
          <VUView>
            <View style={{backgroundColor: AppStyles.color.btnColor}}>
              <TouchableOpacity
                onPress={() => {
                  setFilter(false);
                }}>
                <Image
                  source={require('../../../assets/bottomTab/close1.png')}
                  style={{
                    height: 15,
                    width: 15,
                    tintColor: '#fff',
                    alignSelf: 'flex-end',
                    margin: 5,
                  }}
                />
              </TouchableOpacity>
              <Text
                style={{
                  // fontFamily: 'GTWalsheimPro-Regular',
                  alignSelf: 'center',
                  color: 'white',
                  fontSize: 25,
                }}>
                Effects
              </Text>
              <FlatList
                horizontal={true}
                data={filterType}
                renderItem={renderItem6}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
              />
            </View>
          </VUView>
        ) : (
          <VUView></VUView>
        )}
        {isFilter ? (
          <VUView></VUView>
        ) : (
          <VUView>
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                backgroundColor: AppStyles.color.btnColor,
                height: 50,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>
              <TouchableOpacity
                onPress={() => openTextEditor('image')}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 5,
                  marginBottom: 5,
                  marginLeft: 5,
                  backgroundColor: AppStyles.color.btnColor,
                }}>
                <Image
                  source={require('../../../assets/bottomTab/gallery.png')}
                  style={{height: 25, width: 25, tintColor: '#fff'}}
                />
                <Text style={{color: '#fff'}}>Add Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openTextEditor('text')}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 5,
                  marginBottom: 5,
                  backgroundColor: AppStyles.color.btnColor,
                }}>
                <Image
                  source={require('../../../assets/bottomTab/text.png')}
                  style={{height: 25, width: 25, tintColor: '#fff'}}
                />
                <Text style={{color: '#fff'}}>Add Text</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => openTextEditor('sticker')}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 5,
                  marginBottom: 5,
                  backgroundColor: AppStyles.color.btnColor,
                }}>
                <Image
                  source={require('../../../assets/bottomTab/sticker.png')}
                  style={{height: 25, width: 25, tintColor: '#fff'}}
                />
                <Text style={{color: '#fff'}}>Add Sticker</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilter(true)}>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 5,
                    marginBottom: 5,
                    backgroundColor: AppStyles.color.btnColor,
                  }}>
                  <Image
                    source={require('../../../assets/bottomTab/rgb2.png')}
                    style={{height: 25, width: 25, tintColor: '#fff'}}
                  />
                  <Text style={{color: '#fff'}}>Filter</Text>
                </View>
              </TouchableOpacity>
              {/* <TouchableOpacity onPress={() => openStyleTransfer()}>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 5,
                    marginBottom: 5,
                    backgroundColor: AppStyles.color.btnColor,
                  }}>
                  <Image
                    source={require('../../../assets/bottomTab/magic-wand.png')}
                    style={{height: 25, width: 25, tintColor: '#fff'}}
                  />
                  <Text style={{color: '#fff'}}>Overlay</Text>
                </View>
              </TouchableOpacity> */}
              {/* <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 5, marginBottom: 5, marginRight: 5, backgroundColor: AppStyles.color.btnColor}}>
                <Image source={require('../../../assets/bottomTab/magic-wand.png')} style={{height: 25 , width: 25, tintColor: '#fff'}}/>
                <Text style={{color: '#fff'}}>Overlay</Text>
              </View>  */}
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                {/* setMoreFilters(true) */}
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 5,
                    marginBottom: 5,
                    marginRight: 5,
                    backgroundColor: AppStyles.color.btnColor,
                  }}>
                  <Image
                    source={require('../../../assets/bottomTab/effect.png')}
                    style={{height: 25, width: 25, tintColor: '#fff'}}
                  />
                  <Text style={{color: '#fff'}}>More</Text>
                </View>
              </TouchableOpacity>
            </View>
          </VUView>
        )}
        <Modal style={{height: '100%', width: '100%'}} visible={modalVisible}>
          <View
            style={{
              height: 50,
              backgroundColor: AppStyles.color.bgColor,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Image
                source={require('../../../assets/bottomTab/close1.png')}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: AppStyles.color.btnColor,
                  marginLeft: 10,
                }}
              />
            </TouchableOpacity>
            <Text
              style={{
                color: AppStyles.color.btnColor,
                fontSize: 20,
                fontWeight: 'bold',
              }}>
              Filters
            </Text>
            <TouchableOpacity
              onPress={() => {
                saveImage();
                setModalVisible(false);
              }}>
              <Image
                source={require('../../../assets/check.png')}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: AppStyles.color.btnColor,
                  marginRight: 10,
                }}
              />
            </TouchableOpacity>
          </View>
          <ScrollView style={{backgroundColor: AppStyles.color.bgColor}}>
            <Surface
              style={{
                width: '100%',
                height: 500,
                backgroundColor: AppStyles.color.bgColor,
              }}
              ref={(ref) => (this.image = ref)}>
              <ImageFilters {...filtersState} width={width} height={500}>
                <GLImage
                  source={{uri: uploadedImage.toString()}}
                  resizeMode="contain"
                />
              </ImageFilters>
            </Surface>
            {settings.map((filter) => (
              <FilterSlider
                key={filter.name}
                name={filter.name}
                minimum={filter.minValue}
                maximum={filter.maxValue}
                onChange={(value) =>
                  setFiltersState((prev) => ({...prev, [filter.name]: value}))
                }
              />
            ))}
          </ScrollView>
        </Modal>
        <Modal
          style={{height: '100%', width: '100%'}}
          visible={modalVisibleEdit}>
          <Editor
            uploadedImage={uploadedImage.toString()}
            modalVisibleEditType={modalVisibleEditType}
            updateImage={(uri) => setuploadedImage([uri])}
            setModalVisible={(value) => setModalVisibleEdit(value)}
          />
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default AddCaptions;
