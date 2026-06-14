import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { PinSetupScreen } from '@/components/PinSetupScreen';
import { useAuth } from '@/context/AuthContext';

/**
 * Reached only via the parent guard (so the session is already unlocked).
 * Sets a brand-new PIN with the standard enter + confirm flow.
 */
export default function ChangePinScreen() {
  const { changePin } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <PinSetupScreen
      showBranding={false}
      enterTitle={t('pin.newPin')}
      subtitle={t('pin.setupSubtitle')}
      onComplete={async (pin) => {
        await changePin(pin);
        if (router.canGoBack()) router.back();
      }}
    />
  );
}
