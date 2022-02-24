import React, {useEffect, useState} from 'react';
import {AppStyles, globalStyles} from 'src/AppStyles';
import {FlatList, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {FlatListSlider} from 'react-native-flatlist-slider';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  VUView,
  VUScrollView,
  VUText,
  VUImage,
  ActivityIndicator,
  VUTextInput,
  Overlay,
} from 'common-components';
import {IonIcon} from 'src/icons';
import {useDebouncedCallback} from 'use-debounce';
import UserListFeed from 'screens/Search/Feed/userlistfeed';
import ActiveCompetitionFeed from 'screens/Search/Feed/activecompetitionfeed';
import ImageSlider from 'react-native-image-slider';

const Search = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [loadingvideo, setloadingvideo] = useState(true);
  let [searchStr, setSearchStr] = useState('');
  let [searchStatus, setSearchStatus] = useState(false);
  let [userlist, setUserList] = useState([]);
  let [searchResultList, setSearchResultList] = useState();
  let [competitionlist, setCompetitionList] = useState([]);
  let [entrylist, setEntryList] = useState([]);
  let [winnerlist, setWinnerList] = useState([]);
  let [fullscreen, setFullScreen] = useState(false);
  let [imageurl, setImageUrl] = useState('');
  const insets = useSafeAreaInsets();
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      const user_snapshots = firestore()
        .collection('users')
        .onSnapshot((snapshot) => {
          // setLoading(true);
          if (snapshot) {
            const users = [];
            snapshot.forEach((obj) => users.push({...obj.data(), id: obj.id}));
            setUserList([]);
            setUserList(users);
          } else {
            setUserList([]);
          }
          // setLoading(false);
        });

      await firestore()
        .collection('competitions')
        .where('isVisible', '==', true)
        .where('isActive', '==', true)
        .onSnapshot((snapshot) => {
          // setLoading(true);
          if (snapshot) {
            const list = [];
            snapshot.forEach((obj) => list.push({...obj.data(), id: obj.id}));
            setCompetitionList(list);

          
          } else {
            setCompetitionList([]);
          }
          //  setLoading(false);
        });

      await firestore()
        .collection('winners')
        .where('isVisible', '==', true)
        .onSnapshot((snapshot) => {
          // setLoading(true);
          if (snapshot) {
            const list = [];
            snapshot.forEach((obj) => list.push({...obj.data(), id: obj.id}));
            setWinnerList(list);
          } else {
            setWinnerList([]);
          }
          // setLoading(false);
        });
      return () => user_snapshots();
    };
    loadData();
    setLoading(false);
  }, []);

  const onCloseSearch = () => {
    setSearchStr('');
    setSearchStatus(false);
  };

  const debounced = useDebouncedCallback(
    // function
    (value) => {
     
      handleUserSearch(value);
    },
    // delay in ms
    1000,
  );

  const onChangeText = (text) => {
    setSearchStr(text);
    if(text == ""){
      setSearchStatus(false)
    }else{      
      debounced(text);
    }    
  };

  const handleUserSearch = async (text) => {
    setSearchStatus(true);
    const filterusers = [];
    for (let i = 0; i < userlist.length; i++) {
      if (userlist[i].fullname != null) {
        if (userlist[i].fullname.toLowerCase().includes(text.toLowerCase())) {
          filterusers.push(userlist[i]);
        }else{
          if (userlist[i].username != null) {
            if (userlist[i].username.toLowerCase().includes(text.toLowerCase())) {
              filterusers.push(userlist[i]);
            }
          }
        }
      }
    }
    setSearchResultList(filterusers);    
  };

  const handleCompetitionPressed = (item) => {
    let competition = competitionlist[item];
    
    navigation.navigate('CompetitionDetails', {competition});
  };

  const onImageSliderClick = (item) => {
    
    // setFullScreen(true)
    // setImageUrl(item.image)
  };

  const renderItem = ({item, index}) => (
    <UserListFeed key={item.id} item={item} index={index} />
  );
  const renderTopVotedVideos = (competition) => {
    return (
      <ActiveCompetitionFeed
        key={competition.id}
        item={competition}
        comid={competition.id}
        // entrylist={entrylist}
      />
    );
  };

  return (
    <VUView flex={1} bg={AppStyles.color.bgWhite} pt={insets.top}>
      {fullscreen ? (
        <Overlay>
          <VUView>
            <VUImage width="100%" height="100%" source={{uri: imageurl}} />
          </VUView>
        </Overlay>
      ) : (
        <VUView
          bg={AppStyles.color.bgWhite}
          flex={1}
          justifyContent="space-between">
          <VUView
            margin={15}
            flexDirection="row"
            justifyContent="space-between">
            <VUView width={5} height="100%" />
            <VUView
              width={windowWidth - 40}
              flexDirection="row"
              justifyContent="space-between"
              bg={AppStyles.color.grayText}
              pl={10}
              pr={10}
              borderRadius={10}>
              <IonIcon name="search" size={24} color={AppStyles.color.grey} />
              <VUTextInput
                flex={1}
                height={50}
                placeholder="Search for users"
                placeholderTextColor={AppStyles.color.grey}
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                multiline={true}
                onChangeText={(text) => onChangeText(text)}
                value={searchStr}
                color={AppStyles.color.black}
              />
              {searchStatus && (
                <IonIcon
                  name="close-circle-outline"
                  onPress={onCloseSearch}
                  size={24}
                  color={AppStyles.color.textBlue}
                />
              )}
            </VUView>
            <VUView width={5} height="100%" />
          </VUView>

          {searchStatus ? (
            <FlatList
              data={searchResultList}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          ) : (
            <VUView flex={1}>
              {loading ? (
                <ActivityIndicator animating={loading} />
              ) : (
                <VUScrollView>
                  <VUView flex={1} mb={50}>
                    {competitionlist.length > 0 && (
                      <>
                        <VUText
                          fontSize={16}
                          color={AppStyles.color.textBlue}
                          fontWeight="bold"
                          margin={3}>
                          Competitions
                        </VUText>
                        <FlatListSlider
                          data={competitionlist}
                          imageKey={'banner'}
                          height={230}
                          timer={10000}
                          indicator={true}
                          indicatorContainerStyle={
                            globalStyles.flatListSliderContainer
                          }
                          onPress={(item) => handleCompetitionPressed(item)}
                        />
                      </>
                    )}
                    {winnerlist.length > 0 &&
                      winnerlist.map((winner) => (
                        <VUView key={winner.id} width="100%" height={300}>
                          <VUText
                            fontSize={16}
                            color={AppStyles.color.textBlue}
                            fontWeight="bold"
                            margin={3}>
                            {' '}
                            Winners of {winner.Title}{' '}
                          </VUText>
                          <ImageSlider
                            loopBothSides
                            autoPlayWithInterval={10000}
                            width="100%"
                            images={winner.Banner}
                            onPress={(item) => onImageSliderClick(item)}
                          />
                        </VUView>
                      ))}
                    {competitionlist.length > 0 &&
                      competitionlist.map((competition) =>
                        renderTopVotedVideos(competition),
                      )}
                  </VUView>
                </VUScrollView>
              )}
            </VUView>
          )}
        </VUView>
      )}
    </VUView>
  );
};

export default Search;
