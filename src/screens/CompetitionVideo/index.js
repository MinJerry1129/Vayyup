import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import {useDispatch} from 'react-redux';
import {FontAwesomeIcon} from 'src/icons';
import {useIsFocused} from '@react-navigation/native';
import {
  voteEntry,
  unvoteEntry,
  voteVideo,
  unvoteVideo,
  feedVideoViewed,
  competitionVideoViewed,
} from 'services/social';

import Feed from 'screens/Home/Feed';
import {setActiveVideo} from 'src/redux/reducers/video.actions';

import {
  VUView,
  VUText,
  SafeAreaView,
  VUTouchableOpacity,
} from 'common-components';
import {Overlay, ActivityIndicator} from 'common-components';
import { AppState } from 'react-native';

const CompetitionVideos = ({route}) => {
  const {videoId = '', videoType} = route.params;
  const navigation = useNavigation();
  const [videoDetails, setVideoDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [currentState , setCurrentState] = useState(AppState.currentState);
  const dispatch = useDispatch();
  const focused = useIsFocused();

  useEffect(() => {
    const loadVideoDetails = async _videoId => {
      setLoading(true);
      const snapshot = await firestore()
        .collection(videoType)
        .doc(_videoId)
        .get();

      if (snapshot.exists) {
        setVideoDetails({id: _videoId, ...snapshot.data()});
        dispatch(setActiveVideo(_videoId));
        setLoading(false);
      }
    };
    loadVideoDetails(videoId);
  }, [videoId, videoType]);

  const handleVoting = async item => {
    const user = firebase.auth().currentUser;
    videoType === 'entries'
      ? await voteEntry(user, item)
      : await voteVideo(user, item);
  };
  const handlingViewCount = async item => {
    const user = firebase.auth().currentUser;
    videoType === 'entries'
      ? await competitionVideoViewed(user, item)
      : await feedVideoViewed(user, item);
  };

  const handleCommenting = () => {
    setCommenting(true);
  };

  const handleUnvoting = async item => {
    const user = firebase.auth().currentUser;
    videoType === 'entries'
      ? await unvoteEntry(user, item)
      : await unvoteVideo(user, item);
  };

  const handleBacktToHome = () => {
    navigation.navigate('VayyUp');
  };

  if (loading) {
    return (
      <Overlay>
        <ActivityIndicator animating={loading} />
      </Overlay>
    );
  }

  return (
    <SafeAreaView>
      <VUView flex={1}>
        <VUView width="95%" justifyContent="flex-start" mt={15} mx={10}>
          <VUTouchableOpacity onPress={handleBacktToHome}>
            <VUView flexDirection="row">
              <FontAwesomeIcon size={16} color="#000" name="chevron-left" />
              <VUText ml={1} color="#FFF" fontSize={16}>
                Back
              </VUText>
            </VUView>
          </VUTouchableOpacity>
        </VUView>
        <Feed
          type={videoType === 'entries' ? 'competition' : null}
          key={videoDetails.id}
          item={videoDetails}
          index={0}
          focused={focused}
          onVoting={handleVoting}
          onUnvoting={handleUnvoting}
          onCommenting={handleCommenting}
          OnViewCount={handlingViewCount}
       
        />
      </VUView>
    </SafeAreaView>
  );
};

export default CompetitionVideos;
