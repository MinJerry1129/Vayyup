import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  createRef,
} from 'react';
import {FlatList, Dimensions} from 'react-native';
import firebase from '@react-native-firebase/app';
import {useDispatch, useSelector} from 'react-redux';
import {useDebouncedCallback} from 'use-debounce';
import {useIsFocused} from '@react-navigation/native';
import Feed from 'screens/Home/Feed';
import {AppStyles} from '../../AppStyles';
import {
  searchVideos,
  setActiveVideo,
  setCurrentVideo,
} from 'src/redux/reducers/video.actions';
import {
  Text,
  View,
  Overlay,
  ActivityIndicator,
  VUView,
} from 'common-components';
import {
  voteVideo,
  unvoteVideo,
  feedVideoViewed,
  getBlocking,
} from 'services/social';

const {height} = Dimensions.get('window');
function Home({navigation}) {
  const dispatch = useDispatch();
  const videos = useSelector((state) =>
    state.videos.hasOwnProperty('videos') ? state.videos.videos : [],
  );
  const [search, setSearch] = useState('');
  const [videoHeight, setVideoHeight] = useState(height);
  const [searchTerm, setSearchTerm] = useState('');
  // currentHomeVideo = useSelector(({ videos }) => videos.currentVideo.id);
  const [loading, setLoading] = useState(true);
  const [commenting, setCommenting] = useState(false);
  const focused = useIsFocused();
  const [videoBlock, setVideoBlock] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const currentuserblock = useSelector(
    (state) => state.social.currentuserblock,
  );
  const [user, setUser] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const flatlistRef = useRef();
  useEffect(() => {
    setLoading(loading);
  }, [loading]);

  const debounced = useDebouncedCallback(
    // function
    (value) => {
      setSearchTerm(value);
      dispatch(searchVideos(value));
    },
    // delay in ms
    1000,
  );

  const handleChangeSearch = (text) => {
    setSearch(text);
    debounced.callback(text);
  };

  const handleClearSearch = () => {
    dispatch(searchVideos(''));
    setSearchTerm('');
    setSearch('');
  };

  const handleVideoBlock = () => {
    setVideoBlock(!videoBlock);
  };

  const handleRefresh = () => {
    dispatch(searchVideos(searchTerm, 0));
  };

  useEffect(() => {
    dispatch(searchVideos(searchTerm));
  }, []);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', async () => {
  //     dispatch(searchVideos(searchTerm));

  //     if (currentHomeVideo !== '') {
  //       dispatch(setActiveVideo(currentHomeVideo));
  //     }
  //   });
  //   return unsubscribe;
  // }, [navigation]);

  useEffect(() => {
    if (focused) {
      if (!commenting) {
      }
      setCommenting(false);
    }
  }, [focused, commenting, dispatch, searchTerm]);

  // const fetchUser = async () => {

  //   let newVideos = [];
  //   let user = await firebase.auth().currentUser;
  //   setUser(user);
  //   let blockedUsers = await getBlocking(user.uid);
  //   setBlockedUsers(blockedUsers);
  //   if (blockedUsers.length > 0) {
  //     for (let i = 0; i < videos.length; i++) {
  //       let exist = blockedUsers.filter(function (v) {
  //         return v.id == videos[i].uid;
  //       });
  //       if (exist.length == 0) {
  //         newVideos.push(videos[i]);
  //       }
  //     }
  //   }
  //   else {
  //     newVideos = videos;
  //   }

  //   setFilteredVideos(newVideos);

  //   if (newVideos.length > 0) {
  //     setLoading(false);
  //   }
  // };

  const fetchUser = async () => {
    let user = await firebase.auth().currentUser;
    let blockedUsers = await getBlocking(user.uid);

    let newVideos = [];
    for (let i = 0; i < videos.length; i++) {
      let exist = blockedUsers.filter(function (v) {
        return v.id == videos[i].uid;
      });
      if (exist.length == 0) {
        newVideos.push(videos[i]);
      }
    }
    setFilteredVideos(newVideos);
    if (newVideos.length > 0) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [videos, currentuserblock]);

  const handleCommenting = () => {
    dispatch(setCurrentVideo(''));
    setCommenting(true);
  };
  const handlingViewCount = async (item) => {
    const user = firebase.auth().currentUser;
    await feedVideoViewed(user, item);
  };

  const handleVoting = async (item) => {
    const user = firebase.auth().currentUser;
    voteVideo(user, item);
  };

  const handleUnvoting = async (item) => {
    const user = firebase.auth().currentUser;
    unvoteVideo(user, item);
  };

  const handleViewableItemsChanged = useCallback(
    ({viewableItems, changed}) => {
      const viewable =
        changed.find((obj) => obj.isViewable) ||
        viewableItems.find((obj) => obj.isViewable);
      if (viewable) {
        dispatch(setActiveVideo(viewable.key));
        dispatch(setCurrentVideo(viewable.key));
      }
    },
    [dispatch],
  );

  const handleLayoutChanged = (e) => {
    if (videoHeight === height) {
      setVideoHeight(e.nativeEvent.layout.height);
    }
  };

  const keyExtractor = useCallback((item) => item.id, []);

  const handleOnEndReached = () => {
    dispatch(searchVideos(searchTerm));
  };

  const getItemLayout = (data, index) => ({
    length: videoHeight,
    offset: videoHeight * index,
    index,
  });

  const handleAutoScrollToNext = (index) => {
    if (currentVideoIndex == index)
      if (flatlistRef.current != undefined) {
        setTimeout(
          () =>
            flatlistRef.current.scrollToIndex({
              animated: true,
              index: currentVideoIndex + 1,
            }),
          3000,
        );
      }
  };

  const renderVideo = ({item, index}) => {
    return (
      <VUView height={`${videoHeight}px`}>
        <Feed
          key={item.id}
          item={item}
          index={index}
          focused={focused}
          onVoting={handleVoting}
          onUnvoting={handleUnvoting}
          onCommenting={handleCommenting}
          OnViewCount={handlingViewCount}
          // onRefresh={handleRefresh}
        />
      </VUView>
    );
  };

  if (loading) {
    return (
      <Overlay>
        <ActivityIndicator animating={loading} />
      </Overlay>
    );
  }

  const getItemCount = (data) => {
    return data.length;
  };

  const getItem = (data, index) => {
    return {data: data[index], index};
  };

  return (
    <VUView flex={1}>
      <VUView flex={1} onLayout={handleLayoutChanged}>
        {filteredVideos.length > 0 ? (
          <FlatList
            onViewableItemsChanged={handleViewableItemsChanged}
            onRefresh={handleRefresh}
            refreshing={loading}
            data={filteredVideos}
            renderItem={renderVideo}
            keyExtractor={keyExtractor}
            initialNumToRender={0}
            windowSize={10}
            pagingEnabled={true}
            removeClippedSubviews={true}
            viewabilityConfig={{
              minimumViewTime: 100,
              itemVisiblePercentThreshold: 80,
            }}
            onEndReached={handleOnEndReached}
            onEndReachedThreshold={0.1}
            getItemLayout={getItemLayout}
            debug={false}
          />
        ) : (
          <View flex={1}>
            <Text color="#000" fontSize={18} textAlign="center">
              No results found.
            </Text>
          </View>
        )}
      </VUView>
    </VUView>
  );
}

export default Home;
