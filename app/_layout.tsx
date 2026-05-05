import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import OneSignal from 'react-onesignal';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // TypeScript'in 'notifyButton' hatası vermemesi için 'as any' kullandık
      (OneSignal as any).init({
        appId: "50aa1f7a-986c-4b0d-b478-4ec28c353458",
        safari_web_id: "web.onesignal.auto.01b20842-ed7c-48c4-bd42-e78491d78625",
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: true, // Zili zorla açar
          position: 'bottom-right',
          theme: 'dark',
          size: 'medium',
          colors: {
            'circle.background': '#7C3AED', // Senin mor buton rengin
            'circle.foreground': 'white',
            'badge.background': 'red',
            'badge.foreground': 'white',
            'badge.bordercolor': 'white',
            'pulse.color': 'white',
            'dialog.button.background.hover': '#7C3AED',
            'dialog.button.background.active': '#7C3AED',
            'dialog.button.background': '#7C3AED',
            'dialog.button.foreground': 'white'
          },
          text: {
            'tip.state.unsubscribed': 'Bildirimleri aç',
            'tip.state.subscribed': 'Bildirimler açık',
            'tip.state.blocked': 'Bildirimleri engelledin',
            'message.prenotify': 'Lens değişim bildirimlerini almak ister misin?',
            'message.action.subscribed': 'Teşekkürler!',
            'message.action.resubscribed': 'Bildirimler tekrar aktif.',
            'message.action.unsubscribed': 'Bildirimler kapatıldı.',
            'dialog.main.title': 'Bildirim Ayarları',
            'dialog.main.button.subscribe': 'ABONE OL',
            'dialog.main.button.unsubscribe': 'ABONELİKTEN ÇIK',
            'dialog.blocked.title': 'Bildirim Engellendi',
            'dialog.blocked.message': 'Bildirim almak için tarayıcı ayarlarından izin vermelisin.'
          }
        },
      });
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}