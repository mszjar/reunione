import React from 'react';
import { RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';

const medievalTheme: Theme = {
  blurs: {
    modalOverlay: 'blur(8px)',
  },
  colors: {
    accentColor: '#b37e3b',
    accentColorForeground: '#f5f3ef',
    actionButtonBorder: '#7e5522',
    actionButtonBorderMobile: '#7e5522',
    actionButtonSecondaryBackground: '#d4a257',
    closeButton: '#3d2b13',
    closeButtonBackground: '#f0d395',
    connectButtonBackground: '#d4a257',
    connectButtonBackgroundError: '#912e2e',
    connectButtonInnerBackground: '#b37e3b',
    connectButtonText: '#3d2b13',
    connectButtonTextError: '#f5f3ef',
    connectionIndicator: '#46954a',
    downloadBottomCardBackground: '#f0d395',
    downloadTopCardBackground: '#d4a257',
    error: '#912e2e',
    generalBorder: '#7e5522',
    generalBorderDim: '#a3763a',
    menuItemBackground: '#f0d395',
    modalBackground: '#f5f3ef',
    modalBorder: '#7e5522',
    modalText: '#3d2b13',
    modalTextDim: '#6b5a3d',
    modalTextSecondary: '#6b5a3d',
    profileAction: '#d4a257',
    profileActionHover: '#b37e3b',
    profileForeground: '#f5f3ef',
    selectedOptionBorder: '#b37e3b',
    standby: '#b37e3b',
    modalBackdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: {
    body: 'serif',
  },
  radii: {
    actionButton: '12px',
    connectButton: '12px',
    menuButton: '12px',
    modal: '12px',
    modalMobile: '12px',
  },
  shadows: {
    connectButton: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    dialog: '0px 8px 32px rgba(0, 0, 0, 0.32)',
    profileDetailsAction: '0px 2px 6px rgba(37, 41, 46, 0.04)',
    selectedOption: '0px 2px 6px rgba(0, 0, 0, 0.24)',
    selectedWallet: '0px 2px 6px rgba(0, 0, 0, 0.24)',
    walletLogo: '0px 2px 16px rgba(0, 0, 0, 0.16)',
  },
};

interface MedievalRainbowKitProviderProps {
  children: React.ReactNode;
}

const MedievalRainbowKitProvider: React.FC<MedievalRainbowKitProviderProps> = ({ children }) => {
  return (
    <RainbowKitProvider
      modalSize="compact"
      theme={medievalTheme}
    >
      {children}
    </RainbowKitProvider>
  );
};

export default MedievalRainbowKitProvider;
