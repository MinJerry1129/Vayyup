import VersionCheck from 'react-native-version-check';

const currentVersion = VersionCheck.getCurrentVersion();

export const validateVersion = async () => {
  const appStoreVersion = await VersionCheck.getLatestVersion();
  return VersionCheck.needUpdate({
    currentVersion: currentVersion,
    latestVersion: appStoreVersion,
  });
};

export const configKeys = {
  algolioAppId: 'TBAW5MC438',
  algolioAdminKey: '6cec440251fa430747d494b6f31883fd',
  // googleWebClientId:'478421371696-mbidir7d28vl626cln03cp7jdbo4clr9.apps.googleusercontent.com',
  googleWebClientId:
    '478421371696-mbidir7d28vl626cln03cp7jdbo4clr9.apps.googleusercontent.com',
  fcmSenderId: '478421371696',
  domainUriPrefix: 'https://vayyuptest.page.link',
};
