import React, {useEffect, useState, useRef} from 'react';
import {AppStyles} from 'src/AppStyles';
import {FlatList, Dimensions, Keyboard, PermissionsAndroid} from 'react-native';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {
  VUView,
  VUScrollView,
  VUText,
  VUImage,
  VUTouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  VUTextInput,
  Overlay,
  KeyboardAvoidingView,
} from 'common-components';
import {IonIcon} from 'src/icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ArchiveUserList from 'screens/Chat/feed/archiveuserlist';
import {useSelector} from 'react-redux';
import Header from 'common-components/Header';

const ArchiveUsers = ({route, onBack}) => {
  const navigation = useNavigation();
  const routesLength = useNavigationState(state => state.routes.length);
  const windowWidth = Dimensions.get('window').width;
  const [loading, setLoading] = useState(true);
  let [archiveuserlist, setArchiveUserList] = useState([]);
  let [blockinglist, setBlockingList] = useState([]);
  let [blockerlist, setBlockerList] = useState([]);
  let [userlist, setUserList] = useState([]);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    setLoading(true);
    firestore()
      .collection('social')
      .doc(user.id)
      .collection('blocking')
      .orderBy('name')
      .onSnapshot(snapshot => {
        if (snapshot) {
          const list = [];
          snapshot.forEach(obj => list.push({...obj.data(), id: obj.id}));
          const allblocking = [...blockinglist, ...list];
          setBlockingList(allblocking);
          setLoading(false);
        } else {
          setBlockingList([]);
          setLoading(false);
        }
      });

    firestore()
      .collection('social')
      .doc(user.id)
      .collection('blockers')
      .orderBy('name')
      .onSnapshot(snapshot => {
        if (snapshot) {
          const list = [];
          snapshot.forEach(obj => list.push({...obj.data(), id: obj.id}));
          const allblockers = [...blockerlist, ...list];
          setBlockerList(allblockers);
          setLoading(false);
        } else {
          setBlockerList([]);
          setLoading(false);
        }
      });
    firestore()
      .collection('chats')
      .doc(user.id)
      .collection('userlist')
      .orderBy('lastdate', 'desc')
      .onSnapshot(snapshot => {
        setLoading(true);
        if (snapshot) {
          const users = [];
          snapshot.forEach(obj => users.push({...obj.data(), itemid: obj.id}));
          setUserList(users);
        } else {
          setUserList([]);
        }
        setLoading(false);
      });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    let newarchiveUserList = [];
    for (let i = 0; i < userlist.length; i++) {
      if (userlist[i].archive == 'yes') {
        newarchiveUserList.push(userlist[i]);
      }
    }

    let newUserlist = [];
    for (let i = 0; i < newarchiveUserList.length; i++) {
      let exist = blockerlist.filter(function(v) {
        return v.id == newarchiveUserList[i].id;
      });
      if (exist.length == 0) {
        newUserlist.push(newarchiveUserList[i]);
      }
    }
    setArchiveUserList(newUserlist);
  }, [userlist, blockerlist, blockinglist]);

  const archiverenderItem = ({item, index}) => (
    <ArchiveUserList
      key={item.itemid}
      item={item}
      index={index}
      userid={user.id}
    />
  );

  const handleBackPressed = () => {
    if (routesLength === 1) {
      navigation.navigate('VayyUp');
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView>
      <VUView
        bg={AppStyles.color.bgWhite}
        flex={1}
        justifyContent="space-between">
        <Header headerTitle={'Archived'} onLeftPress={handleBackPressed} />
        <VUView flex={1}>
          {loading ? (
            <ActivityIndicator animating={loading} />
          ) : (
            <FlatList
              data={archiveuserlist}
              renderItem={archiverenderItem}
              keyExtractor={item => item.id}
            />
          )}
        </VUView>
      </VUView>
    </SafeAreaView>
  );
};

export default ArchiveUsers;
