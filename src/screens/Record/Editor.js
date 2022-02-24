import Slider from '@react-native-community/slider'
import React, { Component } from 'react'
import { Animated, Dimensions, Alert, Image, Keyboard, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native'
import { createResponder } from 'react-native-gesture-responder'
import ImagePicker from 'react-native-image-crop-picker'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import ViewShot from 'react-native-view-shot'
import { AppStyles } from 'src/AppStyles'


// import ColorPick from '../colorPicker/colorPicker'
const DEVICE_WIDTH = Dimensions.get('window').width
const DEVICE_HEIGHT = Dimensions.get('window').height
export default class Editor extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isBoardOpen: false,
            interactionsComplete: false,
            isEnterTextOpen: false,
            textToAdd: '',
            selectedColor: 'white',
            enteredText: '',
            textArray: [],
            index: 0,
            isColorPickerOpen: false,
            fontColor: '#000000',
            editTextComponentOpen: false,
            isHorizontal: false,
            isSubscribed: false,
            fontSize: 50,
            emozi: '',
            xValue: 0,
            yValue: 0,
            x: new Animated.Value(0),
            y: new Animated.Value(0),
            isColorOpen: false,
            widthText: 0,
            previousFontSize: 50,
            textEntered: '',
            isDialogOpen: false,
            wasInfoTrue: false,
            focused: false,
            isFocusTextInput: false,
            orientation: 'PORTRAIT',
            openColorPicker: false,
            selectedImage: ''
        }
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)
        // this.init()
    }
    async UNSAFE_componentWillMount() {
        this.Responder = createResponder({
            onStartShouldSetResponder: () => true,
            onStartShouldSetResponderCapture: () => true,
            onMoveShouldSetResponder: () => true,
            onMoveShouldSetResponderCapture: () => true,
            onResponderMove: (evt, gestureState) => {
                if (Platform.OS === 'android') {
                    this.setState({
                        isFocusTextInput: false
                    })
                }
                let thumbSize = this.state.fontSize
                if (gestureState.pinch && gestureState.previousPinch) {
                    thumbSize *= (gestureState.pinch / gestureState.previousPinch)
                    if (thumbSize <= DEVICE_HEIGHT / DEVICE_WIDTH * 100 && thumbSize > 10) {
                        this.setState({
                            fontSize: thumbSize
                        })
                    }
                }
                this.pan(gestureState)
            },
            onResponderGrant: () => {
                if (Platform.OS === 'android') {
                    this.setState({
                        isFocusTextInput: true
                    })
                }
            },
            onResponderRelease: () => {
                if (this.state.isFocusTextInput && Platform.OS === 'android') {
                    this.inputRef.focus()
                }
            },
            onResponderEnd: () => {
            },
            onPanResponderTerminationRequest: () => true
        })

    }

    selectMethod = () => {
        Alert.alert(
            "Image",
            "Please select one",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                { text: "Open Camera", onPress: () => this.openImagePicker(false) },
                { text: "Open Gallery", onPress: () => this.openImagePicker(true) }
            ]
        );
    }

    openImagePicker = (isGalleryImage) => {
        if (!isGalleryImage) {
            ImagePicker.openCamera({
                width: 300,
                height: 400,
                cropping: false,
                compressImageMaxHeight: 600,
                // compressImageQuality: 0.5,
            })
                .then(async selectedImages => {
                    this.setState({ selectedImage: selectedImages.path })
                })
                .catch(error => {

                    console.log(error + 'OPEN PICKER AGAIN');
                });
        } else {
            ImagePicker.openPicker({
                mediaType: 'photo',
                multiple: false,
                compressImageMaxHeight: 600,
                //  compressImageQuality: 0.8,
            })
                .then(async selectedImages => {
                    this.setState({ selectedImage: selectedImages.path })
                })
                .catch(error => {
                    console.log(error + 'OPEN PICKER AGAIN');
                });
        }
    }

    pan = (gestureState) => {
        const { x, y } = this.state
        const paddingTop = !this.state.isHorizontal ? DEVICE_HEIGHT * 0.1 : 0
        const paddingBottom = !this.state.isHorizontal ? DEVICE_HEIGHT * 0.15 : 0
        const maxX = (DEVICE_WIDTH / 2)
        const minX = -(DEVICE_WIDTH / 2)
        const maxY = (DEVICE_HEIGHT / 2) - paddingBottom
        const minY = (-DEVICE_HEIGHT / 2) + paddingTop
        const xDiff = gestureState.moveX - gestureState.previousMoveX
        const yDiff = gestureState.moveY - gestureState.previousMoveY
        let newX = x._value + xDiff
        let newY = y._value + yDiff
        if (newX < minX) {
            newX = minX
        } else if (newX > maxX) {
            newX = maxX
        }
        if (newY < minY) {
            newY = minY
        } else if (newY > maxY) {
            newY = maxY
        }
        this.setState({
            xValue: newX,
            yValue: newY
        })
        x.setValue(newX)
        y.setValue(newY)
    }
    componentDidMount() {
        this.setState({ interactionsComplete: true })
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow
        )
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide
        )
    }
    openWhiteBoard = (isBoardOpen) => {
        this.setState({
            isBoardOpen,
            editTextComponentOpen: isBoardOpen,
            index: 0
        }, () => {
        })
    }
    submitText = (text) => {
        this.setState({
            emozi: text,
            editTextComponentOpen: false
        })
    }
    goBack = () => {
        this.props.navigation.pop()
    }
    addOrEdit = () => {
        this.setState({
            editTextComponentOpen: true,
            textEntered: this.state.emozi
        })
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove()
        this.keyboardDidHideListener.remove()
    }



    captureScreen = () => {
        this.viewShot.capture().then(uri => {
            this.props?.updateImage(uri)
            this.props?.setModalVisible(false)

        })
    }
    onColorSelected = (color) => {
        this.setState({ selectedColor: color, isColorOpen: false })
    }


    setisDialogOpen = (flag) => {
        if (this.state.wasInfoTrue) {
            this.setState({ isDialogOpen: flag }, () => {
                setTimeout(() => {
                    this.openWhiteBoard(true)
                }, 500)
            })
        } else {
            this.setState({ isDialogOpen: flag })
        }
    }
    _keyboardDidShow() {
    }
    _keyboardDidHide() {
    }
    render() {
        const { uploadedImage } = this.props;
        const {
            x, y
        } = this.state
        const imageStyle = { left: x, top: y }
        const fontSizes = (DEVICE_WIDTH / DEVICE_HEIGHT) * this.state.fontSize
        return (
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ViewShot
                    style={{ alignItems: 'center', alignContent: 'center', justifyContent: 'center', width: DEVICE_WIDTH, height: DEVICE_HEIGHT - 50 - DEVICE_HEIGHT * 0.03, backgroundColor: 'black' }}
                    ref={(ref) => this.viewShot = ref}
                    options={{ format: 'jpg', quality: 1 }}>
                    <Image
                        source={{
                            uri: uploadedImage,
                        }}
                        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        resizeMode={'contain'}
                    >
                    </Image>
                    <Animated.View
                        {...this.Responder}
                        style={[imageStyle]}>
                        {(this.state.selectedImage != '' && this.props?.modalVisibleEditType == 'image') ?
                            <Image
                                ref={(ref) => this.inputRef = ref}
                                source={{
                                    uri: this.state?.selectedImage
                                }}
                                allowFontScaling={false} style={{
                                    alignSelf: 'center',
                                    textAlign: 'center',
                                    width: fontSizes * 2,
                                    aspectRatio: 9 / 16
                                }}
                            />
                            :
                            null
                        }


                    </Animated.View>

                </ViewShot>
                <View style={{
                    backgroundColor: '#000',
                    width: DEVICE_WIDTH,
                    position: 'absolute',
                    top: 0
                }}>
                    <View style={{ height: 50, backgroundColor: AppStyles.color.bgColor, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => this.props?.setModalVisible(false)}>
                            <Image source={require('../../../assets/bottomTab/close1.png')} style={{ height: 20, width: 20, tintColor: AppStyles.color.btnColor, marginLeft: 10 }} />
                        </TouchableOpacity>
                        <Text style={{ color: AppStyles.color.btnColor, fontSize: 20, fontWeight: 'bold' }}>Edit</Text>
                        <TouchableOpacity onPress={() => this.captureScreen()}>
                            <Image source={require('../../../assets/check.png')} style={{ height: 20, width: 20, tintColor: AppStyles.color.btnColor, marginRight: 10 }} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ alignItems: 'center', alignContent: 'center', justifyContent: 'center', width: DEVICE_WIDTH, backgroundColor: '#000', bottom: 0, paddingBottom: DEVICE_HEIGHT * 0.03, position: 'absolute' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', width: DEVICE_WIDTH, paddingHorizontal: 10 }}>
                        <Slider
                            value={this.state.fontSize}
                            onSlidingComplete={(e) => { this.setState({ fontSize: e, previousFontSize: e }) }}
                            maximumValue={DEVICE_HEIGHT / DEVICE_WIDTH * 100}
                            minimumValue={10}
                            style={{ width: DEVICE_WIDTH - 20, height: 40, alignSelf: 'center' }}
                            minimumTrackTintColor="#ffffff"
                            maximumTrackTintColor="#D3D3D3"
                        />
                    </View>
                    <View style={{ paddingHorizontal: 30, width: DEVICE_WIDTH }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => this.selectMethod()}>
                                <Image source={require('../../../assets/bottomTab/gallery.png')} style={{ height: 25, width: 25, tintColor: '#fff' }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

            </View >
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1, justifyContent: 'center'
    },
    topBar: {
        backgroundColor: '#000',
        paddingHorizontal: DEVICE_WIDTH * 0.03,
        width: DEVICE_WIDTH,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        position: 'absolute',
        paddingTop: Platform.OS == 'ios' ? DEVICE_HEIGHT * 0.05 : DEVICE_HEIGHT * 0.05,
        top: 0
    },
    indicator: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignSelf: 'center'
    },
    secondBar: { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', alignContent: 'center' },
    topIcons:
        Platform.OS == 'ios' ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 1,
            elevation: 1,
            color: 'white',
            fontSize: 30,
            alignSelf: 'center',
            alignItems: 'center'
        } : {
                textShadowColor: '#000',
                shadowOpacity: 0.8,
                textShadowRadius: 1,
                textShadowOffset: { width: 0, height: 1 },
                color: 'white',
                fontSize: 30,
                alignSelf: 'center',
                alignItems: 'center'
            },
    textAddView: { flex: 1, justifyContent: 'center', padding: 20 },
    baselayer: {
        position: 'absolute'
    },
    firstProgressLayer: {
        position: 'absolute',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent'
    },
    secondProgressLayer: {
        position: 'absolute',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent'
    },
    offsetLayer: {
        position: 'absolute',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent'
    },
    display: {
        position: 'absolute'
    }
})
