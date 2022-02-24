import styled from 'styled-components/native';
import { StyleSheet , Dimensions } from 'react-native';
import { AppStyles } from 'src/AppStyles';

export const Header = styled.View`
  padding: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-bottom-width: 0.5px;
  border-bottom-color: #dadada;
`;

export const Title = styled.Text`
  font-size: 18px;
 
`;

export const Content = styled.View`
  padding: 10px;
  align-items: center;
`;

export const AvatarContainer = styled.View`
  width: 80px;
  height: 80px;
  overflow: hidden;
  border: 1px solid #999;
  border-radius: 70px;
  background: #fff;
`;

export const Avatar = styled.Image.attrs(() => ({
  resizeMode: 'contain',
}))`
  align-self: center;
  width: 80px;
  height: 80px;
  border-radius: 70px;
`;

export const Username = styled.Text`
  font-size: 18px;
  padding: 10px;
`;

export const Stats = styled.View`
  flex-direction: row;
  padding: 10px;
  align-items: center;
`;

export const StatsColumn = styled.View`
  align-items: center;
`;

export const StatsNumber = styled.Text`
  font-size: 18px;
  padding: 10px;
  font-weight: bold;
`;

export const Separator = styled.Text`
  color: #000;
  font-size: 20px;
  opacity: 0.1;
  padding: 0 10px;
`;

export const StatsText = styled.Text`
  font-size: 12px;
  color: #8f8f91;
`;

export const ProfileColumn = styled.View`
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  padding: 10px;
`;

export const ProfileText = styled.Text`
  font-weight: bold;
`;

export const ProfileEdit = styled.TouchableOpacity.attrs({
  activityOpacity: 1,
})`
  border-width: 1.5px;
  padding: 10px 30px;
  border-color: #e6e6e6;
  border-radius: 2px;
  font-size: 12px;
`;

export const newProfile = StyleSheet.create({
  bannerImg : {
    width: '100%',
    height: Dimensions.get('screen').height * 0.25,
    alignItems: 'flex-end',
  },
  addIcon : {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppStyles.color.white,
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  settingsIcon : {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 10
  },
  settingsIconBar : {
    width: 20,
    height: 6,
    backgroundColor: AppStyles.color.white,
    elevation : 3,
    shadowColor : '#000',
    shadowOffset : {width: 1, height :1},
    shadowOpacity : 0.3,
    shadowRadius : 3
  },
  currentUserRow : {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'flex-end',
    marginTop: -25,
    alignSelf: 'center',
  },
  userImg : {
    width: Dimensions.get('screen').width * 0.25,
    height: Dimensions.get('screen').width * 0.25,
    borderRadius: 5,
    borderColor: AppStyles.color.white,
    borderWidth: 5,
    backgroundColor: AppStyles.color.white,
  },
  editBtn : {
    backgroundColor: AppStyles.color.blueBtnColor,
    borderRadius: 3,
    width: Dimensions.get('screen').width * 0.25,
    alignItems: 'center',
    justifyContent:'center',
    height: 40,
  },
  editText : {
    fontFamily: AppStyles.fontName.robotoMedium,
    fontSize: 14,
    color: AppStyles.color.white,
  },
  notificationBtn :{
    backgroundColor: AppStyles.color.blueBtnColor,
    borderRadius: 3,
    width: 40,
    alignItems: 'center',
    height: 40,
    justifyContent:'center',
    marginLeft : 5
  },
  otherUserView : {
    width: Dimensions.get('screen').width * 0.55,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginLeft: Dimensions.get('screen').width * 0.1
  },
  otherUserFollowBtn : {
    backgroundColor: AppStyles.color.blueBtnColor,
    borderRadius: 3,
    width: Dimensions.get('screen').width * 0.30,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center'
  },
  iconBtn : {
    backgroundColor: AppStyles.color.blueBtnColor,
    borderRadius: 3,
    width: 40,
    alignItems: 'center',
    height: 40,
    justifyContent: 'center'
  },
  countsView : {
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20
  },
  otherUserCountsView : {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20
  },
  otherUserCountsInnerView : {
    flexDirection : 'row',
    justifyContent:'space-between',
    width : Dimensions.get('screen').width * 0.55,
    marginLeft : Dimensions.get('screen').width * 0.05
  },
  imageLoader : {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height * 0.25,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  }
})

export const settingsStyles = StyleSheet.create({
  itemView : {
    flexDirection: 'row',
    width: '95%',
    height: 60,
    alignItems: 'center',
    alignSelf: 'center',
    borderBottomWidth: 0.2,
    borderBottomColor: AppStyles.color.grey
  },
  leftIconView : {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconSize : {
    width: 20,
    height: 20
  },
  text : {
    fontFamily: AppStyles.fontName.robotoMedium,
    fontSize: 16,
    width: '80%'
  }
})