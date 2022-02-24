import styled from 'styled-components/native';

import * as CommonComponents from 'common-components';

export const Container = styled(CommonComponents.Container)`
  padding: 10px;
  background: #fafafa;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #0c0b54;
  margin-bottom: 10px;
`;

export const ListItem = styled.TouchableOpacity`
  background-color: #fff;
  border: 1px solid #c4c4c4;
  border-radius: 18px;
  box-shadow: 0px 4px 4px rgba(14, 75, 156, 0.41);
  elevation: 10;
  padding: 20px 10px;
  margin-bottom: 10px;
  color: #000;
`;

export const ListItemWrapper = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const ListItemText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #000;
  margin-vertical: 10px;
`;
