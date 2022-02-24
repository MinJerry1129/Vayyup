import React, { useState, useEffect, useCallback, useRef } from 'react';

import firebase from '@react-native-firebase/app';
import {useDispatch, useSelector} from 'react-redux';
import {FlatList, Dimensions, AppState} from 'react-native';

import Feed from '../Home/Feed';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import VideoFeed from 'components/VideoFeed/VideoFeed';
import {
  searchMyVideos,
  setActiveVideo,
  setMyCurrentVideo,
  setMyCompetitionVideo,
  setMyCompetitionVideosAction,
} from 'src/redux/reducers/video.actions';
import {
  voteVideo,
  unvoteVideo,
  feedVideoViewed,
  voteEntry,
  unvoteEntry,
  competitionVideoViewed,
} from 'services/social';

import {
  VUView,
  VUText,
  PrimaryButton,
  VUTouchableOpacity,
} from 'common-components';
import { Overlay, ActivityIndicator } from 'common-components';
import { AppStyles } from 'src/AppStyles';
import Toast from 'react-native-simple-toast';
import { createNullCache } from '@algolia/cache-common';
import { configKeys } from '../../services/utility';
import { IonIcon } from 'src/icons';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
const { height } = Dimensions.get('window');
var currentHomeVideo;

const algoliasearch = require('algoliasearch');
const client = algoliasearch(
  configKeys.algolioAppId,
  configKeys.algolioAdminKey,
  {
    responsesCache: createNullCache(), // Disable Cache
  },
);

const algoliaCompetitonIndex = client.initIndex('entries');
const algoliaVideoIndex = client.initIndex('videos_createdAt_desc');
const MyVideos = ({ route, navigation }) => {
  const {
    user = firebase.auth().currentUser,
    index = 0,
    type = 'myVideos',
    isFromProfile = false,
    isImage,
  } = route.params || {};
  const isMyVideo = user.uid === firebase.auth().currentUser.uid;
  const dispatch = useDispatch();
  const feeds = useSelector(state =>
    state.videos.myVideos.filter(video =>
      user ? video.uid === user.uid : false,
    ),
  );
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const flatlistRef = useRef();

  let competitionVideos = useSelector(state =>
    state.videos.competitionVideos.hasOwnProperty('competitionVideos')
      ? state.videos.competitionVideos.competitionVideos
      : [],
  );
  let myCurrentVideo = useSelector(({ videos }) => videos.myCurrentVideo);
  let myCompetitionsVideo = useSelector(
    ({ videos }) => videos.myCompetitionsVideo.id,
  );

  currentHomeVideo =
    type === 'myCompetitionVideos'
      ? myCompetitionsVideo
      : isFromProfile
        ? myCurrentVideo.profileVideoId
        : myCurrentVideo.id;

  // const filteredFeeds = feeds.filter((obj) => obj);
  const [active, setActive] = useState(0);
  const [videoHeight, setVideoHeight] = useState(height);
  const [activeIndex, setActiveIndex] = useState(index);
  const [focused, setFocused] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showViewPager, setShowViewPager] = useState(true);
  const [imageFilter, setImageFilter] = useState([]);
  const [filteredFeeds, setFilteredFeeds] = useState([]);
  const [currentState , setCurrentState] = useState(AppState.currentState);
  const insets = useSafeAreaInsets();
 

  
  useEffect(() => {
    AppState.addEventListener("change", _handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (
      currentState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
    }
    else{
      console.log('Background')
    }
    setCurrentState(nextAppState);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [filteredFeeds]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (currentHomeVideo !== '') {
        dispatch(setActiveVideo(currentHomeVideo));
      }
    });
    return unsubscribe;
  }, [navigation]);
  useEffect(async () => {
    const videoRes = await algoliaVideoIndex.search(user.id, {
      restrictSearchableAttributes: ['uid'],
      hitsPerPage: 100,
      filters: isMyVideo
        ? 'isImage:false'
        : 'isPublished:true AND isImage:false',
    });
    var videos = await videoRes.hits.filter(hit => hit.url);
    var playback = await videos.filter(obj => obj.playback);
    setFilteredFeeds(playback);
    const photoResponse = await algoliaVideoIndex.search(user.id, {
      restrictSearchableAttributes: ['uid'],
      hitsPerPage: 100,
      filters: 'isImage:true',
    });
    setImageFilter(await photoResponse.hits.filter(hit => hit.url));
  }, [user.id]);
  useEffect(() => {
    const handleFocus = () => {
      dispatch(searchMyVideos(user.uid, isMyVideo));
      setFocused(true);
    };
    const unsubscribeFocus = navigation.addListener('focus', handleFocus);
    const unsubscribeBlur = navigation.addListener('blur', () => {
      setFocused(false);
    });
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [user.uid, navigation, dispatch]);

  useEffect(() => {
    dispatch(searchMyVideos(user.uid, isMyVideo));
  }, [dispatch, user.uid]);

  const handleOnDelete = async (isImage, id) => {
    if (activeIndex == 0) {
      setActiveIndex(activeIndex);
    } else if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else {
      let videos =
        type === 'myCompetitionVideos'
          ? competitionVideos
          : isImage
            ? imageFilter
            : filteredFeeds;
      if (videos.length === 1) {
        setActiveIndex(-1);
      }
    }
    if (type === 'myCompetitionVideos') {
      const responseComVideos = await algoliaCompetitonIndex.search(user.id, {
        restrictSearchableAttributes: ['uid'],
        hitsPerPage: 100,
        filters: '',
      });
      await dispatch(
        setMyCompetitionVideosAction(
          await responseComVideos.hits.filter(hit => hit.url),
        ),
      );
    } else {
      if (isImage) {
        let filterdata = await imageFilter.filter((e, i) => e.id !== id);
        setImageFilter(filterdata);
      } else {
        dispatch(searchMyVideos(user.uid, isMyVideo));
      }
    }
    var message = isImage
      ? 'Image deleted successfully'
      : 'Video deleted successfully';
    Toast.show(message, Toast.LONG);
  };

  const handleVoting = async item => {
    const user = firebase.auth().currentUser;
    if (type === 'myCompetitionVideos') {
      await voteEntry(user, item);
    } else {
      await voteVideo(user, item);
    }
  };

  const handleUnvoting = async item => {
    const user = firebase.auth().currentUser;
    if (type === 'myCompetitionVideos') {
      await unvoteEntry(user, item);
    } else {
      await unvoteVideo(user, item);
    }
  };
  const handlingViewCount = async item => {
    const user = firebase.auth().currentUser;
    if (type === 'myCompetitionVideos') {
      await competitionVideoViewed(user, item);
    } else {
      await feedVideoViewed(user, item);
    }
  };
  const handleLayoutChanged = e => {
    if (videoHeight === height) {
      setVideoHeight(e.nativeEvent.layout.height);
    }
  };
  const handleUpload = () => {
    navigation.navigate('Record');
  };
  const handleBackPressed = () => {
    navigation.goBack();
  };
  const handleCommenting = () => {
    dispatch(setMyCompetitionVideo(''));
  };
  const handleViewableItemsChanged = (onChangeIndex) => {
    let videos = type === 'myCompetitionVideos' ? competitionVideos : type === 'myVideos' && isImage ? imageFilter : filteredFeeds
    const viewableItemId = videos[onChangeIndex.index].id
    setCurrentVideoIndex(onChangeIndex.index)
    dispatch(setActiveVideo(viewableItemId));
    if (type === 'myCompetitionVideos') {
      dispatch(setMyCompetitionVideo(viewableItemId));
    } else {
      isFromProfile
        ? dispatch(setMyCurrentVideo(myCurrentVideo.id, viewableItemId))
        : dispatch(
          setMyCurrentVideo(viewableItemId, myCurrentVideo.profileVideoId),
        );
    }
    setActive({
      id: viewableItemId,
      index: onChangeIndex.index,
    });
  }
  const handleVieweableItemsChanged = useCallback(
    ({ viewableItems, changed }) => {
      const viewable =
        changed.find(obj => obj.isViewable) ||
        viewableItems.find(obj => obj.isViewable);
      if (viewable) {
        dispatch(setActiveVideo(viewable.key));
        if (type === 'myCompetitionVideos') {
          dispatch(setMyCompetitionVideo(viewable.key));
        } else {
          isFromProfile
            ? dispatch(setMyCurrentVideo(myCurrentVideo.id, viewable.key))
            : dispatch(
              setMyCurrentVideo(viewable.key, myCurrentVideo.profileVideoId),
            );
        }

        setActive({
          id: viewable.item.id,
          index: viewable.index,
        });
      }
      // Since it has no dependencies, this function is created only once
    },
    [],
  );
  
  if (loading) {
    return (
      <VUView flex={1} bg={AppStyles.color.bgWhite} onLayout={handleLayoutChanged}>
        <Overlay>
          <ActivityIndicator animating={loading} />
        </Overlay>
      </VUView>
    );
  }
  const getItemLayout = (data, index) => ({
    length: videoHeight,
    offset: videoHeight * index,
    index,
  });

  const renderVideo = ({ item, index }) => {
    return (
      <VUView height={`${videoHeight}px`}>
        <Feed
          type={
            type === 'myCompetitionVideos' ? 'myCompetitionVideos' : 'myVideos'
          }
          key={item.id}
          item={item}
          index={index}
          focused={focused}
          isMyVideos={isMyVideo}
          onDelete={handleOnDelete}
          onVoting={handleVoting}
          onUnvoting={handleUnvoting}
          OnViewCount={handlingViewCount}
          onCommenting={handleCommenting}
        />
      </VUView>
    );
  };
  return (
    <VUView flex={1} bg={AppStyles.color.bgWhite} onLayout={handleLayoutChanged}>
      {showViewPager &&
        (type === 'myCompetitionVideos'
          ? competitionVideos.length > 0
          : type === 'myVideos' && isImage
            ? imageFilter.length > 0
            : filteredFeeds.length > 0) && (
          <VUView flex={1} bg={'#000'}>
            <SwiperFlatList
              ref={flatlistRef}
              autoplay={false}
              useNativeDriver={true}
              windowSize={5}
              initialNumToRender={10}
              removeClippedSubviews={true}
              showPagination={false}
              vertical={true}
              index={activeIndex}
              data={
                type === 'myCompetitionVideos'
                  ? competitionVideos
                  : type === 'myVideos' && isImage
                    ? imageFilter
                    : filteredFeeds
              }
              renderAll={false}
              // onChangeIndex={(index) => handleViewableItemsChanged(index)}
              onViewableItemsChanged={handleVieweableItemsChanged}
              renderItem={renderVideo}
              keyExtractor={(item) => item.id}
              viewabilityConfig={{
                minimumViewTime: 100,
                itemVisiblePercentThreshold: 80,
              }}
              getItemLayout={getItemLayout}
            />
            {/* <FlatList
              data={
                type === 'myCompetitionVideos'
                  ? competitionVideos
                  : type === 'myVideos' && isImage
                  ? imageFilter
                  : filteredFeeds
              }
              onViewableItemsChanged={handleVieweableItemsChanged}
              viewabilityConfig={{
                minimumViewTime: 300,
                itemVisiblePercentThreshold: 80,
              }}
              getItemLayout={getItemLayout}
              renderItem={renderVideo}
              keyExtractor={item => item.id}
              initialScrollIndex={activeIndex}
              windowSize={25}
              pagingEnabled={true}
              removeClippedSubviews={true}
            /> */}
            <VUView
              position="absolute"
              width="100%"
              mt={insets.top}
              alignItems="flex-start"
              p={2}>
              <VUTouchableOpacity onPress={handleBackPressed}>
                <IonIcon
                  bold
                  name="chevron-back"
                  size={25}
                  color={AppStyles.color.white}
                />
              </VUTouchableOpacity>
            </VUView>
          </VUView>
        )}
      {type != 'myCompetitionVideos' &&
        filteredFeeds.length === 0 &&
        isMyVideo &&
        !isImage && (
          <VUView
            flex={1}
            alignItems="center"
            justifyContent="center"
            bg={AppStyles.color.bgWhite}
            p={3}>
            <VUText
              color={AppStyles.color.btnColor}
              fontWeight="bold"
              fontSize={25}
              textAlign="center"
              mb={3}>
              No Videos uploaded
            </VUText>
            {isMyVideo && (
              <>
                <VUText
                  color={AppStyles.color.white}
                  fontSize={18}
                  textAlign="center"
                  mb={5}>
                  You will see all your videos here. Please upload a video using
                  upload below.
                </VUText>
                <PrimaryButton marginTop={0} onPress={handleUpload}>
                  Upload{'  '}
                </PrimaryButton>
              </>
            )}
          </VUView>
        )}
      {type === 'myVideos' && imageFilter.length === 0 && isMyVideo && isImage && (
        <VUView
          flex={1}
          alignItems="center"
          justifyContent="center"
          bg={AppStyles.color.bgWhite}
          p={3}>
          <VUText
            color={AppStyles.color.btnColor}
            fontWeight="bold"
            fontSize={25}
            textAlign="center"
            mb={3}>
            No Images uploaded
          </VUText>
        </VUView>
      )}
    </VUView>
  );
};

export default MyVideos;