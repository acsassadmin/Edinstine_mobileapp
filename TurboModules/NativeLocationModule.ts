import { Platform, type TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  startLocationUpdates(): void;
  stopLocationUpdates(): void;
}

const iOSMock: Spec = {
  startLocationUpdates: () => {},
  stopLocationUpdates: () => {},
};

const getModule = (): Spec => {
  if (Platform.OS === 'ios') {
    return iOSMock;
  }

  return TurboModuleRegistry.getEnforcing<Spec>('LocationModule');
};

export default getModule();
