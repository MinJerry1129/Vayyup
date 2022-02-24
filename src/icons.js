import styled from 'styled-components/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Material from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';
import Evil from 'react-native-vector-icons/EvilIcons';
import Ion from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';

const iconSize = 24;
const iconColor = '#fff';

const FontAwesomeIcon = styled(FontAwesome).attrs(({size, color}) => ({
  size: size || iconSize,
  color: color || iconColor,
}))`
  align-self: ${(centered) => (centered ? 'center' : 'flex-start')};
`;

const FontAwesome5Icon = styled(FontAwesome5).attrs(({size, color}) => ({
  size: size || iconSize,
  color: color || iconColor,
}))`
  align-self: ${(centered) => (centered ? 'center' : 'flex-start')};
`;

const AntDesignIcon = styled(AntDesign).attrs(({size, color}) => ({
  size: size || iconSize,
  color: color || iconColor,
}))`
  align-self: ${(centered) => (centered ? 'center' : 'flex-start')};
`;

const MaterialIcon = styled(Material).attrs(({size, color}) => ({
  size: size || iconSize,
  color: color || iconColor,
}))`
  align-self: ${(centered) => (centered ? 'center' : 'flex-start')};
`;

const MaterialCommunityIcons = styled(MaterialCommunity).attrs(({size, color}) => ({
  size: size || iconSize,
  color: color || iconColor,
}))`
  align-self: ${(centered) => (centered ? 'center' : 'flex-start')};
`;

const EvilIcon = styled(Evil).attrs(({size, color}) => ({
  size: size || iconSize,
  color: color || iconColor,
}))`
  align-self: ${(centered) => (centered ? 'center' : 'flex-start')};
`;

const IonIcon = styled(Ion).attrs(({size, color}) => ({
  size: size || iconSize,
  color: color || iconColor,
}))`
  align-self: ${(centered) => (centered ? 'center' : 'flex-start')};
`;

const EntypoIcon = styled(Entypo).attrs(({size, color}) => ({
  size: size || iconSize,
  color: color || iconColor,
}))`
  align-self: ${(centered) => (centered ? 'center' : 'flex-start')};
`;
const FeatherIcon = styled(Feather).attrs(({size, color}) => ({
  size: size || iconSize,
  color: color || iconColor,
}))`
  align-self: ${(centered) => (centered ? 'center' : 'flex-start')};
`;

export {
  FontAwesomeIcon,
  FontAwesome5Icon,
  AntDesignIcon,
  MaterialIcon,
  MaterialCommunityIcons,
  EvilIcon,
  IonIcon,
  EntypoIcon,
  FeatherIcon
};
