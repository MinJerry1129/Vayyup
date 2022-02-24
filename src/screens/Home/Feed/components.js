import React, {memo} from 'react';
import styled from 'styled-components/native';
import {AntDesignIcon, IonIcon, FontAwesomeIcon, FeatherIcon} from 'src/icons';
import {numFormatter} from 'src/services/numFormatter';
import {AppStyles} from 'src/AppStyles';
import {Header, BoxAction, TextAction} from './styles';
import {
  VUView,
  VUText,
  VUImage,
  VUVideo,
  VUTouchableOpacity,
  ActivityIndicator,
} from 'common-components';
import Thumbs from 'common-components/icons/Thumbs';
import ThumbsRed from 'common-components/icons/ThumbsRed';

export const FeedVideo = styled(VUVideo).attrs({
  volume: 10,
  posterResizeMode: 'cover',
  resizeMode: 'cover',
  ignoreSilentSwitch: 'ignore',
  repeat: true,
})`
  flex: 1;
`;

export const FeedImage = styled(VUImage).attrs({resizeMode: 'cover'})`
  height: '100%';
  width: '100%';
`;

export const FeedProfileImage = styled(VUImage).attrs({
  size: 40,
  borderRadius: 20,
})``;

export const RightFrame = styled(Header).attrs({
  right: '0px',
  bottom: '120px',
})``;

function areEqual(prevProps, nextProps) {
  return true;
}

export const WhiteActivityIndicator = memo(() => {
  return <ActivityIndicator color="#fff" animating={true} />;
}, areEqual);

export const PlayIcon = memo(() => {
  return <AntDesignIcon name={'play'} size={64} color="#bbb" />;
}, areEqual);

export const EyeOutlinedIcon = memo(() => {
  return (
    <IonIcon
      centered
      size={28}
      name="eye-outline"
      color={AppStyles.color.btnColor}
    />
  );
}, areEqual);

export const PersonOutlined = memo(() => {
  return <IonIcon name="person-circle-outline" size={50} color="#ffffff" />;
}, areEqual);
export const ThumbsUpOutlinedIcon = memo(() => {
  return <ThumbsRed size={30} />;
}, areEqual);

export const ThumbsUpFilledIcon = memo(() => {
  return <Thumbs size={30} />;
}, areEqual);
export const HeartOutlinedIcon = memo(() => {
  return <FontAwesomeIcon centered name="heart" color={'#E8505B'} />;
}, areEqual);
export const HeartFilledIcon = memo(() => {
  return (
    <FontAwesomeIcon centered name="heart-o" color={AppStyles.color.btnColor} />
  );
}, areEqual);
export const CommentIcon = memo(() => {
  return (
    <IonIcon
      size={28}
      name="chatbubble-ellipses-outline"
      color={AppStyles.color.btnColor}
    />
  );
}, areEqual);
export const ShareIcon = memo(() => {
  return (
    <IonIcon
      size={26}
      name="share-social-sharp"
      color={AppStyles.color.btnColor}
    />
  );
}, areEqual);
export const FlagIcon = memo(() => {
  return <FontAwesomeIcon name="flag" color={AppStyles.color.btnColor} />;
}, areEqual);
export const TrashIcon = memo(() => {
  return (
    <FontAwesomeIcon
      size={26}
      name="trash-o"
      color={AppStyles.color.btnColor}
    />
  );
}, areEqual);

export const DownloadIcon = memo(() => {
  return (
    <FeatherIcon size={26} name="download" color={AppStyles.color.btnColor} />
  );
}, areEqual);

function showViewCountAreEqual(prevProps, nextProps) {
  return prevProps.viewCount === nextProps.viewCount;
}
export const ShowViewCount = memo(({viewCount}) => {
  return (
    <VUView>
      <BoxAction>
        <EyeOutlinedIcon />
        <VUView px={10} alignItems="center">
          <TextAction>{numFormatter(parseInt(viewCount))}</TextAction>
        </VUView>
      </BoxAction>
    </VUView>
  );
});

function followButtonAreEqual(prevProps, nextProps) {
  return prevProps.onPress === nextProps.onPress;
}
export const FollowButton = memo(({onPress}) => {
  return (
    <VUTouchableOpacity
      borderColor={AppStyles.color.btnColor}
      ml={2}
      borderWidth={1}
      borderRadius={24}
      width={50}
      height={20}
      onPress={onPress}>
      <VUText textAlign="center" fontSize={12} color={AppStyles.color.btnColor}>
        Follow
      </VUText>
    </VUTouchableOpacity>
  );
});

export const UnFollowButton = memo(({onPress}) => {
  return (
    <VUTouchableOpacity
      borderColor={AppStyles.color.btnColor}
      ml={2}
      borderWidth={1}
      borderRadius={24}
      width={50}
      height={20}
      onPress={onPress}>
      <VUText textAlign="center" fontSize={12} color={AppStyles.color.btnColor}>
        Unfollow
      </VUText>
    </VUTouchableOpacity>
  );
});
