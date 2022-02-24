import styled from 'styled-components';
import {AppStyles} from '../AppStyles';

export const TextInput = styled.TextInput`
  height: 50px;
  padding-left: 20px;
  padding-right: 20px;
  color: ${AppStyles.color.text};
  background-color: ${AppStyles.color.background};
  border-radius: 25px;
  border: 1px solid ${AppStyles.color.grey};
  font-size: ${AppStyles.fontSize.normal}px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;
