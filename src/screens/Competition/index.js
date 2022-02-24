import React, {useState, useEffect} from 'react';
import {Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {useIsFocused} from '@react-navigation/native';
import {
  VUView,
  VUText,
  VUScrollView,
  SafeAreaView,
  VUImage,
  VUTouchableOpacity,
} from 'common-components';
import {CollectionName} from 'models/Competition';
import Overlay from '../../common-components/Overlay';
import ActivityIndicator from '../../common-components/ActivityIndicator';

import {AppStyles, globalStyles} from 'src/AppStyles';
import LinearGradient from 'react-native-linear-gradient';

const Competition = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [competitions, setCompetitions] = useState([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      // StatusBar.setHidden(false);
    }
  }, [isFocused]);

  useEffect(async () => {
    firestore()
      .collection(CollectionName)
      .where('isVisible', '==', true)
      // .orderBy('index', 'desc')
      .get()
      .then(async (snapshot) => {
        if (snapshot.empty) {
          setCompetitions([]);
        } else {
          const list = [];
          snapshot.forEach((obj) => list.push({...obj.data(), id: obj.id}));
          setCompetitions(list);
        }
        setLoading(false);
      });
  }, []);

  const handleCompetitionPressed = (competition) => {
    navigation.navigate('CompetitionDetails', {competition});
  };

  const handleVideoPressed = (competition) => {
    navigation.navigate('CompetitionVideos', {competition});
  };

  if (loading) {
    return (
      <Overlay>
        <ActivityIndicator />
      </Overlay>
    );
  }

  return (
    <SafeAreaView bg={AppStyles.color.bgWhite}>
      <VUScrollView>
        <VUView flex={1} bg={AppStyles.color.bgWhite} pb={50}>
          <LinearGradient colors={['#fff', '#fff', '#F84030']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} >
            <VUView
              alignItems="center"
              py={3}
            >
              <VUText mt={2} fontSize={16} fontFamily={AppStyles.fontName.robotoBold} color={AppStyles.color.grayText}>
                Competitions
              </VUText>
            </VUView>
          </LinearGradient>

          {competitions.length === 0 && <Text>No Competitions</Text>}
          {competitions.length > 0 &&
            competitions.map((competition) => (
              <VUView key={competition.id} width="100%" p={3}>
                <VUView>
                  <VUView flexDirection="row">
                    <VUView>
                      <VUView
                        width="75px"
                        height="80px"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center">
                        <VUImage
                          position="absolute"
                          top={0}
                          width="75px"
                          height="80px"
                          borderRadius={4}
                          source={{uri: competition.banner}}
                          resizeMode="cover"
                        />
                      </VUView>
                    </VUView>
                    <VUView
                      flex={1}
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mx={2}>
                      <VUView width="85%">
                        <VUText fontSize={14} fontFamily={AppStyles.fontName.robotoBold} color={AppStyles.color.white} mb={1}>
                          {competition.title}
                        </VUText>
                        <VUTouchableOpacity onPress={handleCompetitionPressed.bind(
                          this,
                          competition,
                        )} bg={AppStyles.color.btnColor} width='40%' height={25} borderRadius={24} justifyContent='center' alignItems='center'>
                          <VUText fontSize={12} fontFamily={AppStyles.fontName.robotoRegular} textAlign='center' color={AppStyles.color.grayText}>Participate</VUText>
                        </VUTouchableOpacity>
                      </VUView>
                      <VUTouchableOpacity  onPress={handleVideoPressed.bind(this, competition)}  justifyContent='center' alignItems='center'>
                        <VUText fontSize={12} fontFamily={AppStyles.fontName.robotoRegular} style={{textDecorationLine:'underline'}} textAlign='center' color={AppStyles.color.btnColor}>See All</VUText>
                      </VUTouchableOpacity>
                    </VUView>
                  </VUView>
                </VUView>
              </VUView>
            ))}
        </VUView>
      </VUScrollView>
    </SafeAreaView>
  );
};

export default Competition;
