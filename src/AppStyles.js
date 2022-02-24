import {Dimensions, StyleSheet, Platform} from 'react-native';

export const AppStyles = {
  color: {
    background: '#eee',
    primaryBackground: '#fff',
    secondary: '#e8505b',
    primary: '#193C4F',
    errorText: '#ff5a66',
    main: '#5ea23a',
    text: '#000',
    title: '#464646',
    subtitle: '#545454',
    categoryTitle: '#161616',
    //tint: '#ff5a66',
    tint: '#193C4F',
    description: '#bbbbbb',
    filterTitle: '#8a8a8a',
    starRating: '#2bdf85',
    location: '#a9a9a9',
    white: 'white',
    black: 'black',
    facebook: 'rgb(54, 88, 153)',
    grey: 'grey',
    greenBlue: '#00aea8',
    placeholder: '#a0a0a0',
    // background: '#f2f2f2',
    blue: '#3293fe',
    bgColor:'#0C0B54',
    searchbgColor:'rgba(54, 88, 153,0.3)',
    btnColor:'#EB4F58',
    grayText:'#E5E5E5',
    TextInPutBgColor:'#EBEDEF',
    bgWhite : '#FFFFFF',
    textBlue : '#000',
    blueBtnColor : '#4910BC'
  },
  fontSize: {
    title: 30,
    content: 20,
    normal: 16,
  },
  buttonWidth: {
    main: '70%',
  },
  textInputWidth: {
    main: '80%',
  },
  fontName: {
    main: 'Noto Sans',
    bold: 'Noto Sans',
    poppins:'Poppins-Regular',
    poppinsBold:'Poppins-Bold',
    poppinsSemiBold:'Poppins-SemiBold',
    robotoRegular : 'Roboto-Regular',
    robotoBold : 'Roboto-Bold',
    robotoMedium : 'Roboto-Medium'
  },
  borderRadius: {
    main: 8,
    small: 3,
  },
};

export const AppIcon = {
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    marginRight: 10,
  },
  style: {
    tintColor: AppStyles.color.tint,
    width: 25,
    height: 25,
  },
  images: {
    logo: require('../assets/logo.png'),
    logo2: require('../assets/logo-2.png'),
    logo3: require('../assets/logo-3.png'),
    home: require('../assets/icons/home.png'),
    defaultUser: require('../assets/icons/default_user.jpg'),
    logout: require('../assets/icons/shutdown.png'),
  },
};

export const HeaderButtonStyle = StyleSheet.create({
  multi: {
    flexDirection: 'row',
  },
  container: {
    padding: 10,
  },
  image: {
    justifyContent: 'center',
    width: 35,
    height: 35,
    margin: 6,
  },
  rightButton: {
    color: AppStyles.color.tint,
    marginRight: 10,
    fontWeight: 'normal',
    fontFamily: AppStyles.fontName.main,
  },
});

export const ListStyle = StyleSheet.create({
  title: {
    fontSize: 16,
    color: AppStyles.color.subtitle,
    fontFamily: AppStyles.fontName.bold,
    fontWeight: 'bold',
  },
  subtitleView: {
    minHeight: 55,
    flexDirection: 'row',
    paddingTop: 5,
    marginLeft: 10,
  },
  leftSubtitle: {
    flex: 2,
  },
  avatarStyle: {
    height: 80,
    width: 80,
  },
});

export const suggestionStyle = StyleSheet.create({
  textInput: {
    fontSize: 14,
    width: Dimensions.get('screen').width * 0.9,
    color: AppStyles.color.textBlue,
    fontFamily : AppStyles.fontName.robotoRegular
  },
  loadingComponent: {
    backgroundColor: '#fff',
    width: Dimensions.get('screen').width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  suggestionListItem: {
    width: Dimensions.get('screen').width * 0.9,
    borderBottomWidth: 1,
    borderBottomColor: AppStyles.color.white,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  userImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5,
  },
  fullName: {
    fontSize: 13,
    paddingLeft: 5,
    paddingBottom: 0,
    marginBottom: 0,
  },
  userName: {
    fontSize: 10,
    paddingLeft: 5,
    paddingTop: 0,
    marginTop: 0,
    color: 'grey',
  },
});

export const globalStyles = StyleSheet.create({
  chatUserIcon: {
    position: 'absolute',
    top: 53,
    left: 53,
  },
  parsedText: {
    fontSize: 12,
    fontFamily: AppStyles.fontName.poppins,
    color: AppStyles.color.white,
  },
  replyTxt: {
    fontSize: 15,
    color: AppStyles.color.black,
  },
  textDecoration: {textDecorationLine: 'underline'},
  countDownStyle: {
    color: AppStyles.color.white,
    fontSize: 30,
  },
  competitionMargins: {marginRight: 20, marginTop: 16},
  moreLesstext: {
    textShadowColor: 'grey',
    textShadowOffset: {width: 0.5, height: 0.5},
    textShadowRadius: 1,
  },
  homeParseText: {
    fontSize: 12,
    fontFamily: AppStyles.fontName.poppins,
    color: AppStyles.color.grayText,
    textShadowColor: 'grey',
    textShadowOffset: {width: 0.5, height: 0.5},
    textShadowRadius: 1,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? '12%' : '8%',
  },
  parsedSubText: {
    fontFamily: AppStyles.fontName.poppinsBold,
    color: 'white',
  },
  otpInputView: {
    width: '100%',
    height: 100,
    padding: 40,
  },
  otpInputFieldStyle: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,
  },
  dropDownText: {
    fontFamily: AppStyles.fontName.poppins,
  },
  animatedView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    margin: 0.5,
    borderRadius: 5,
    backgroundColor: '#ed1f2b',
    width: `${50}%`,
  },
  mentionTextInput: {
    borderBottomWidth: 1,
    borderBottomColor: AppStyles.color.white,
    fontSize: 14,
    width: Dimensions.get('screen').width * 0.9,
    color: AppStyles.color.white,
  },
  textTransForm: {textTransform: 'capitalize'},
  successImageView: {width: '100%', height: 500},
  countDownView: {
    shadowColor: AppStyles.color.bgColor,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
  countDownPlus1: {
    position: 'absolute',
    height: 155,
    width: 2,
    backgroundColor: AppStyles.color.btnColor,
  },
  countDownPlus2: {
    position: 'absolute',
    width: 155,
    height: 2,
    backgroundColor: AppStyles.color.btnColor,
  },
  flatListSliderContainer: {
    position: 'absolute',
    bottom: 20,
  },
  AppStackTxt: {
    textAlign: 'center',
    flex: 1,
    fontFamily: `${AppStyles.fontName.poppins}`,
  },
  parsedSubText1: {fontWeight: 'bold', color: 'white'},
  commentemptyTxt: {
    fontSize: 15,
    color: AppStyles.color.black,
  },
  timeLabelStyle: {
    color: AppStyles.color.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  digitTxtStyle: {
    color: AppStyles.color.white,
    fontSize: 30,
    fontFamily: AppStyles.fontName.poppins,
  },
  digitStyle: {backgroundColor: 'transparent'},
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: AppStyles.color.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotStyle: {backgroundColor: AppStyles.color.white},
  activeDotStyle: {backgroundColor: AppStyles.color.primary},
  tabStyle: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 0,
  },
});
