import React, {useState, useCallback} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import CountDown from 'react-native-countdown-component';
import {Overlay, ActivityIndicator} from 'common-components';
import firestore from '@react-native-firebase/firestore';
import {IonIcon} from 'src/icons';
import {searchFeeds, entryListVideos} from 'src/redux/reducers/actions';
import {AppStyles, globalStyles} from 'src/AppStyles';
import {ParticipateNowText, Wrapper} from './styles';
import {
  VUText,
  VUView,
  VUImage,
  VUScrollView,
  SafeAreaView,
  VUTouchableOpacity,
} from 'common-components';
import {useEffect} from 'react';
import Header from '../../common-components/Header';

const CompetitionDetailTabs = {
  Participate: 0,
  Terms: 1,
};

const CompetitionDetails = ({route}) => {
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [participate, setParticipate] = useState(false);
  const [results, setResults] = useState([]);
  const {competition = {}} = route.params;
  const [tab, setTab] = useState(CompetitionDetailTabs.Participate);
  const user = useSelector((state) => state.auth.user);
  let [entrylist, setEntryList] = useState([]);
  let feeds = useSelector((state) =>
    state.feeds.hasOwnProperty('feeds') ? state.feeds.feeds : [],
  );
  const dispatch = useDispatch();
  const {
    id,
    title,
    description,
    startDateTime,
    voteEndDateTime,
    endDateTime,
    banner,
    isParent,
    parentId,
    allowedMembers,
  } = competition;

  const navigation = useNavigation();
  navigation.setOptions({tabBarVisible: true});
  const [showlist, setshowlist] = useState(false);

  //Handle user who not updated his Profile
  console.log('count....', showlist);
  let timer;

  useFocusEffect(
    React.useCallback(() => {
      timer = setTimeout(() => {
        setshowlist((show) => !show);
      }, 3000);

      return () => {
        setshowlist(false);
        clearTimeout(timer);
      };
    }, []),
  );

  useEffect(() => {
    const loadData = async () => {
      await dispatch(searchFeeds(competition.id, ''));
    };
    loadData();
  }, []);
  useEffect(() => {
    setEntryList(feeds);
    dispatch(entryListVideos(feeds));

    console.log('entrylist.....', entrylist[0]?.thumbnail);

    setLoading(false);
  }, [feeds]);
  // useEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: (
  //       <VUText
  //         textAlign="center"
  //         fontFamily={AppStyles.fontName.robotoBold}
  //         color={AppStyles.color.textBlue}>
  //         {competition.title}
  //       </VUText>
  //     ),
  //     headerBackTitleStyle : {
  //       color : AppStyles.color.textBlue
  //     }
  //   },
  //   );
  // }, [navigation, competition.title]);

  useEffect(() => {
    const load = async () => {
      const snapshot = await firestore()
        .collection('entries')
        .where('uid', '==', user.id)
        .where('competitionId', '==', id)
        .where('isPublished', '==', true)
        .get();

      setSubmitted(!snapshot.empty);
      setLoading(false);
    };
    load();
  }, [id, user.id, banner]);

  useEffect(() => {
    const loadResult = async () => {
      const snapshot = await firestore()
        .collection('entries')
        .where('competitionId', '==', id)
        .orderBy('votes', 'desc')
        .limit(10)
        .get();

      if (!snapshot.empty) {
        const _results = [];
        snapshot.forEach((doc) => _results.push(doc.data()));

        setResults(_results);
      }
      setLoading(false);
    };
    loadResult();
  }, [completed, id]);

  useEffect(() => {
    const loadResult = async () => {
      if (isParent) {
        setParticipate(true);
      } else {
        const snapshot = await firestore()
          .collection('entries')
          .where('competitionId', '==', parentId)
          .where('uid', '==', user.id)
          .where('isAllowed', '==', true)
          .where('isPublished', '==', true)
          .get();

        if (snapshot.docs.length == 1) {
          setParticipate(true);
        } else {
          setParticipate(false);
        }
        // if (!snapshot.empty) {
        //   const _results = [];
        //   snapshot.forEach(doc => _results.push(doc.data()));

        //   const filtereddata = _results.filter(obj => obj.uid == user.id);
        //   filtereddata.length > 0
        //     ? setParticipate(true)
        //     : setParticipate(false);
        // }
      }
    };
    loadResult();
  }, [id]);

  const getRemainingTime = (dateTime) => {
    return Math.floor((dateTime._seconds * 1000 - Date.now()) / 1000);
  };

  const [started, setStarted] = useState(getRemainingTime(startDateTime) <= 0);
  const [completed, setCompleted] = useState(
    getRemainingTime(endDateTime) <= 0,
  );
  const [voteEnd, setVoteEnd] = useState(
    getRemainingTime(voteEndDateTime) <= 0,
  );

  const handleOnCountDownFinished = () => {
    setStarted(getRemainingTime(startDateTime) <= 0);
    setCompleted(getRemainingTime(endDateTime) <= 0);
    setVoteEnd(getRemainingTime(voteEndDateTime) <= 0);
  };

  const handleParticipate = () => {
    if (!user.hasOwnProperty('dob')) {
      Alert.alert(
        'Update profile',
        'To participate in competiton please update your profile',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Canceld'),
          },
          {
            text: 'Ok',
            onPress: () => navigation.navigate('EditProfile'),
          },
        ],
      );
    } else {
      if (getRemainingTime(endDateTime) <= 0) {
        // TODO: Error message
      } else {
        navigation.navigate('Record', {competition});
      }
    }
  };

  const handleUserProfilePressed = async (item) => {
    navigation.navigate('UserProfile', {
      user: {...user, id: item.uid},
      showBack: true,
    });
  };

  const handleOnTabChange = (tabIndex) => {
    setTab(tabIndex);
  };

  const handleEntryAll = () => {
    let comid = competition.id;
    let competitiontitle = competition.title ? competition.title : '';
    navigation.navigate('CompetitionVideoList', {comid, competitiontitle});
  };

  const handleOneEntry = (item) => {
    const filteredindex = entrylist.findIndex((filterItem, index) => {
      if (filterItem.id === item.id) {
        return index;
      }
    });
    navigation.navigate('OneCompetitionVideos', {
      competitionid: competition.id,
      item,
      index: filteredindex,
      videolist: entrylist,
    });
  };
  if (loading) {
    return (
      <Overlay>
        <ActivityIndicator />
      </Overlay>
    );
  }

  const bannerImage = banner
    ? {uri: banner}
    : require('src/../assets/competition-banner.jpg');
  return (
    <SafeAreaView>
      <Header
        headerTitle={competition.title}
        onLeftPress={() => navigation.goBack()}
      />
      <VUView flex={1}>
        <VUScrollView bg={AppStyles.color.bgWhite}>
          <VUView m={0} p={0} bg={AppStyles.color.bgWhite}>
            {entrylist.length >= 1 && (
              <VUView>
                <VUView flexDirection="row" justifyContent="space-between">
                  <VUText
                    fontSize={16}
                    color={AppStyles.color.textBlue}
                    fontWeight="bold"
                    margin={3}></VUText>
                  <VUTouchableOpacity onPress={handleEntryAll}>
                    <VUText
                      fontSize={16}
                      color={AppStyles.color.textBlue}
                      margin={3}>
                      See all
                    </VUText>
                  </VUTouchableOpacity>
                </VUView>
                {showlist ? (
                  <VUView flexDirection="row" justifyContent="space-between">
                    <VUView width="32%" height={200}>
                      {entrylist[0] && (
                        <VUTouchableOpacity
                          onPress={handleOneEntry.bind(this, entrylist[0])}
                          bg={AppStyles.color.black}>
                          <VUImage
                            width="100%"
                            height={200}
                            source={{uri: entrylist[0].thumbnail}}
                          />
                        </VUTouchableOpacity>
                      )}
                    </VUView>
                    <VUView width="32%" height={200}>
                      {entrylist[1] && (
                        <VUTouchableOpacity
                          onPress={handleOneEntry.bind(this, entrylist[1])}
                          bg={AppStyles.color.black}>
                          <VUImage
                            width="100%"
                            height={200}
                            source={{uri: entrylist[1].thumbnail}}
                          />
                        </VUTouchableOpacity>
                      )}
                    </VUView>
                    <VUView width="32%" height={200}>
                      {entrylist[2] && (
                        <VUTouchableOpacity
                          onPress={handleOneEntry.bind(this, entrylist[2])}
                          bg={AppStyles.color.black}>
                          <VUImage
                            width="100%"
                            height={200}
                            source={{uri: entrylist[2].thumbnail}}
                          />
                        </VUTouchableOpacity>
                      )}
                    </VUView>
                  </VUView>
                ) : null}
              </VUView>
            )}

            <VUView flexDirection="row" width="100%" px={10} my={3}>
              <VUTouchableOpacity
                flex={1}
                borderBottomWidth={2}
                borderBottomColor={
                  tab === CompetitionDetailTabs.Participate
                    ? AppStyles.color.textBlue
                    : '#878080'
                }
                pb={2}
                onPress={handleOnTabChange.bind(
                  this,
                  CompetitionDetailTabs.Participate,
                )}>
                <VUText
                  fontSize={16}
                  fontFamily={AppStyles.fontName.robotoBold}
                  textAlign="center"
                  color={
                    tab === CompetitionDetailTabs.Participate
                      ? AppStyles.color.textBlue
                      : '#878080'
                  }>
                  Participate
                </VUText>
              </VUTouchableOpacity>
              <VUTouchableOpacity
                flex={1}
                pb={2}
                borderBottomWidth={2}
                borderBottomColor={
                  tab === CompetitionDetailTabs.Terms
                    ? AppStyles.color.textBlue
                    : '#878080'
                }
                onPress={handleOnTabChange.bind(
                  this,
                  CompetitionDetailTabs.Terms,
                )}>
                <VUText
                  fontSize={16}
                  fontFamily={AppStyles.fontName.robotoBold}
                  textAlign="center"
                  color={
                    tab === CompetitionDetailTabs.Terms
                      ? AppStyles.color.textBlue
                      : '#878080'
                  }>
                  Terms
                </VUText>
              </VUTouchableOpacity>
            </VUView>
            {tab === CompetitionDetailTabs.Participate && (
              <>
                {completed || started ? (
                  <VUView>
                    {started && !completed && (
                      <VUView
                        alignItems="center"
                        bg={AppStyles.color.bgWhite}
                        mx={2}
                        mb={4}>
                        <VUText
                          fontSize={16}
                          fontFamily={AppStyles.fontName.robotoRegular}
                          color={AppStyles.color.textBlue}>
                          Competition Ends in
                        </VUText>
                        <CountDown
                          until={getRemainingTime(endDateTime)}
                          digitStyle={styles.digitStyle}
                          digitTxtStyle={styles.digitTxtStyle}
                          timeLabelStyle={styles.timeLabelStyle}
                          separatorStyle={{
                            color: AppStyles.color.textBlue,
                            fontSize: 30,
                          }}
                          onFinish={handleOnCountDownFinished}
                          size={22}
                          timeToShow={['D', 'H', 'M', 'S']}
                          timeLabels={{m: null, s: null}}
                          showSeparator
                        />
                      </VUView>
                    )}
                    {started && completed && !voteEnd && (
                      <VUView
                        alignItems="center"
                        bg={AppStyles.color.bgWhite}
                        mx={4}
                        p={2}
                        mb={4}>
                        <VUText
                          fontSize={16}
                          fontFamily={AppStyles.fontName.robotoRegular}
                          color={AppStyles.color.textBlue}>
                          Voting Ends in
                        </VUText>
                        <CountDown
                          until={getRemainingTime(voteEndDateTime)}
                          digitStyle={styles.digitStyle}
                          digitTxtStyle={styles.digitTxtStyle}
                          timeLabelStyle={styles.timeLabelStyle}
                          separatorStyle={{
                            color: AppStyles.color.textBlue,
                            fontSize: 30,
                          }}
                          onFinish={handleOnCountDownFinished}
                          size={22}
                          timeToShow={['D', 'H', 'M', 'S']}
                          timeLabels={{m: null, s: null}}
                          showSeparator
                        />
                      </VUView>
                    )}

                    <VUView
                      alignItems="center"
                      mx={4}
                      px={2}
                      bg={AppStyles.color.bgWhite}
                      // borderWidth={1}
                      borderRadius={4}>
                      {results.map(
                        (item, index) =>
                          item.isPublished &&
                          item.playback && (
                            <VUView
                              width="100%"
                              flexDirection="row"
                              flex={1}
                              justifyContent="space-between"
                              alignItems="center"
                              borderBottomColor="#001829"
                              borderBottomWidth={
                                index + 1 < results.length ? 1 : 0
                              }
                              py={2}>
                              <VUTouchableOpacity
                                onPress={handleUserProfilePressed.bind(
                                  this,
                                  item,
                                )}>
                                <VUView
                                  flex={1}
                                  flexDirection="row"
                                  alignItems="center">
                                  {item.user.profile ? (
                                    <VUImage
                                      size={40}
                                      source={{uri: item.user.profile}}
                                      borderRadius={20}
                                    />
                                  ) : (
                                    <IonIcon
                                      name="person-circle-outline"
                                      size={40}
                                      color="#ccc"
                                    />
                                  )}
                                  <VUView ml={10} flexDirection={'column'}>
                                    <VUText
                                      fontFamily={
                                        AppStyles.fontName.robotoMedium
                                      }
                                      color={AppStyles.color.textBlue}
                                      ml={10}>
                                      {item.user.name}
                                    </VUText>
                                    <VUText
                                      fontFamily={
                                        AppStyles.fontName.robotoRegular
                                      }
                                      color={AppStyles.color.grey}
                                      ml={10}>
                                      {item.user.location}
                                    </VUText>
                                  </VUView>
                                </VUView>
                              </VUTouchableOpacity>
                              <VUText
                                fontFamily={AppStyles.fontName.robotoMedium}
                                color={AppStyles.color.textBlue}>
                                {item.votes}
                              </VUText>
                            </VUView>
                          ),
                      )}
                    </VUView>
                  </VUView>
                ) : (
                  <>
                    {!started && (
                      <VUView
                        alignItems="center"
                        bg={AppStyles.color.bgWhite}
                        mx={4}
                        p={2}>
                        <VUText
                          fontSize={16}
                          fontFamily={AppStyles.fontName.robotoRegular}
                          color={AppStyles.color.textBlue}>
                          Competition Starts in
                        </VUText>
                        <CountDown
                          until={getRemainingTime(startDateTime)}
                          digitStyle={styles.digitStyle}
                          digitTxtStyle={styles.digitTxtStyle}
                          timeLabelStyle={styles.timeLabelStyle}
                          separatorStyle={{
                            color: AppStyles.color.textBlue,
                            fontSize: 30,
                          }}
                          onFinish={handleOnCountDownFinished}
                          size={22}
                          timeToShow={['D', 'H', 'M', 'S']}
                          timeLabels={{m: null, s: null}}
                          showSeparator
                        />
                      </VUView>
                    )}
                  </>
                )}

                <Wrapper>
                  {submitted && (
                    <ParticipateNowText>
                      You have already submitted
                    </ParticipateNowText>
                  )}
                </Wrapper>
              </>
            )}

            {tab === CompetitionDetailTabs.Terms && (
              <VUView px={2} py={3}>
                <VUText
                  fontFamily={AppStyles.fontName.robotoRegular}
                  color={AppStyles.color.grey}>
                  {description.replace(/<br\/>/g, '\n')}
                </VUText>
              </VUView>
            )}
          </VUView>
        </VUScrollView>
        <VUView bg={AppStyles.color.bgWhite} alignItems="center" py={2}>
          {!completed && started && !submitted && participate && (
            <>
              {user.dob ? (
                <VUTouchableOpacity
                  onPress={handleParticipate}
                  bg={AppStyles.color.blueBtnColor}
                  px={3}
                  py={2}
                  borderRadius={24}>
                  <VUText color="#fff">Participate</VUText>
                </VUTouchableOpacity>
              ) : (
                <VUView alignItems="center">
                  <VUText color={AppStyles.color.textBlue}>
                    Please Update your profile to submit a video
                  </VUText>
                </VUView>
              )}
            </>
          )}
          {completed && !submitted && (
            <VUView alignItems="center">
              <VUText textAlign="center" color={AppStyles.color.textBlue}>
                Competition completed Vote for your Favorite singer
              </VUText>
            </VUView>
          )}
          {submitted && (
            <VUView alignItems="center">
              <VUText color={AppStyles.color.textBlue}>
                Thanks for participating
              </VUText>
            </VUView>
          )}
        </VUView>
      </VUView>
    </SafeAreaView>
  );
};

export default CompetitionDetails;

const styles = StyleSheet.create({
  timeLabelStyle: {
    color: AppStyles.color.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  digitTxtStyle: {
    color: AppStyles.color.textBlue,
    fontSize: 30,
    fontFamily: AppStyles.fontName.robotoRegular,
  },
  digitStyle: {backgroundColor: 'transparent'},
});
