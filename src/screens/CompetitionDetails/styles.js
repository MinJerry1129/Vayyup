import styled from 'styled-components/native';

import * as CommonComponents from 'common-components';

export const Container = styled(CommonComponents.Container)`
  padding: 10px;
  background: #fafafa;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #0C0B54;
  margin-bottom: 10px;
`;

export const ListItem = styled.TouchableOpacity`
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid #c4c4c4;
  border-radius: 18px;
  box-shadow: 0px 4px 4px rgba(14, 75, 156, 0.41);
  elevation: 10;
  padding: 30px 10px;
  margin-bottom: 10px;
`;

export const Wrapper = styled.View`
  align-items: center;
  justify-content: center;
  align-content: center;
  margin-vertical: 20px;
`;

export const ListItemText = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #0C0B54;
`;

export const ParticipateNowButton = styled.TouchableOpacity`
  background-color: rgb(255, 255, 255);
  border: 3px solid #0C0B54;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 10px;
  align-items: center;
`;

export const ParticipateNowText = styled.Text`
  color: #00001A;
  font-size: 18px;
  font-family: 'Roboto-Bold';
`;
