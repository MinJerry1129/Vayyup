import React, {useEffect, useState,useRef} from 'react';
import {AppStyles} from 'src/AppStyles';
import {FlatList, Dimensions,Keyboard,StyleSheet} from 'react-native';
import { CheckBox } from 'react-native-elements'
import {useNavigation } from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import {VUView,VUScrollView,VUText, VUImage, VUTouchableOpacity, ActivityIndicator, SafeAreaView,VUTextInput,Overlay,KeyboardAvoidingView} from 'common-components';
import {IonIcon} from 'src/icons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ChatItem from 'screens/Chat/feed/chatitem';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';
import {useSelector} from 'react-redux';
import ActionSheet from 'react-native-actions-sheet';
import * as Progress from 'react-native-progress';
import { ScrollView } from 'react-native-gesture-handler';
import Toast from 'react-native-simple-toast';

const AddGroupMember = ({route, onBack}) => {
    const navigation = useNavigation();
    const actionSheetRef = useRef();
    const user = useSelector(state => state.auth.user);
    const windowHeight = Dimensions.get('window').height;
    const windowWidth = Dimensions.get('window').width;
    const [loading, setLoading] = useState(true);
    const [followers, setFollowers] = useState([]);
    const [members, setMemebers] = useState([]);
    const {groupfield = {}} = route.params;
    useEffect(() => {
        setLoading(true);
        firestore()
        .collection("social")
        .doc(user.id)
        .collection("followers")
        .orderBy('name')
        .onSnapshot(snapshot => {
            if (snapshot) {
                const list = [];
                snapshot.forEach(obj => list.push({...obj.data(), id: obj.id}));
                const allfollowers = [...followers, ...list];
                setFollowers(allfollowers);
                setLoading(false);
            }else{
                setFollowers([]);
                setLoading(false);
            }
        });
    }, [user]);

    useEffect(() => {
        setMemebers(groupfield.members)
    }, [groupfield]);

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

    const onMember=(followerid)=>{
        
        const newMembers = [...members];
        const index = newMembers.indexOf(followerid);
        if(index > -1){
            newMembers.splice(index, 1);
        }else{
            newMembers.push(followerid);
        }
        setMemebers(newMembers);
    }

    const setMembers=async()=>{
        const batch = firestore().batch();
        const smsgRef = firestore()
            .collection("groupchats")
            .doc(groupfield.id);            
        batch.update(smsgRef, {
            ["members"]: members,
        });
        await batch.commit();
        Toast.show('Successfully Set Members.', Toast.LONG);
        setTimeout(() => {
            navigation.popToTop(2);
        }, 1000);
    }

    const renderFollowItem = ({ item }) => (
        <VUTouchableOpacity onPress={onMember.bind(this,item.id)}>
          <VUView flexDirection="row" justifyContent="space-between" padding={2}>
            <CheckBox
                checkedColor={AppStyles.color.textBlue}
                uncheckedColor={AppStyles.color.textBlue}
                checked={members.includes(item.id)}
                containerStyle={{borderWidth:0}}
                textStyle={{color:"#fff"}}
                onPress={onMember.bind(this,item.id)}
            />
            <VUView alignSelf="center">
                {item.profile ?(
                    <VUImage
                        width={40}
                        height={40}
                        source={{ uri: item.profile }}
                        resizeMode="stretch"
                        borderRadius={100}
                    />)
                    :(
                        <IonIcon name="person-circle-outline" size={40} color="#bbb" />
                    )
                }
            </VUView>
            
            <VUView alignSelf="center" mx={2}>
                <VUText color={AppStyles.color.textBlue}>{item.name}</VUText>
            </VUView>            
            <VUView flex={1}/>
          </VUView>
        </VUTouchableOpacity>
    );


  return (
    <KeyboardAvoidingView>
        <SafeAreaView>
            <VUView bg={AppStyles.color.bgWhite} flex={1}>
                <VUView style={styles.container}>
                    <VUView width={40}>
                        <VUTouchableOpacity onPress={handleBackPressed}>
                            <IonIcon name="chevron-back" size={25} color={AppStyles.color.textBlue} />
                        </VUTouchableOpacity>
                    </VUView>
                    <VUView flex={1}/>
                    <VUText color={AppStyles.color.textBlue} style={styles.title}>
                        Add Group Members
                    </VUText>
                    <VUView flex={1}/>
                    <VUTouchableOpacity onPress={setMembers}>
                        <VUView alignSelf="center" mx={2}>
                            <VUText
                                fontSize={18}
                                fontFamily={AppStyles.fontName.poppinsBold}
                                color={AppStyles.color.textBlue}>
                                Done
                            </VUText>
                        </VUView>
                    </VUTouchableOpacity>
                    
                </VUView>
                <VUView width="100%" height = "1px" bg={AppStyles.color.white}/>
                <VUView flex={1}>
                    {loading ?
                        <ActivityIndicator animating={loading}/> 
                        :
                        <VUView flex={1} justifyContent="space-between">                            
                            <FlatList
                                data={followers}
                                renderItem={renderFollowItem}
                                keyExtractor={item => item.id}
                            />
                        </VUView>
                    }
                </VUView>
            </VUView>       
        </SafeAreaView>
    </KeyboardAvoidingView>
    
  );
}
const styles = StyleSheet.create({
    container : {
        backgroundColor: AppStyles.color.white,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        elevation : 5,
        shadowOffset : {
            width : 1, height : 1
        },
        shadowColor : AppStyles.color.black,
        shadowOpacity : 0.2,
        shadowRadius : 3,
        borderBottomWidth : 0.5,
        borderBottomColor : AppStyles.color.grayText
    },
    title : {
        fontFamily : AppStyles.fontName.robotoMedium,
        fontSize : 18,
        marginVertical : 15,
        textAlign : 'center',
        textTransform : 'capitalize'
    },
})

export default AddGroupMember;