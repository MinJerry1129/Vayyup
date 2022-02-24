import {Platform, NativeModules} from 'react-native';

export default class FullScreen {
  static enable() {
    if (Platform.OS === 'android') {
      NativeModules.FullScreen.enable();
    }
  }

  static disable() {
    if (Platform.OS === 'android') {
      NativeModules.FullScreen.disable();
    }
  }
}
