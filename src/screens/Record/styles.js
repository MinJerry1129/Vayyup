import styled from 'styled-components/native';

export const ParticipateNowButton = styled.TouchableOpacity`
  background-color: rgb(255, 255, 255);
  border: 3px solid #0C0B54;
  border-radius: 12px;
  padding: 15px;
  margin-vertical: 10px;
  margin-horizontal: 20px;
  align-items: center;
`;

export const ParticipateNowText = styled.Text`
  color: #0C0B54;
  font-size: 21px;
  font-weight: bold;
`;

export const Actions = styled.View`
  position: absolute;
  top: ${({top}) => top || 'auto'};
  right: ${({right}) => right || 'auto'};
  bottom: ${({bottom}) => bottom || 'auto'};
  left: ${({left}) => left || 'auto'};
  flex-direction: row;
  width: 100%;
  justify-content: ${({justify = 'center'}) => justify};
  align-items: ${({alignItems}) => alignItems || 'flex-start'};
  align-content: center;
  padding: 5px;
`;

export const BoxAction = styled.TouchableOpacity.attrs({
  activeOpacity: 0.5,
})`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  width: ${({size = 40}) => size}px;
  height: ${({size = 40}) => size}px;
  border-radius: 30px;
`;
export const StartBoxAction = styled.TouchableOpacity.attrs({
  activeOpacity: 0.8,
})`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(196, 196, 196, 1);
  width: ${({size = 40}) => size}px;
  height: ${({size = 40}) => size}px;
  border-radius: 30px;
`;


export const CircleAction = styled.TouchableOpacity.attrs({
  activeOpacity: 0.8,
})`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #C4C4C4;
  width: ${({size = 40}) => size}px;
  height: ${({size = 40}) => size}px;
  border-radius: 30px;
`;

