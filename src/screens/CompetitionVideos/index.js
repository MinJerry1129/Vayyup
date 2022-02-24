import React, {useState, useEffect, useCallback} from 'react';
import {AppState, Dimensions, FlatList} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {voteEntry, unvoteEntry, competitionVideoViewed} from 'services/social';
import Feed from 'screens/Home/Feed';
import {AppStyles, globalStyles} from 'src/AppStyles';
import {
  searchFeeds,
  setActiveVideo,
  setCompetitionVideo,
} from 'src/redux/reducers/actions';

import {
  Text,
  View,
  VUTouchableOpacity,
  VUView,
  VUText,
  MySearchBar,
  VUImage,
} from 'common-components';
import {Overlay, ActivityIndicator} from 'common-components';
import {useDebouncedCallback} from 'use-debounce';
const {height} = Dimensions.get('window');
import moment from 'moment';
import SwiperFlatList from 'react-native-swiper-flatlist';
var width = Dimensions.get('window').width;
let currentHomeVideo;
function CompetitionVideos({route}) {
  const {competition = ''} = route.params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [videoHeight, setVideoHeight] = useState(height);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const [allowVoting, setAllowVoting] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const dispatch = useDispatch();
  const focused = useIsFocused();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [currentState, setCurrentState] = useState(AppState.currentState);
  const flatlistRef = useRef();
  const feeds = useSelector((state) =>
    state.feeds.hasOwnProperty('feeds') ? state.feeds.feeds : [],
  );

  currentHomeVideo = useSelector(({feeds}) => feeds.currentCompetitionVideo.id);
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      if (!commenting) {
        // dispatch(searchFeeds(competition.id, search));
      }
      setCommenting(false);
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [commenting, dispatch, competition.id]),
  );

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  const _handleAppStateChange = (nextAppState) => {
    if (
      currentState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
    } else {
      console.log('Background');
    }
    setCurrentState(nextAppState);
  };

  useEffect(async () => {
    await dispatch(searchFeeds(competition.id, search));
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (currentHomeVideo !== '') {
        dispatch(setActiveVideo(currentHomeVideo));
      }
    });
    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      var currentDate = moment().unix();
      var voteEnddate = competition.voteEndDateTime._seconds;
      setAllowVoting(currentDate <= voteEnddate);
    }, [competition.id]),
  );

  const debounced = useDebouncedCallback(
    // function
    (value) => {
      // setSearchTerm(value);
      dispatch(searchFeeds(competition.id, search));
    },
    // delay in ms
    1000,
  );

  const handleChangeSearch = (text) => {
    setSearch(text);
    debounced(text);
  };

  const handleVoting = async (item) => {
    const user = firebase.auth().currentUser;
    await voteEntry(user, item);
  };
  const handlingViewCount = async (item) => {
    const user = firebase.auth().currentUser;
    await competitionVideoViewed(user, item);
  };

  const handleCommenting = () => {
    setCommenting(true);
  };

  const handleUnvoting = async (item) => {
    const user = firebase.auth().currentUser;
    await unvoteEntry(user, item);
  };
  const handleLayoutChanged = (e) => {
    if (videoHeight === height) {
      setVideoHeight(e.nativeEvent.layout.height);
    }
  };

  const handlePress = () => {
    setShowSearch(!showSearch);
    setSearch('');
    debounced('');
  };

  // const handleVieweableItemsChanged = (onChangeIndex) => {
  //   setCurrentVideoIndex(onChangeIndex.index)
  //   const viewableItemId = feeds[onChangeIndex.index].id
  //   dispatch(setActiveVideo(viewableItemId))
  //   dispatch(setCurrentVideo(viewableItemId))
  // }

  const handleVieweableItemsChanged = useCallback(
    ({viewableItems, changed}) => {
      const viewable =
        changed.find((obj) => obj.isViewable) ||
        viewableItems.find((obj) => obj.isViewable);
      if (viewable) {
        dispatch(setActiveVideo(viewable.key));
        dispatch(setCompetitionVideo(viewable.key));
      }
      // Since it has no dependencies, this function is created only once
    },
    [],
  );

  if (loading) {
    return (
      <Overlay>
        <ActivityIndicator animating={loading} />
      </Overlay>
    );
  }
  const getItemLayout = (data, index) => ({
    length: videoHeight,
    offset: videoHeight * index,
    index,
  });
  const renderVideo = ({item, index}) => {
    return (
      <VUView height={videoHeight}>
        <Feed
          type="competition"
          key={item.id}
          item={item}
          index={index}
          focused={focused}
          onVoting={handleVoting}
          onUnvoting={handleUnvoting}
          onCommenting={handleCommenting}
          OnViewCount={handlingViewCount}
          allowVoting={allowVoting}
        />
      </VUView>
    );
  };

  return (
    <VUView flex={1} pt={insets.top} pb={insets.bottom}>
      <VUView position="absolute" flexDirection="row" alignItems="center">
        {showSearch ? (
          <VUView flexDirection="row" alignItems="center">
            <VUView width={width * 0.9}>
              <MySearchBar
                placeholder={'Search user'}
                onChangeText={(text) => handleChangeSearch(text)}
                value={search}
              />
            </VUView>
            <VUView>
              <VUTouchableOpacity onPress={handlePress}>
                <VUImage
                  width={26}
                  height={26}
                  resizeMode="contain"
                  source={require('src/../assets/feed/close.png')}
                />
              </VUTouchableOpacity>
            </VUView>
          </VUView>
        ) : (
          <VUView
            flex={1}
            justifyContent="flex-end"
            alignItems="flex-end"
            style={globalStyles.competitionMargins}>
            <VUTouchableOpacity onPress={handlePress}>
              <VUImage
                width={32}
                height={32}
                resizeMode="contain"
                source={require('src/../assets/feed/search.png')}
              />
            </VUTouchableOpacity>
          </VUView>
        )}
      </VUView>
      {feeds == undefined ? (
        <VUView
          flex={1}
          alignItems="center"
          justifyContent="center"
          bg={AppStyles.color.bgWhite}
          p={3}>
          <VUText
            color={AppStyles.color.textBlue}
            fontWeight="bold"
            fontSize={25}
            textAlign="center"
            mb={3}>
            No results found.
          </VUText>
        </VUView>
      ) : (
        <VUView onLayout={handleLayoutChanged}>
          {feeds.length > 0 ? (
            <VUView>
              <FlatList
                data={feeds}
                onViewableItemsChanged={handleVieweableItemsChanged}
                renderItem={renderVideo}
                keyExtractor={(item) => item.id}
                initialNumToRender={10}
                windowSize={10}
                pagingEnabled={true}
                removeClippedSubviews={true}
                getItemLayout={getItemLayout}
                viewabilityConfig={{
                  minimumViewTime: 100,
                  itemVisiblePercentThreshold: 80,
                }}
              />
              {/* <SwiperFlatList
                ref={flatlistRef}
                autoplay={false}
                useNativeDriver={true}
                windowSize={5}
                initialNumToRender={5}
                removeClippedSubviews={true}
                showPagination={false}
                vertical={true}
                data={feeds}
                extraData={feeds}
                renderAll={false}
                onChangeIndex={(index) => handleVieweableItemsChanged(index)}
                renderItem={renderVideo}
                keyExtractor={keyExtractor}
                viewabilityConfig={{
                  minimumViewTime: 100,
                  itemVisiblePercentThreshold: 80,
                }}
                onEndReachedThreshold={0.1}
                getItemLayout={getItemLayout}
              /> */}
            </VUView>
          ) : (
            <View flex={1}>
              <Text color="#000" fontSize={18} textAlign="center">
                No results found.
              </Text>
            </View>
          )}
        </VUView>
      )}
    </VUView>
  );
}

export default CompetitionVideos;
