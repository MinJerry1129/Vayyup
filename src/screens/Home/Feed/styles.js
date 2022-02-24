import styled from 'styled-components/native';
import {Dimensions} from 'react-native';
import * as Global from 'src/AppStyles';

const {borderRadius} = Global.AppStyles;

export const Controls = styled.View`
  width: 100%;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  background-color: ${Global.AppStyles.color.background};
`;

export const ContentWrapper = styled.View`
  flex: 1;
  width: 100%;
  overflow: hidden;
  elevation: 8;
  background-color: #000;
`;

export const Header = styled.View`
  position: absolute;
  padding: 5px;
  top: ${({top}) => top || 'auto'};
  right: ${({right}) => right || 'auto'};
  bottom: ${({bottom}) => bottom || 'auto'};
  left: ${({left}) => left || 'auto'};
  flex-direction: row;
  justify-content: space-between;
  align-items: ${({align = 'center'}) => align};
`;

export const Details = styled.View`
  flex-direction: row;
  align-items: center;
  border-radius: ${({radius}) => radius || borderRadius.main}px;
  padding: ${({padding = 0}) => padding}px;
`;

export const User = styled.Text`
  font-size: 18px;
  font-weight: bold;
  padding: 5px 10px;
  color: ${Global.AppStyles.color.white};
`;

export const Tags = styled.Text`
  font-size: 16px;
  font-weight: bold;
  line-height: 22px;
  padding: 0;
  color: ${Global.AppStyles.color.primary};
`;
export const MusicBox = styled.View`
  flex-direction: row;
  align-items: center;
`;
export const Music = styled.Text`
  font-size: 15px;
  padding: 5px 5px 5px 15px;
  flex-shrink: 1;
  color: #fff;
`;

export const Actions = styled.View`
  position: absolute;
  top: ${({top}) => top || 'auto'};
  right: ${({right}) => right || 'auto'};
  bottom: ${({bottom}) => bottom || 'auto'};
  left: ${({left}) => left || 'auto'};
  width: 100%;
  flex-direction: ${({row = false}) => (row ? 'row' : 'column')};
  justify-content: space-around;
  align-items: ${({alignItems}) => alignItems || 'flex-start'};
  align-content: center;
  padding: 5px;
`;

export const BoxAction = styled.TouchableOpacity.attrs({
  activeOpacity: 0.8,
})`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  overflow: hidden;
`;

export const TextAction = styled.Text`
  color: #fff;
  padding: 0;
  font-family: 'Roboto-Regular';
  text-shadow: 1px 1px 5px grey;
`;
