import React, { useEffect, useState } from 'react';
import { AppStyles } from 'src/AppStyles';
import { FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import {VUView,VUScrollView,VUText, VUImage, VUTouchableOpacity, ActivityIndicator, SafeAreaView,VUTextInput,Overlay} from 'common-components';
import {IonIcon,AntDesignIcon} from 'src/icons';
import ChatUserListFeed from 'screens/Chat/feed/chatuserlistfeed';
import ChatUserList from 'screens/Chat/feed/chatuserlist';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Chat = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state.auth.user);
  let [searchStatus, setSearchStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  
  let [searchStr, setSearchStr] = useState("");  
  let [alluserlist, setAllUserList] = useState([]);
  let [userlist, setUserList] = useState([]);
  let [chatuserlist, setChatUserList] = useState([]);
  let [singlechatuserlist, setSingleChatUserList] = useState([]);
  let [groupchatuserlist, setGroupChatUserList] = useState([]);
  let [allgroupchatuserlist, setAllGroupChatUserList] = useState([]);
  let [blockinglist, setBlockingList] = useState([]);
  let [blockerlist, setBlockerList] = useState([]);
  let [searchResultList, setSearchResultList] = useState();
  const windowWidth = Dimensions.get('window').width;
  const insets = useSafeAreaInsets();
  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      await firestore()
      .collection('users')
      .onSnapshot(snapshot =>{
        setLoading(true);        
        if(snapshot){
          const users = [];
          snapshot.forEach(obj => users.push({...obj.data(), id: obj.id}));
          setAllUserList([]);
          setAllUserList(users)
        }else{
          setAllUserList([]);
        }
        setLoading(false);
      });

      await firestore()
      .collection('groupchats')
      .where('status','==',false)
      .onSnapshot(snapshot =>{
        setLoading(true);
        if(snapshot){
          const users = [];
          snapshot.forEach(obj => users.push({...obj.data(), itemid: obj.id}));
          const allusers=[...allgroupchatuserlist, ...users]
          setAllGroupChatUserList(allusers)
        }else{
          setAllGroupChatUserList([]);
        }
        setLoading(false);
      });

      firestore()
        .collection("social")
        .doc(user.id)
        .collection("blocking")
        .orderBy('name')
        .onSnapshot(snapshot => {
            if (snapshot) {
              const list = [];
              snapshot.forEach(obj => list.push({...obj.data(), id: obj.id}));
              const allblocking = [...blockinglist, ...list];
              setBlockingList(allblocking);
              setLoading(false);
            }else{
              setBlockingList([]);
              setLoading(false);
            }
        });
      
      firestore()
        .collection("social")
        .doc(user.id)
        .collection("blockers")
        .orderBy('name')
        .onSnapshot(snapshot => {
            if (snapshot) {
              const list = [];
              snapshot.forEach(obj => list.push({...obj.data(), id: obj.id}));
              const allblockers = [...blockerlist, ...list];
              setBlockerList(allblockers);
              setLoading(false);
            }else{
              setBlockerList([]);
              setLoading(false);
            }
        });

      await firestore()
      .collection('chats')
      .doc(user.id)
      .collection("userlist")
      .orderBy('lastdate','desc')
      .onSnapshot(snapshot =>{
        setLoading(true);
        if(snapshot){
          const users = [];
          snapshot.forEach(obj => users.push({...obj.data(), itemid: obj.id}));
          // const allusers=[...singlechatuserlist, ...users]
          setSingleChatUserList(users)          
        }else{
          setSingleChatUserList([]);
        }        
        setLoading(false);
      });
      await firestore()
      .collection('groupchats')
      .where('members','array-contains',user.id)      
      .onSnapshot(snapshot =>{
        setLoading(true);
        if(snapshot){
          const users = [];
          snapshot.forEach(obj => users.push({...obj.data(), itemid: obj.id}));
          const allusers=[...groupchatuserlist, ...users]
          setGroupChatUserList(allusers)
        }else{
          setGroupChatUserList([]);
        }
        setLoading(false);
      });
    };
    loadData();
  }, [user]);

  useEffect(()=>{
    sortChatlist();
  },[singlechatuserlist,groupchatuserlist, blockerlist, blockinglist])

  useEffect(()=>{
    let newblockingUserlist = [];
    for (let i = 0; i < alluserlist.length; i++) {
      let exist = blockinglist.filter(function (v) {
        return v.id == alluserlist[i].id;
      });
      if (exist.length == 0) {
        newblockingUserlist.push(alluserlist[i]);
      }
    }

    let newUserlist = [];
    for (let i = 0; i < newblockingUserlist.length; i++) {
      let exist = blockerlist.filter(function (v) {
        return v.id == newblockingUserlist[i].id;
      });
      if (exist.length == 0) {
        newUserlist.push(newblockingUserlist[i]);
      }
    }

    const user_list = [...newUserlist, ...allgroupchatuserlist];
    setUserList(user_list);
  },[allgroupchatuserlist,alluserlist, blockerlist, blockinglist])



  const sortChatlist = () =>{
    let newblockingUserlist = [];
    let archiveUserList = [];
    for (let i = 0; i < singlechatuserlist.length; i++) {
      let exist = blockinglist.filter(function (v) {
        return v.id == singlechatuserlist[i].id;
      });
      if (exist.length == 0) {
        newblockingUserlist.push(singlechatuserlist[i]);
      }
    }

    let newblockerUserlist = [];
    for (let i = 0; i < newblockingUserlist.length; i++) {
      let exist = blockerlist.filter(function (v) {
        return v.id == newblockingUserlist[i].id;
      });
      if (exist.length == 0) {
        newblockerUserlist.push(newblockingUserlist[i]);
      }
    }

    let newUserlist = [];
    for (let i = 0; i < newblockerUserlist.length; i++) {
      if(newblockerUserlist[i].archive){
        if(newblockerUserlist[i].archive == "yes"){
          archiveUserList.push(newblockerUserlist[i]);
        }else{
          newUserlist.push(newblockerUserlist[i]);
        }
      }else{
        newUserlist.push(newblockerUserlist[i]);
      }
    }

    let archivelist = {
      "archive": "no", 
      "fullname": "Archived", 
      "id": "archivelistrsUBYUy8KVdF9Pahj6442eeD05I2",
      "itemid": "archivelistrsUBYUy8KVdF9Pahj6442eeD05I2",
      "lastmsg": archiveUserList.length,
      "profile": "", 
      "status": "yes", 
      "type": "archive"
    }

    const chatuser_list = [...newUserlist, ...groupchatuserlist];
    chatuser_list.sort((list1, list2)=>{
      return compareObjects(list1, list2);
    })
    if(archiveUserList.length > 0 ){
      chatuser_list.push(archivelist);
    }
    setChatUserList(chatuser_list);
  }

  const compareObjects = (object1, object2) => {
    if(object1.lastdate && object2.lastdate){
      const obj1 = object1.lastdate.seconds
      const obj2 = object2.lastdate.seconds
    
      if (obj1 > obj2) {
        return -1
      }
      if (obj1 < obj2) {
        return 1
      }
    }
    return 0
  }

  const onCloseSearch = () =>{
   
    setSearchStr("");
    setSearchStatus(false)
  }

  const handleCreateGroupChat = () => {
    navigation.push('CreateGroupChat', {});
};

  const onChangeText = async (text) => {
    setSearchStr(text);
    if (text == '') {
      setSearchStatus(false);
    } else {
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
    }
  };

  const userrenderItem = ({ item, index }) => (
    <ChatUserListFeed
      key={item.id}
      item={item}
      index={index}
    />
  );

  const chatrenderItem = ({ item, index }) => (
    <ChatUserList
      key={item.itemid}
      item={item}
      userid={user.id}
      index={index}
    />
  );

  return (
    <SafeAreaView>
      <VUView bg={AppStyles.color.bgWhite} pt={insets.top} flex={1} justifyContent="space-between">
        <VUView margin={15} flexDirection="row" justifyContent="space-between">
          <VUView width={5} height="100%" />
          <VUView flex={1} flexDirection="row" justifyContent="space-between" bg={AppStyles.color.grayText} pl={10} pr={10} borderRadius={10}>
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
              onChangeText={text => onChangeText(text)}
              value={searchStr}
              color={AppStyles.color.black}
            />
            {searchStatus &&
              <IonIcon name="close-circle-outline" onPress={onCloseSearch} size={24} color={AppStyles.color.grey} />}
          </VUView>
          <VUView pl={3} justifyContent="space-between">
            <VUView/>
            {/* <AntDesignIcon name="addusergroup" onPress={handleCreateGroupChat} size={30} color={AppStyles.color.grey}/>               */}
            <VUView/>
          </VUView>
        </VUView>
        <VUView width="100%" height="1px" bg={AppStyles.color.textBlue} />
        {searchStatus ?
          (
            <FlatList
              data={searchResultList}
              renderItem={userrenderItem}
              keyExtractor={item => item.id} />
          ) : (
            <VUView flex={1}>
              {loading ?
                <ActivityIndicator animating={loading} />
                :
                <FlatList
                  data={chatuserlist}
                  renderItem={chatrenderItem}
                  keyExtractor={item => item.itemid}/>
              }
            </VUView>
          )
        }
      </VUView>
    </SafeAreaView>
  );
};

export default Chat;
