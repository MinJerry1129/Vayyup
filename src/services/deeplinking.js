import {Linking} from 'react-native';
import DeepLinking from 'react-native-deep-linking';

export const useDeeplinking = () => {
    Linking.addEventListener('url', ({ url }) => {
        Linking.canOpenURL(url).then((supported) => {
          if (supported) {
            DeepLinking.evaluateUrl(url);
          }
        });
      });

    DeepLinking.addScheme('http://'); 

    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          DeepLinking.evaluateUrl(url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
    
    const cleanUpDeeplinking = () => {
        Linking.removeEventListener('url');
    };

    return {cleanUpDeeplinking};

};

/**
 * Finds the item by its unique id.
 * @typedef {function(): void} Callback
 */

/**
 * Connect the deeplinked feeds to the event.
 * 
 * @param {Callback} callback 
 */
export const deeplinkFeed = (callback) => {
    DeepLinking.addRoute('/vayyup.com/:type/:id', (response) => {
        // Check whether the user is logged in.
        if (response.type === 'videos' || response.type === 'entries') {
            callback();
        }
    });
};