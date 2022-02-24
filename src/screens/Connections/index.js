import React, {useState, useEffect} from 'react';
import {FlatList} from 'react-native';
import {
  VUView,
  VUText,
  SafeAreaView,
  VUImage,
  VUTouchableOpacity,
  Overlay,
  ActivityIndicator,
} from 'common-components';
import {getFollowers, getFollowing} from 'src/services/social';
import {useNavigation} from '@react-navigation/core';
import {IonIcon} from 'src/icons';
import {AppStyles} from 'src/AppStyles';
import Header from '../../common-components/Header';

export const ConnectionTab = {
  Following: 0,
  Followers: 1,
};
const Connections = ({route}) => {
  const {params = {}} = route;
  const {user = {}} = params;
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(params.tabName);
  const [profileFollowers, setProfileFollowers] = useState([]);
  const [profileFollowing, setProfileFollowing] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setTab(params.tabName);
      setProfileFollowers(await getFollowers(user.id));
      setProfileFollowing(await getFollowing(user.id));

      setLoading(false);
    };
    loadData();
  }, [user.id]);

  const handleOnTabChanged = (tabIndex) => {
    setTab(tabIndex);
  };

  const handleUserProfilePressed = (connectedUser) => {
    navigation.push('UserProfile', {
      user: connectedUser,
      showBack: true,
    });
  };

  if (loading) {
    return (
      <VUView flex={1} bg={AppStyles.color.bgWhite}>
        <Overlay>
          <ActivityIndicator animating={loading} />
        </Overlay>
      </VUView>
    );
  }

  const renderItem = ({item: userFollower}) => (
    <VUTouchableOpacity
      onPress={handleUserProfilePressed.bind(this, userFollower)}>
      <VUView
        key={`followers-${userFollower.id}`}
        flexDirection="row"
        py={2}
        px={2}>
        <VUView>
          {userFollower.profile ? (
            <VUView m={'5px'}>
              <VUImage
                width="65px"
                height="65px"
                source={{uri: userFollower.profile}}
                resizeMode="cover"
                borderRadius={40}
              />
            </VUView>
          ) : (
            <IonIcon name="person-circle-outline" size={75} color="#bbb" />
          )}
        </VUView>
        <VUView
          flex={1}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          my={3}
          mx={2}>
          <VUView>
            {userFollower.hasOwnProperty('username') &&
              userFollower.username != '' && (
                <VUText
                  fontSize={12}
                  fontFamily={AppStyles.fontName.robotoMedium}
                  color={AppStyles.color.textBlue}
                  mb={1}>
                  @{userFollower.username}
                </VUText>
              )}

            <VUText
              fontSize={12}
              fontFamily={AppStyles.fontName.robotoRegular}
              color={AppStyles.color.textBlue}
              mb={1}>
              {userFollower.name}
            </VUText>
          </VUView>
        </VUView>
      </VUView>
    </VUTouchableOpacity>
  );

  return (
    <SafeAreaView>
      <VUView flex={1} bg={AppStyles.color.bgWhite}>
        <Header 
             headerTitle={'Connections'}
             onLeftPress={() => navigation.goBack()}
        />
        <VUView
          alignItems="center"
          flexDirection="row"
          justifyContent="space-around"
          p={2}>
          <VUTouchableOpacity
            width="50%"
            alignItems="center"
            pb={1}
            borderBottomWidth={1}
            borderBottomColor={
              tab === ConnectionTab.Following
                ? AppStyles.color.textBlue
                : '#878080'
            }
            onPress={handleOnTabChanged.bind(this, ConnectionTab.Following)}>
            <VUText
              mt={2}
              fontSize={16}
              fontFamily={
                tab === ConnectionTab.Following
                  ? AppStyles.fontName.robotoMedium
                  : AppStyles.fontName.robotoRegular
              }
              color={
                tab === ConnectionTab.Following
                  ? AppStyles.color.textBlue
                  : '#878080'
              }>
              Following
            </VUText>
          </VUTouchableOpacity>
          <VUTouchableOpacity
            width="50%"
            alignItems="center"
            pb={1}
            borderBottomWidth={1}
            borderBottomColor={
              tab === ConnectionTab.Followers
                ? AppStyles.color.textBlue
                : '#878080'
            }
            onPress={handleOnTabChanged.bind(this, ConnectionTab.Followers)}>
            <VUText
              mt={2}
              fontSize={16}
              fontFamily={
                tab === ConnectionTab.Followers
                  ? AppStyles.fontName.robotoMedium
                  : AppStyles.fontName.robotoRegular
              }
              color={
                tab === ConnectionTab.Followers
                  ? AppStyles.color.textBlue
                  : '#878080'
              }>
              Followers
            </VUText>
          </VUTouchableOpacity>
        </VUView>
        {tab === ConnectionTab.Following && (
          <>
            {profileFollowing.length === 0 && (
              <VUView alignItems="center" mt={5}>
                <VUText color={AppStyles.color.grey}>
                  Not following anyone
                </VUText>
              </VUView>
            )}
            {profileFollowing.length > 0 && (
              <FlatList
                data={profileFollowing}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            )}
          </>
        )}
        {tab === ConnectionTab.Followers && (
          <>
            {profileFollowers.length === 0 && (
              <VUView alignItems="center" mt={5}>
                <VUText color={AppStyles.color.grey}>No followers</VUText>
              </VUView>
            )}
            {profileFollowers.length > 0 && (
              <FlatList
                data={profileFollowers}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
              />
            )}
          </>
        )}
      </VUView>
    </SafeAreaView>
  );
};

export default Connections;
