import styled from 'styled-components/native';
import {color, space} from 'styled-system';

const SafeAreaView = styled.SafeAreaView`
  ${color}
  ${space}
  flex: 1;
`;

SafeAreaView.defaultProps = {bg: '#000'};

export default SafeAreaView;
