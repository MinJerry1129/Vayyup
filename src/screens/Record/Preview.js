import React, {Component} from 'react';
import {
  View,
  VUView,
  VUVideo,
  VUText,
  VUTouchableOpacity,
  VUTextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  VUImage,
} from 'common-components';
import Toast from 'react-native-simple-toast';
import firestore from '@react-native-firebase/firestore';
import {createNullCache} from '@algolia/cache-common';
import {setMyCompetitionVideosAction} from './../../redux/reducers/video.actions';
import {
  ScrollView,
  Platform,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {AppStyles, globalStyles} from './../../AppStyles';
import {IonIcon, AntDesignIcon} from './../../icons';
import {connect} from 'react-redux';

import {configKeys} from '../../services/utility';

var algoliasearch = require('algoliasearch');

const client = algoliasearch(
  configKeys.algolioAppId,
  configKeys.algolioAdminKey,
  {
    responsesCache: createNullCache(), // Disable Cache
  },
);

const algoliaCompetitonIndex = client.initIndex('entries');

export class Preview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.route.params.item,
      title: props.route.params.item.title,
      type: props.route.params.type,
      uploadVideo: false,
      videoSource: '',
      previewPlaying: false,
      uploading: false,
      progress: 0,
      loading: false,
      users: [],
      pseudoUsers: [],
    };
  }

  componentDidMount = () => {
    const {
      url,
      thumbnail,
      playback = {},
      video,
      videoFileName,
    } = this.state.item;
    const {hls, dash} = playback;
    console.log('this.state.item', this.state.item);
    console.log(this.state.item.url);

    let videoURL = {uri: url};
    if (Platform.OS === 'ios' && hls) {
      videoURL = {uri: hls, type: 'm3u8'};
    }
    if (Platform.OS === 'android' && dash) {
      videoURL = {uri: dash, type: 'mpd'};
    }
    this.setState({
      videoSource: videoURL,
    });
  };

  refreshVideos = async () => {
    let user = this.props.user;
    const responseComVideos = await algoliaCompetitonIndex.search(user.id, {
      restrictSearchableAttributes: ['uid'],
      hitsPerPage: 100,
    });

    setTimeout(async () => {
      await this.props.setMyCompetitionVideosAction(
        await responseComVideos.hits.filter((hit) => hit.url),
      );
      Toast.show('Published successfully', Toast.LONG);
      // this.props.navigation.popToTop();
      this.props.navigation.navigate('Profile', {screen: 'Profile'});
      this.setState({
        loading: false,
      });
    }, 3000);

    // this.setState({
    //   loading: false,
    // });
  };

  handleTogglePlaying = () => {
    this.setState({
      previewPlaying: !this.state.previewPlaying,
    });
  };

  handlePreviewEnded = () => {
    this.setState({
      previewPlaying: false,
    });
  };
  handleVideoType = async () => {
    if (this.state.type === 'myCompetitionVideos') {
      let document = this.state.item;
      const snapshot = await firestore()
        .collection('entries')
        .where('uid', '==', document.uid)
        .where('competitionId', '==', document.competitionId)
        .where('isPublished', '==', true)
        .get();
      if (snapshot.empty) {
        this.handleOnPublish();
      } else {
        Toast.show('You have already submitted', Toast.LONG);
      }
    } else {
      this.handleOnPublish();
    }
  };
  handleOnPublish = async () => {
    this.setState({
      loading: true,
    });
    let document = this.state.item;
    document.isPublish = true;
    const collectionName =
      this.state.type === 'myCompetitionVideos' ? 'entries' : 'videos';

    let title = this.state.title.split(' ');

    for (let a in title) {
      if (title[a].includes('@')) {
        let userName = title[a].slice(1, title[a].length);
        let user = this.state.pseudoUsers.find(
          (item) => item.username == userName,
        );
        if (user != undefined) {
          title[a] = `@[${userName}](id:${user.id})`;
        }
      }
    }

    let t = title.join(' ');
    firestore()
      .collection(collectionName)
      .doc(document.id)
      .update({
        title: t,
        isPublished: true,
      })
      .then((update) => {
        this.refreshVideos();
      })
      .catch((error) => {
        console.log('Error', error);
      });
  };

  handleOnSave = async () => {
    let document = this.state.item;
    document.title = this.state.title;
    const collectionName =
      this.state.type === 'myCompetitionVideos' ? 'entries' : 'videos';
    firestore()
      .collection(collectionName)
      .doc(document.id)
      .update({
        title: this.state.title,
      })
      .then((update) => {
        Toast.show('Updated successfully', Toast.LONG);
        this.props.navigation.popToTop();
      })
      .catch((error) => {
        console.log('Error', error);
      });
  };
  handleClose = () => {
    this.props.navigation.navigate('Profile');
  };
  handleOnDeleteAlert = () => {
    Alert.alert('', 'Are you sure you want to delete? ', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {text: 'OK', onPress: () => this.handleOnDelete()},
    ]);
  };
  handleOnDelete = async () => {
    let document = this.state.item;
    const collectionName =
      this.state.type === 'myCompetitionVideos' ? 'entries' : 'videos';
    await firestore().collection(collectionName).doc(document.id).delete();
    setTimeout(() => {
      Toast.show('Video deleted successfully.', Toast.LONG);
      this.props.navigation.navigate('Profile');
    }, 7000);
  };

  handlePlay = () => {
    this.setState({previewPlaying: !this.state.previewPlaying});
  };

  render() {
    return (
      <SafeAreaView flex={1} bg={AppStyles.color.bgWhite}>
        <KeyboardAvoidingView
          flex={1}
          behavior={Platform.OS == 'ios' ? 'padding' : 'enabled'}>
          <ScrollView flex={1}>
            <VUView>
              <VUView flexDirection="row" p={2}>
                <VUView
                  flex={1}
                  justifyContent="flex-end"
                  alignItems="flex-end">
                  <VUTouchableOpacity onPress={this.handleClose}>
                    <IonIcon
                      bold
                      name="close"
                      size={34}
                      color={AppStyles.color.btnColor}
                    />
                  </VUTouchableOpacity>
                </VUView>
              </VUView>
              {/* <VUView>
                <VUText
                  fontSize={18}
                  fontFamily={AppStyles.fontName.robotoBold}
                  color={AppStyles.color.btnColor}
                  textAlign="center">
                  Prepare for submission
                </VUText>
              </VUView> */}
              <VUView style={{margin: 12}}>
                <View
                  style={{
                    width: '100%',
                    height: 480,
                    borderRadius: 4,
                  }}>
                  {(this.state.type == 'myVideos'
                    ? this.state.item.isImage
                      ? false
                      : true
                    : true) == true ? (
                    <VUTouchableOpacity
                      flex={1}
                      activeOpacity={1.0}
                      onPress={this.handlePlay}>
                      <VUVideo
                        flex={1}
                        source={this.state.videoSource}
                        volume={10}
                        width="100%"
                        height={480}
                        resizeMode="cover"
                        repeat={true}
                        onEnd={this.handlePreviewEnded}
                        paused={this.state.previewPlaying}
                        poster={this.state.item.thumbnail}
                        posterResizeMode={'cover'}
                        ignoreSilentSwitch="ignore"
                      />
                      {this.state.previewPlaying && (
                        <VUView
                          alignItems="center"
                          justifyContent="center"
                          position="absolute"
                          style={[StyleSheet.absoluteFill]}>
                          <AntDesignIcon name={'play'} size={64} color="#bbb" />
                        </VUView>
                      )}
                    </VUTouchableOpacity>
                  ) : (
                    <VUImage
                      source={{
                        uri: this.state.item.hasOwnProperty('videoFileName')
                          ? this.state.item.thumbnail
                          : this.state.item.url,
                      }}
                      width="100%"
                      height={480}
                      resizeMode="cover"
                    />
                  )}
                </View>
                <VUView>
                  <VUTextInput
                    borderBottomColor={AppStyles.color.textBlue}
                    borderBottomWidth={1}
                    py={2}
                    px={3}
                    p={1}
                    color={AppStyles.color.textBlue}
                    value={this.state.title}
                    onChangeText={(text) => {
                      this.setState({
                        title: text,
                      });
                    }}
                    placeholder="Write a caption"
                    placeholderTextColor={AppStyles.color.textBlue}
                    mt={20}
                  />
                </VUView>
              </VUView>
              {this.state.loading ? (
                <ActivityIndicator
                  animating={true}
                  size="large"
                  color={AppStyles.color.blueBtnColor}
                />
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
                    onPress={this.handleOnSave}
                    px={3}
                    py={2}
                    mb={3}
                    ml={2}
                    width="40%"
                    borderWidth={2}
                    borderColor={AppStyles.color.blueBtnColor}
                    borderRadius={24}>
                    <VUText
                      fontFamily={AppStyles.fontName.robotoBold}
                      color={AppStyles.color.blueBtnColor}
                      textAlign="center">
                      Draft
                    </VUText>
                  </VUTouchableOpacity>
                  <VUTouchableOpacity
                    onPress={this.handleVideoType}
                    px={3}
                    py={2}
                    mb={3}
                    ml={2}
                    width="40%"
                    backgroundColor={AppStyles.color.blueBtnColor}
                    borderWidth={2}
                    borderColor={AppStyles.color.blueBtnColor}
                    borderRadius={24}>
                    <VUText
                      fontFamily={AppStyles.fontName.robotoBold}
                      color="#fff"
                      textAlign="center">
                      Post
                    </VUText>
                  </VUTouchableOpacity>
                </VUView>
              )}
            </VUView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

const mapDispatchToProps = {
  setMyCompetitionVideosAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Preview);
