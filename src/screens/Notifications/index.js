import React from 'react';
import {
    VUView,
    VUScrollView,
    VUText,
    VUImage,
    VUTouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    VUVideo,
} from 'common-components';
import { AppStyles } from 'src/AppStyles';
import Header from '../../common-components/Header';
import { useNavigation } from '@react-navigation/core';
import { FlatList , Dimensions } from 'react-native';

const dummyData = [
    {
        title : 'Hello world',
        desc : 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used ',
        img : "https://firebasestorage.googleapis.com/v0/b/vayyup-test-40b86.appspot.com/o/profiles%2Fd6b35d50-63b6-435a-926e-8ad95c7330bc.jpg?alt=media&token=161ef65e-5a43-4f96-b121-06bce840787d",
    },
    {
        title : 'Hello world',
        desc : 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document',
        img : "https://firebasestorage.googleapis.com/v0/b/vayyup-test-40b86.appspot.com/o/profiles%2Fb770d4dc-79b9-4e5b-b348-e64df252d9d5.jpg?alt=media&token=0ee94511-dacd-44c1-9bca-aecb5c4bfaa0",
    },
    {
        title : 'Hello world',
        desc : 'Lorem ipsum, in graphical and textual context, refers to filler text that is placed in a document or visual presentation.',
        img : "https://firebasestorage.googleapis.com/v0/b/vayyup-test-40b86.appspot.com/o/profiles%2Fd6b35d50-63b6-435a-926e-8ad95c7330bc.jpg?alt=media&token=161ef65e-5a43-4f96-b121-06bce840787d",
    },
    {
        title : 'Hello world',
        desc : 'Lorem Ipsum',
        img : "https://firebasestorage.googleapis.com/v0/b/vayyup-test-40b86.appspot.com/o/profiles%2Fb770d4dc-79b9-4e5b-b348-e64df252d9d5.jpg?alt=media&token=0ee94511-dacd-44c1-9bca-aecb5c4bfaa0",
    },
    {
        title : 'Hello world',
        desc : 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used ',
        img : "https://firebasestorage.googleapis.com/v0/b/vayyup-test-40b86.appspot.com/o/profiles%2Fd6b35d50-63b6-435a-926e-8ad95c7330bc.jpg?alt=media&token=161ef65e-5a43-4f96-b121-06bce840787d",
    },
    {
        title : 'Hello world',
        desc : 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document',
        img : "https://firebasestorage.googleapis.com/v0/b/vayyup-test-40b86.appspot.com/o/profiles%2Fb770d4dc-79b9-4e5b-b348-e64df252d9d5.jpg?alt=media&token=0ee94511-dacd-44c1-9bca-aecb5c4bfaa0",
    },
    {
        title : 'Hello world',
        desc : 'Lorem ipsum, in graphical and textual context, refers to filler text that is placed in a document or visual presentation.',
        img : "https://videodelivery.net/45253b2a7ae619982eb9a790a009a1fa/thumbnails/thumbnail.jpg",
    },
    {
        title : 'Hello world',
        desc : 'Lorem Ipsum',
        img : "https://videodelivery.net/360a221f660c8619babb20dfc6e3042f/thumbnails/thumbnail.jpg",
    },
    {
        title : 'Hello world',
        desc : 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used ',
        img : "https://videodelivery.net/fdebb711c8067e26f5798355cc59d4ec/thumbnails/thumbnail.jpg",
    },
    {
        title : 'Hello world',
        desc : 'In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document',
        img : "https://firebasestorage.googleapis.com/v0/b/vayyup-test-40b86.appspot.com/o/profiles%2Fd6b35d50-63b6-435a-926e-8ad95c7330bc.jpg?alt=media&token=161ef65e-5a43-4f96-b121-06bce840787d",
    },
    {
        title : 'Hello world',
        desc : 'Lorem ipsum, in graphical and textual context, refers to filler text that is placed in a document or visual presentation.',
        img : "https://firebasestorage.googleapis.com/v0/b/vayyup-test-40b86.appspot.com/o/profiles%2Fd6b35d50-63b6-435a-926e-8ad95c7330bc.jpg?alt=media&token=161ef65e-5a43-4f96-b121-06bce840787d",
    },
    {
        title : 'Hello world',
        desc : 'Lorem Ipsum',
        img : "https://firebasestorage.googleapis.com/v0/b/vayyup-test-40b86.appspot.com/o/profiles%2Fd6b35d50-63b6-435a-926e-8ad95c7330bc.jpg?alt=media&token=161ef65e-5a43-4f96-b121-06bce840787d",
    },
]

const Notifications = (props) => {
    const navigation = useNavigation();

    const handleBackPressed = () => {
        navigation.goBack();
      };

    const renderItem = (item, index) => {
        return(
            <VUView style={{
                alignItems: 'center',
                flexDirection: 'row',
                width: '95%',
                alignSelf: 'center',
                borderBottomColor : AppStyles.color.grey,
                borderBottomWidth : 0.5,
            }}
            mt={2}
            pb={2}
            >
                <VUView style={{
                    width : '70%',
                }}>
                <VUText
                    color={AppStyles.color.textBlue}
                    fontSize={14}
                    fontFamily={AppStyles.fontName.robotoMedium}
                >
                    {item.title}
                </VUText>
                <VUText 
                    color={AppStyles.color.grey}
                    fontSize={12}
                    fontFamily={AppStyles.fontName.robotoRegular}
                    >
                    {item.desc}
                </VUText>
                </VUView>
                <VUImage 
                    source={{uri : item.img}}
                    style={{
                        width : '25%',
                        height : Dimensions.get('screen').height * 0.08,
                        marginLeft : '5%'
                    }}
                />
            </VUView>
        )
    }

    return (
        <SafeAreaView bg={AppStyles.color.bgWhite}>
            <Header
                headerTitle={'Notifications'}
                onLeftPress={handleBackPressed}
            />

            <FlatList 
            data={dummyData}
            renderItem={({item,index}) => {
                return renderItem(item,index)
            }}
            />
        </SafeAreaView>
    );
}

export default Notifications;
