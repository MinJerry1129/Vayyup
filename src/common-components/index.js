import styled from 'styled-components/native';
import SafeAreaView from './SafeAreaView';
import Container from './Container';
import Separator from './Separator';
import ListItem from './ListItem';
import ActivityIndicator from './ActivityIndicator';
import {MySearchBar} from './SearchBar';
import Overlay from './Overlay';
import {AppStyles} from 'src/AppStyles';
import Button from 'react-native-button';
import {RNCamera} from 'react-native-camera';
import {Platform} from 'react-native';
import Video from 'react-native-video';

import {
  compose,
  space,
  color as ssColor,
  typography,
  layout,
  flexbox,
  border,
} from 'styled-system';
import {shadow} from 'styled-system';

const {color, borderRadius, fontSize} = AppStyles;
const BaseFontSize = fontSize.normal;

const VayyUpLogo = styled.Image.attrs({
  source: require('src/../assets/logo-4.png'),
})`
  width: ${({size = 75}) => size}px;
  height: ${({size = 75}) => size}px;
  resize-mode: contain;
`;

const VUView = styled.View(
  compose(space, ssColor, layout, flexbox, border, shadow),
);
const VUScrollView = styled.ScrollView(
  compose(space, ssColor, layout, flexbox, border),
);

const VUTextInput = styled.TextInput(
  compose(space, ssColor, layout, flexbox, border, shadow),
);
VUTextInput.defaultProps = {
  py: 3,
  // fontFamily: 'Poppins-Regular',
  fontFamily: AppStyles.fontName.robotoRegular,
  includeFontPadding :false
};

const VUImage = styled.Image`
  ${space}
  ${border}
  ${layout}
`;

const VUText = styled.Text`
  ${typography}
  ${space}
  ${ssColor}
`;

VUText.defaultProps = {
  // fontFamily: 'Poppins-Regular',
  fontFamily: AppStyles.fontName.robotoRegular,
  includeFontPadding :false
};

const VUTouchableWithoutFeedback = styled.TouchableWithoutFeedback`
  ${flexbox}
  ${space}
`;

const VUTouchableOpacity = styled.TouchableOpacity(
  compose(space, ssColor, layout, flexbox, border),
);

const VUVideo = styled(Video)`
  ${space}
  ${flexbox}
  ${layout}
`;

const ProfileImage = styled.Image`
  width: ${({size = 75}) => size}px;
  height: ${({size = 75}) => size}px;
  border-radius: 100px;
  resize-mode: contain;
`;

const Image = styled.Image`
  width: ${({width = '75px'}) => width};
  height: ${({height = '75px'}) => height};
`;

const ComponentRoot = styled.View`
  flex: 1;
  align-items: center;
`;

const PrimaryButton = styled(Button).attrs(({width = 200, marginTop = 30}) => ({
  containerStyle: {
    width,
    backgroundColor: AppStyles.color.blueBtnColor,
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop,
  },
  style: {
    fontFamily: AppStyles.fontName.poppinsBold,
  },
  style:{
    fontFamily:AppStyles.fontName.robotoBold
  }
}))`
  ${space}
  border-radius: ${borderRadius.main}px;
  justify-content: center;
  align-self: center;
  color: ${color.white};
  padding-vertical: 10px;
`;

PrimaryButton.defaultProps = {p: '5px',fontFamily:AppStyles.fontName.robotoRegular};

const SecondaryButton = styled(Button).attrs(
  ({width = 200, marginTop = 30}) => ({
    containerStyle: {
      width,
      backgroundColor: color.secondary,
      borderRadius: AppStyles.borderRadius.main,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginTop,
    },
  }),
)`
  ${space}
  border-radius: ${borderRadius.main}px;
  justify-content: center;
  align-self: center;
  background-color: ${color.secondary};
  color: ${color.white};
`;

SecondaryButton.defaultProps = {p: '5px'};

const PrimaryOutlinedButton = styled(Button).attrs(
  ({width = 250, margin = 10}) => ({
    containerStyle: {
      width,
      backgroundColor: AppStyles.color.white,
      borderRadius: AppStyles.borderRadius.main,
      borderColor: color.primary,
      borderWidth: 1,
      margin,
      alignSelf: 'center',
      padding: 1,
    },
  }),
)`
  padding: 10px 15px;
  border-radius: ${borderRadius.main}px;
  justify-content: center;
  align-self: center;
  color: ${color.primary};
  font-weight: normal;
`;

const SecondaryOutlinedButton = styled(Button).attrs(({width = 200}) => ({
  containerStyle: {
    width,
    backgroundColor: AppStyles.color.white,
    borderRadius: AppStyles.borderRadius.main,
    borderColor: color.secondary,
    borderWidth: 1,
    margin: 10,
    alignSelf: 'center',
  },
}))`
  padding: 10px 15px;
  border-radius: ${borderRadius.main}px;
  justify-content: center;
  align-self: center;
  color: ${color.secondary};
  font-weight: normal;
`;

const TextInput = styled.TextInput.attrs({
  placeholderTextColor: color.grey,
  underlineColorAndroid: 'transparent',
})`
  background: ${color.primaryBackground};
  color: ${color.text};
  border: 1px solid ${color.grey};
  border-radius: ${borderRadius.main}px;
  font-size: ${BaseFontSize}px;
  elevation: 4;
  padding: 8px;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: flex-start;
  text-align-vertical: ${({valign = 'center'}) => valign};
`;

const TouchableTextInput = styled.TouchableOpacity.attrs({
  placeholderTextColor: color.grey,
  underlineColorAndroid: 'transparent',
})`
  background: ${color.primaryBackground};
  color: ${color.text};
  border: 1px solid ${color.grey};
  border-radius: ${borderRadius.main}px;
  font-size: ${BaseFontSize}px;
  elevation: 4;
  padding: 6px 0px;
  align-items: flex-start;
  align-content: flex-start;
  justify-content: flex-start;
  text-align-vertical: top;
`;

const PageHeader = styled.Text`
  color: ${(props) => props.color || color.primary};
  font-size: ${({size = fontSize.title}) => size}px;
  padding: ${({padding = 5}) => padding}px;
  font-weight: ${({bold}) => (bold ? 'bold' : 'normal')};
  opacity: ${(active) => (active ? '1' : '0.5')};
  align-self: center;
  text-align: center;
`;

const ErrorText = styled.Text`
  font-size: 14px;
  color: ${color.errorText};
`;

const View = styled.View`
  background-color: ${({backgroundColor = color.background}) =>
    backgroundColor};
  margin-left: ${({marginLeft = 0}) => marginLeft}px;
  margin-right: ${({marginRight = 0}) => marginRight}px;
  margin-top: ${({marginTop = 0}) => marginTop}px;
  margin-bottom: ${({marginBottom = 0}) => marginBottom}px;
  width: ${({width = 'auto'}) => width};
  padding: ${({padding = 0}) => padding}px;
  border-radius: ${({radius = 0}) => radius}px;
  overflow: hidden;
  justify-content: ${({justify = 'flex-start'}) => justify};
`;

const HorizontalView = styled(View)`
  flex: 1;
  flex-direction: row;
`;

const VerticalView = styled(View)`
  flex: 1;
  flex-direction: column;
`;

const Header = styled.View`
  height: 10%;
  flex-direction: row;
  position: absolute;
  align-self: center;
  z-index: 10;
  align-items: center;
  margin-top: 5%;
`;

const Text = styled.Text`
  color: ${(props) => props.color || color.primaryBackground};
  background: transparent;
  font-size: ${(props) => props.fontSize || BaseFontSize}px;
  padding: ${({padding = '5'}) => padding}px;
  font-weight: ${({weight = 'bold'}) => weight};
  opacity: ${(props) => (props.active ? '1' : '0.5')};
  text-align: ${({textAlign = 'left'}) => textAlign};
  margin-top: ${({marginTop = 0}) => marginTop}px;
  margin-bottom: ${({marginBottom = 0}) => marginBottom}px;
  margin-left: ${({marginLeft = 0}) => marginLeft}px;
`;

const Tab = styled.TouchableOpacity.attrs({
  activeOpacity: 1,
})``;

const Feed = styled.View`
  flex: 1;
  z-index: -1;
  position: absolute;
`;

export const Wrapper = styled.View`
  align-items: center;
  justify-content: center;
  align-content: center;
  margin-vertical: ${({marginVertical}) => marginVertical || 0}px;
  margin-top: ${({marginTop}) => marginTop || 0}px;
`;

const VayyUpAV = styled(RNCamera)`
  flex: 1;
`;

const KeyboardAvoidingView = styled.KeyboardAvoidingView.attrs(() => ({
  behavior: Platform.OS === 'ios' ? 'padding' : 'height',
}))`
  flex: 1;
`;

const KeyboardAvoidingViewWrapper = styled.View`
  flex: 1;
  justify-content: flex-end;
  background-color: ${color.background};
`;

const PLAYER_STATES = {
  PLAYING: 0,
  PAUSED: 1,
  ENDED: 2,
};

export {
  VayyUpLogo,
  VUView,
  VUScrollView,
  VUText,
  VUTouchableWithoutFeedback,
  VUImage,
  VUTouchableOpacity,
  VUTextInput,
  ComponentRoot,
  View,
  PageHeader,
  ErrorText,
  HorizontalView,
  VerticalView,
  PrimaryButton,
  PrimaryOutlinedButton,
  SecondaryButton,
  SecondaryOutlinedButton,
  ActivityIndicator,
  Overlay,
  SafeAreaView,
  Container,
  Separator,
  Header,
  Text,
  Tab,
  Feed,
  ListItem,
  TextInput,
  TouchableTextInput,
  ProfileImage,
  VayyUpAV,
  Image,
  KeyboardAvoidingView,
  KeyboardAvoidingViewWrapper,
  VUVideo,
  PLAYER_STATES,
  MySearchBar,
};
