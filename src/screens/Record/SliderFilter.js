import React, {Component} from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';

import {Surface} from 'gl-react-native';
import ImageFilters from 'react-native-gl-image-filters';
import Filter from './Filter';
import {AppStyles} from 'src/AppStyles';

const width = Dimensions.get('window').width;

const settings = [
  {
    name: 'hue',
    minValue: 0,
    maxValue: 6.3,
  },
  {
    name: 'blur',
    minValue: 0,
    maxValue: 30,
  },
  {
    name: 'sepia',
    minValue: -5,
    maxValue: 5,
  },
  {
    name: 'sharpen',
    minValue: 0,
    maxValue: 15,
  },
  {
    name: 'negative',
    minValue: -2.0,
    maxValue: 2.0,
  },
  {
    name: 'contrast',
    minValue: -10.0,
    maxValue: 10.0,
  },
  {
    name: 'saturation',
    minValue: 0.0,
    maxValue: 2,
  },
  {
    name: 'brightness',
    minValue: 0,
    maxValue: 5,
  },
  {
    name: 'temperature',
    minValue: 0.0,
    maxValue: 40000.0,
  },
];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      image: this.props.route.params.image[0],
      filterImage: '',
    };
  }

  state = {
    ...settings,
    hue: 0,
    blur: 0,
    sepia: 0,
    sharpen: 0,
    negative: 0,
    contrast: 1,
    saturation: 1,
    brightness: 1,
    temperature: 6500,
  };

  saveImage = async () => {
    if (!this.image) return;

    const result = await this.image.glView.capture();
    this.setState({filterImage: result.localUri});
    console.log('***', this.state.filterImage);
  };

  render() {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: AppStyles.color.bgColor,
          position: 'absolute',
          top: 0,
        }}>
        {/* backgroundColor:AppStyles.color.btnColor */}
        <View
          style={{
            height: 50,
            backgroundColor: AppStyles.color.bgColor,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <Image
              source={require('../../../assets/previous.png')}
              style={{
                height: 30,
                width: 30,
                tintColor: AppStyles.color.btnColor,
              }}
            />
          </TouchableOpacity>
          <Text
            style={{
              color: AppStyles.color.btnColor,
              fontSize: 20,
              fontWeight: 'bold',
            }}>
            Filters
          </Text>
          <TouchableOpacity
            onPress={() => {
              this.saveImage();
              this.props.navigation.navigate('AddCaptions', {
                image: this.state.filterImage,
              });
            }}>
            <Image
              source={require('../../../assets/check.png')}
              style={{
                height: 30,
                width: 30,
                tintColor: AppStyles.color.btnColor,
              }}
            />
          </TouchableOpacity>
        </View>

        <Surface
          style={{width, height: width}}
          ref={(ref) => (this.image = ref)}>
          <ImageFilters {...this.state} width={width} height={width}>
            {{uri: this.state.image}}
          </ImageFilters>
        </Surface>
        {settings.map((filter) => (
          <ScrollView style={{backgroundColor: AppStyles.color.btnColor}}>
            <Filter
              key={filter.name}
              name={filter.name}
              minimum={filter.minValue}
              maximum={filter.maxValue}
              onChange={(value) => this.setState({[filter.name]: value})}
            />
          </ScrollView>
        ))}
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  content: {marginTop: 20, marginHorizontal: 20},
  button: {marginVertical: 20, borderRadius: 0},
});
