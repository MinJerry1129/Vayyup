import React, {useEffect, useState,useRef} from 'react';
import {AppStyles} from 'src/AppStyles';
import {FlatList, Dimensions,Keyboard,Alert} from 'react-native';
import { CheckBox } from 'react-native-elements'
import {useNavigation } from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import {VUView,VUScrollView,VUText, VUImage, VUTouchableOpacity, ActivityIndicator, SafeAreaView,VUTextInput,Overlay,KeyboardAvoidingView} from 'common-components';
import {IonIcon,MaterialIcon} from 'src/icons';
import {useSelector} from 'react-redux';
import Header from 'common-components/Header'

const SettingGroupChat = ({route, onBack}) => {
    const navigation = useNavigation();
    const actionSheetRef = useRef();
    const user = useSelector(state => state.auth.user);
    const windowHeight = Dimensions.get('window').height;
    const windowWidth = Dimensions.get('window').width;
    const [loading, setLoading] = useState(true);
    const [privatechat, setPrivateChat] = useState(false);
    const [groupname, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [owner, setOwner]= useState("");
    const [showimageurl, setShowImageUrl] = useState("");
    const [groupinfo, setGroupInfo] = useState();
    const [members, setMembers] = useState([]);
    const [userlist, setUserList] = useState([]);
    const {groupid = {}} = route.params;
    useEffect(() => {
        setLoading(true);
        firestore()
        .collection('groupchats')
        .doc(groupid)
        .onSnapshot(snapshot =>{
            if(snapshot){
                setGroupInfo(snapshot._data)
                if(snapshot._data){
                    setShowImageUrl(snapshot._data.profile);
                    setGroupName(snapshot._data.fullname);
                    setDescription(snapshot._data.lastmsg);
                    setMembers(snapshot._data.members)
                    setPrivateChat(snapshot._data.status);
                    setOwner(snapshot._data.owner);
                }                
            }
            
        });        
    }, [groupid, user]);

    useEffect(() => {
        firestore()
        .collection('users')
        .onSnapshot(snapshot =>{
         
            if(snapshot){
                const users = [];
                snapshot.forEach(obj => users.push({...obj.data(), id: obj.id}));
                setUserList([]);
                setUserList(users)
            }else{
                setUserList([]);
            }
            setLoading(false);
        });
    }, []);

    const handleBackPressed = () => {
        dissMissKeyBoard(true, function() {
        setTimeout(() => {
            navigation.goBack();
        }, 125);
        });
    };

    function dissMissKeyBoard(isKeyboardNeedToClose, callback) {
        Keyboard.dismiss();
        callback();
    }
    const onAddGroupMember=()=>{
        navigation.push('AddGroupMember', {groupfield:groupinfo});
    }
    const onEditGroup=()=>{
        navigation.push('EditGroupChat', {groupfield:groupinfo});
    }

    const onDeleteGroup=async()=>{
        Alert.alert(
            'Manage Group',
            'Are you sure you want to Delete Group?',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'Delete', onPress: handleDeleteGroup},
            ],
          );
    }

    const handleDeleteGroup=async()=>{
        const batch = firestore().batch();
        const snapshot = await firestore()
        .collection('groupchats')
        .doc(groupid)
        .collection("chatlist")
        .get();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        const groupRef = firestore()
            .collection('groupchats')
            .doc(groupid);
        batch.delete(groupRef);
        await batch.commit();
        navigation.popToTop(2);
    }

    const onLeaveGroup=()=>{
        Alert.alert(
            'Manage Group',
            'Are you sure you want to Leave Group?',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {text: 'Leave', onPress: handleLeaveGroup},
            ],
        );
    }
    const handleLeaveGroup=async()=>{
        const newMembers = [...members];
        const index = newMembers.indexOf(user.id);
        if(index > -1){
            newMembers.splice(index, 1);
        }else{
            newMembers.push(followerid);
        }

        const batch = firestore().batch();
        const memberRef = firestore()
            .collection("groupchats")
            .doc(groupid);
        batch.update(memberRef, {
            ["members"]: newMembers,
        });
        await batch.commit();
        navigation.popToTop(2);
    }

    const renderFollowItem = ({item}) => (
        <VUView flexDirection="row" justifyContent="space-between" mx={4} mt={"2"}>
            {userlist.find(member =>member.id === item).profile?(
                <VUImage
                    width={35}
                    height={35}
                    source={{ uri: userlist.find(member =>member.id === item).profile}}
                    resizeMode="stretch"
                    borderRadius={100}
                />
            ):(
                <IonIcon name="person-circle-outline" size={35} color="#bbb" />
            )}
            
            <VUView alignSelf="center" mx={3}>
                <VUText color={AppStyles.color.textBlue}>{userlist.find(member =>member.id === item).fullname}</VUText>
            </VUView>            
            <VUView flex={1}/>
        </VUView>          
    );

  return (
    <KeyboardAvoidingView>
      <SafeAreaView>
            <VUView bg={AppStyles.color.bgWhite} flex={1}>
                <Header 
                    headerTitle="Setting"
                    onLeftPress={handleBackPressed}
                />
                <VUView flex={1}>
                    {loading ?
                        <ActivityIndicator animating={loading}/> 
                        :
                        <VUView flex={1} m={'10px'}>
                            <VUView>
                                <VUView alignItems="center">
                                    <VUView>
                                        {showimageurl?
                                            <VUImage
                                                width="100px"
                                                height="100px"
                                                source={{uri: showimageurl}}
                                                resizeMode="cover"
                                                borderRadius={100}
                                            />
                                            :
                                            <IonIcon name="person-circle-outline" size={100} color="#bbb" />
                                        }                                        
                                    </VUView>
                                </VUView>
                            </VUView>
                            <VUView mt={1} mx={3} flexDirection="row" justifyContent="space-between">
                                <VUView/>
                                <VUText color = {AppStyles.color.textBlue} fontSize={15}>{groupname}</VUText>
                                <VUView/>
                            </VUView>
                            <VUView mt={1} mx={3} flexDirection="row" justifyContent="space-between">
                                <VUView/>
                                <VUText color = {AppStyles.color.textBlue} fontSize={15}>{description}</VUText>
                                <VUView/>
                            </VUView>
                            {owner == user.id ?
                                <VUView mt={1}>
                                    <VUView alignItems="center">
                                        <VUTouchableOpacity onPress={onEditGroup}>
                                            <VUView padding={2} bg={AppStyles.color.textBlue} width={120} borderRadius={100} flexDirection="row" justifyContent="space-between">
                                                <VUView/>
                                                <VUText color = {AppStyles.color.white} fontSize={12}>Edit</VUText>
                                                <VUView/>
                                            </VUView>
                                        </VUTouchableOpacity>
                                    </VUView>
                                    <VUView alignItems="center" margin={1}>
                                        <VUTouchableOpacity onPress={onDeleteGroup}>
                                            <VUView padding={2} bg={AppStyles.color.textBlue} width={120} borderRadius={100} flexDirection="row" justifyContent="space-between">
                                                <VUView/>
                                                <VUText color = {AppStyles.color.white} fontSize={12}>Delete Group</VUText>
                                                <VUView/>
                                            </VUView>
                                        </VUTouchableOpacity>
                                    </VUView>
                                </VUView>
                                :
                                <VUView alignItems="center" mt={1}>
                                    <VUTouchableOpacity onPress={onLeaveGroup}>
                                        <VUView padding={2} bg={AppStyles.color.textBlue} width={120} borderRadius={100} flexDirection="row" justifyContent="space-between">
                                            <VUView/>
                                            <VUText color = {AppStyles.color.white} fontSize={12}>Leave Group</VUText>
                                            <VUView/>
                                        </VUView>
                                    </VUTouchableOpacity>
                                </VUView>
                            }
                            
                            <VUView width="100%" height = "1px"  mt={"5px"} bg={AppStyles.color.textBlue}/>
                            <VUView flexDirection="row" mt={"5px"} alignItems={"center"}>
                                <MaterialIcon size={30} name="group" color= {AppStyles.color.textBlue} />
                                <VUText color = {AppStyles.color.textBlue} fontSize={15} mx={2}>Group members</VUText>
                            </VUView>
                            {(owner == user.id || !privatechat) &&
                                <VUTouchableOpacity onPress={onAddGroupMember}>
                                    <VUView flexDirection="row" mt={"5px"} mx={4} alignItems={"center"}>                                
                                        <IonIcon size={40} name="add-circle" color= {AppStyles.color.textBlue} />
                                        <VUText color = {AppStyles.color.textBlue} fontSize={15} mx={2}>Add members</VUText>
                                    </VUView>
                                </VUTouchableOpacity>
                            }
                            <FlatList
                                data={members}
                                renderItem={renderFollowItem}
                                keyExtractor={item => item.id}
                            />
                            <VUView/>
                        </VUView>
                    }
                </VUView>
            </VUView>      
      </SafeAreaView>
    </KeyboardAvoidingView>
    
  );
}

export default SettingGroupChat;