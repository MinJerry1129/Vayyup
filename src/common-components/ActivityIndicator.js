import styled from 'styled-components/native';
import {AppStyles} from 'src/AppStyles';

const ActivityIndicator = styled.ActivityIndicator.attrs(
  ({size = 'large', animating = false, color = AppStyles.color.blueBtnColor}) => ({
    size,
    animating,
    color,
  }),
)`
  margin-top: ${({marginTop = 30}) => marginTop}px;
`;

export default ActivityIndicator;
