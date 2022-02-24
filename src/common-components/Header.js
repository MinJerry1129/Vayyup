import React from 'react';
import { TouchableOpacity , SafeAreaView , View , Text , StyleSheet } from 'react-native';
import { AppStyles, suggestionStyle } from 'src/AppStyles';
import { IonIcon } from 'src/icons';

const Header = (props) => {
    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.left}
                    onPress={() => props.onLeftPress()}
                    >
                <IonIcon name="chevron-back" size={25} color={AppStyles.color.textBlue} />
            </TouchableOpacity>

            <Text style={styles.title}
            numberOfLines={1}
            >
                {props.headerTitle}
            </Text>

            <View 
                style={styles.right}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container : {
        backgroundColor: AppStyles.color.white,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center',
        elevation : 5,
        shadowOffset : {
            width : 1, height : 1
        },
        shadowColor : AppStyles.color.black,
        shadowOpacity : 0.2,
        shadowRadius : 3,
        borderBottomWidth : 0.5,
        borderBottomColor : AppStyles.color.grayText
    },
    title : {
        fontFamily : AppStyles.fontName.robotoMedium,
        fontSize : 18,
        marginVertical : 15,
        width : '80%',
        textAlign : 'center',
        textTransform : 'capitalize'
    },
    left : {
        width : '10%',
        alignItems:'center'
    },
    right : {
        width : '10%'
    }
})


export default Header;
