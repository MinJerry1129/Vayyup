import styled from 'styled-components/native';
import * as Global from 'src/AppStyles';

export const SafeAreaView = styled.SafeAreaView`
  flex: 1;
  background: ${Global.AppStyles.color.background};
`;

export const Container = styled.View`
  flex: 1;
  background: ${Global.AppStyles.color.background};
`;

export const Separator = styled.Text`
  color: #000;
  font-size: 15px;
  opacity: 0.2;
`;

export const Header = styled.View`
  height: 10%;
  flex-direction: row;
  position: absolute;
  align-self: center;
  z-index: 10;
  align-items: center;
  margin-top: 5%;
`;
export const Text = styled.Text`
  color: #000;
  font-size: ${(props) => (props.active ? '20px' : '18px')};
  padding: 5px;
  font-weight: bold;
  opacity: ${(props) => (props.active ? '1' : '0.5')};
`;

export const Tab = styled.TouchableOpacity.attrs({
  activeOpacity: 1,
})``;

export const Feed = styled.View`
  flex: 1;
  z-index: -1;
  position: absolute;
`;
