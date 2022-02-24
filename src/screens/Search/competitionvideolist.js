import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppStyles } from 'src/AppStyles';

import { IonIcon } from 'src/icons';
import {
  SafeAreaView,
  VUView,
  VUText,
  VUTouchableOpacity,
  VUImage,
  ActivityIndicator,
} from 'common-components';
import { searchFeeds, entryListVideos } from 'src/redux/reducers/actions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../common-components/Header';

const CompetitionVideoList = ({ route, onBack }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const { comid = {}, competitiontitle = {} } = route.params;
  const entrylist = useSelector((state) =>
    state.feeds.hasOwnProperty('feeds') ? state.feeds.feeds : [],
  );
  useEffect(() => {
    dispatch(entryListVideos(entrylist))
  }, [entrylist])

  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  // let [entrylist, setEntryList] = useState([]);

  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      await dispatch(searchFeeds(comid, ''));
      setLoading(false);

    };
    loadData();
  }, [comid]);



  const handleOneEntry = (item) => {
    const filteredindex = entrylist.findIndex((filterItem, index) => {
      if (filterItem.id === item.id) {
        return index;
      }
    });

    navigation.navigate('OneCompetitionVideos', {
      competitionid: comid,
      item,
      index: filteredindex,
      videolist: entrylist,
    });
  };

  const renderItem = ({ item }) => (
    <VUTouchableOpacity
      flexWrap="wrap"
      width="33%"
      height={150}
      margin={1}
      bg={AppStyles.color.black}
      onPress={handleOneEntry.bind(this, item)}>
      <VUImage width="100%" height="100%" source={{ uri: item.thumbnail }} />
    </VUTouchableOpacity>
  );

  const handleBackPressed = () => {
    navigation.goBack();
  };
  return (
    <SafeAreaView flex={1} bg={AppStyles.color.bgWhite}>
      <VUView flex={1} pt={insets.top}>
        {/* <VUView
          width="100%"
          p={3}
          flexDirection="row"
          justifyContent="space-between">
          <VUView width={40}>
            <VUTouchableOpacity onPress={handleBackPressed}>
              <IonIcon name="arrow-back-outline" size={24} color="#FFF" />
            </VUTouchableOpacity>
          </VUView>
          <VUView alignSelf="center">
            <VUText
              fontSize={16}
              fontFamily={AppStyles.fontName.poppinsBold}
              color={AppStyles.color.white}>
              {competitiontitle}
            </VUText>
          </VUView>
          <VUView width={40} />
        </VUView>
        <VUView width="100%" height="1px" bg={AppStyles.color.white} /> */}
        <Header
          headerTitle={competitiontitle != undefined ? competitiontitle : ''}
          onLeftPress={handleBackPressed}
        />
        {loading ? (
          <VUView>
            <ActivityIndicator animating={loading} />
          </VUView>
        ) : (
            <VUView flex={1} mb={10}>
              {entrylist.length === 0 && (
                <VUView alignItems="center" mt={5}>
                  <VUText color={AppStyles.color.grayText}>No Videos yet</VUText>
                </VUView>
              )}
              {entrylist.length > 0 && (
                <FlatList
                  data={entrylist}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                />
              )}
            </VUView>
          )}
      </VUView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#f9c2ff',
  },
  title: {
    fontSize: 32,
  },
});

export default CompetitionVideoList;
