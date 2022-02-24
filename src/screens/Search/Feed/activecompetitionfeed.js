import React, {useEffect, useState, memo} from 'react';
import {AppStyles} from 'src/AppStyles';
import {useNavigation} from '@react-navigation/native';
import {entryListVideos} from '../../../../src/redux/reducers/actions';
import {VUView, VUText, VUImage, VUTouchableOpacity} from 'common-components';
import {useDispatch} from 'react-redux';
import {algoliaSearchCompetitionVideos} from 'src/services/algolia';
function ActiveCompetitionFeed({item, comid}) {
  const navigation = useNavigation();
  const [competition, setCompetition] = useState(item);
  const [myentrylist, setMyEntryList] = useState([]);
  const dispatch = useDispatch();
  useEffect(async () => {
   
    var videoList = await algoliaSearchCompetitionVideos(comid, '');
    setMyEntryList(videoList);
    // const loadData = async () => {
    //   if (!entrylist.empty) {
    //     const entry = [];
    //     entrylist.forEach((obj) => {
    //       if (obj.competitionId != null) {
    //         if (obj.competitionId.includes(comid)) {
    //           entry.push(obj);
    //         }
    //       }
    //     });
    //     setMyEntryList(entry);
    //   } else {
    //     setMyEntryList([]);
    //   }
    // };
    // loadData();
  }, []);

  const handleEntryAll = () => {
    let competitiontitle = competition.title;
    navigation.navigate('CompetitionVideoList', {comid, competitiontitle});
  };
  const handleOneEntry = item => {
    const filteredindex = myentrylist.findIndex((filterItem, index) => {
      if (filterItem.id === item.id) {
        return index;
      }
    });
  
    dispatch(entryListVideos(myentrylist));
    navigation.navigate('OneCompetitionVideos', {
      competitionid: comid,
      item,
      index: filteredindex,
      videolist: myentrylist,
    });
  };
  return (
    <VUView>
      {myentrylist.length >= 1 && (
        <VUView>
          <VUView flexDirection="row" justifyContent="space-between">
            <VUText
              fontSize={16}
              color={AppStyles.color.textBlue}
              fontWeight="bold"
              margin={3}>
              {competition.title}
            </VUText>
            <VUTouchableOpacity onPress={handleEntryAll}>
              <VUText fontSize={14} color={AppStyles.color.textBlue} margin={3}>
                {' '}
                See all
              </VUText>
            </VUTouchableOpacity>
          </VUView>
          <VUView flexDirection="row" justifyContent="space-between">
            <VUView width="32%" height={200}>
              {myentrylist[0] && (
                <VUTouchableOpacity
                  onPress={handleOneEntry.bind(this, myentrylist[0])}
                  bg={AppStyles.color.black}>
                  <VUImage
                    width="100%"
                    height={200}
                    source={{uri: myentrylist[0].thumbnail}}
                  />
                </VUTouchableOpacity>
              )}
            </VUView>
            <VUView width="32%" height={200}>
              {myentrylist[1] && (
                <VUTouchableOpacity
                  onPress={handleOneEntry.bind(this, myentrylist[1])}
                  bg={AppStyles.color.black}>
                  <VUImage
                    width="100%"
                    height={200}
                    source={{uri: myentrylist[1].thumbnail}}
                  />
                </VUTouchableOpacity>
              )}
            </VUView>
            <VUView width="32%" height={200}>
              {myentrylist[2] && (
                <VUTouchableOpacity
                  onPress={handleOneEntry.bind(this, myentrylist[2])}
                  bg={AppStyles.color.black}>
                  <VUImage
                    width="100%"
                    height={200}
                    source={{uri: myentrylist[2].thumbnail}}
                  />
                </VUTouchableOpacity>
              )}
            </VUView>
          
          </VUView>
        </VUView>
      )}
    </VUView>
  );
}

export default memo(ActiveCompetitionFeed);
