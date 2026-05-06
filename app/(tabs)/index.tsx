import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import OneSignal from 'react-onesignal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [lensTarihi, setLensTarihi] = useState<Date | null>(null);
  const [simdi, setSimdi] = useState(new Date());
  const [izinDurumuMesaji, setIzinDurumuMesaji] = useState('');
  const [izinIsteniyor, setIzinIsteniyor] = useState(false);
  const lensOmru = 30;

  const bekle = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const pushIzinDurumuOku = () => {
    const permission = (OneSignal as any)?.Notifications?.permission;
    const optedIn = (OneSignal as any)?.User?.PushSubscription?.optedIn;
    const subscriptionId = (OneSignal as any)?.User?.PushSubscription?.id;

    if (permission === true || permission === 'granted' || optedIn === true) {
      return { verildi: true, mesaj: 'Durum: Izin Verildi ✅' };
    }

    if (permission === false || permission === 'denied') {
      return { verildi: false, mesaj: 'Durum: Engellendi 🚫 (Safari ayarlarindan ac)' };
    }

    if (subscriptionId && optedIn !== false) {
      return { verildi: true, mesaj: 'Durum: Izin Verildi ✅' };
    }

    return { verildi: false, mesaj: 'Durum: Bekleniyor ⏳' };
  };

  const bildirimIzinDurumunuKontrolEt = async () => {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone) {
      setIzinDurumuMesaji('Durum: Bekleniyor ⏳');
      return;
    }

    try {
      const { mesaj } = pushIzinDurumuOku();
      setIzinDurumuMesaji(mesaj);
    } catch {
      setIzinDurumuMesaji('Durum: Bekleniyor ⏳');
    }
  };

  useEffect(() => {
    veriyiGetir();
    void bildirimIzinDurumunuKontrolEt();

    const interval = setInterval(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSimdi(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const veriyiKaydet = async (tarih: Date) => {
    try {
      await AsyncStorage.setItem('@lens_tarihi', tarih.toISOString());
      setLensTarihi(tarih);
      
      // İleride buraya OneSignal üzerinden 30 gün sonrası için "Etiket (Tag)" atama kodu ekleyeceğiz.
      // Şimdilik sadece tarihi kaydediyoruz.
      
      Alert.alert("Başarılı", "Yeni lens dönemi başlatıldı. ✅");
    } catch (e) {
      console.log("Hata");
    }
  };

  const veriyiGetir = async () => {
    try {
      const kaydedilen = await AsyncStorage.getItem('@lens_tarihi');
      if (kaydedilen) setLensTarihi(new Date(kaydedilen));
    } catch (e) {
      console.log("Hata");
    }
  };

  const gostergeData = () => {
    if (!lensTarihi) return { gun: "--", saat: "--", dak: "--", mesaj: "KAYIT YOK" };
    
    const bitis = lensTarihi.getTime() + (lensOmru * 24 * 60 * 60 * 1000);
    const fark = bitis - simdi.getTime();

    if (fark > 0) {
      const gun = Math.floor(fark / (1000 * 60 * 60 * 24));
      const saat = Math.floor((fark / (1000 * 60 * 60)) % 24);
      const dak = Math.floor((fark / 1000 / 60) % 60);
      return { 
        gun: gun < 10 ? `0${gun}` : gun.toString(), 
        saat: saat < 10 ? `0${saat}` : saat.toString(), 
        dak: dak < 10 ? `0${dak}` : dak.toString(), 
        mesaj: "KALAN SÜRE" 
      };
    }
    
    return { gun: "00", saat: "00", dak: "00", mesaj: "SÜRE DOLDU" };
  };

  const { gun, saat, dak, mesaj } = gostergeData();
  const izinVerildi = izinDurumuMesaji.includes('Izin Verildi');
  const bekliyor = izinDurumuMesaji.includes('Bekleniyor');
  const durumRengi = izinVerildi ? styles.statusSuccess : bekliyor ? styles.statusPending : styles.statusInfo;

  const bildirimIzniIste = async () => {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone) {
      setIzinDurumuMesaji("Durum: Ana ekrandan acman gerekiyor 📲");
      return;
    }

    try {
      setIzinIsteniyor(true);
      setIzinDurumuMesaji('Durum: OneSignal kontrol ediliyor... 🔎');

      const onesignalReady =
        typeof (OneSignal as any)?.Slidedown?.promptPush === 'function' ||
        typeof (OneSignal as any)?.showSlidedownPrompt === 'function';

      if (!onesignalReady) {
        setIzinDurumuMesaji('Durum: OneSignal hazir degil, sayfayi yenile 🔁');
        return;
      }

      // iOS Safari bazen Notification API tetiklenmeden OneSignal prompt'unu gostermeyebilir.
      if (typeof window.Notification !== 'undefined' && window.Notification.permission === 'default') {
        setIzinDurumuMesaji('Durum: Safari izin penceresi aciliyor... 🍏');
        await window.Notification.requestPermission();
        await bekle(250);
      }

      setIzinDurumuMesaji('Durum: OneSignal izin penceresi aciliyor... 🔔');

      if (typeof (OneSignal as any)?.showSlidedownPrompt === 'function') {
        await (OneSignal as any).showSlidedownPrompt();
      } else {
        await (OneSignal as any).Slidedown.promptPush();
      }

      await bekle(400);
      const { verildi } = pushIzinDurumuOku();

      if (verildi) {
        setIzinDurumuMesaji('Durum: Izin Verildi ✅');
      } else {
        setIzinDurumuMesaji('Durum: Bekleniyor ⏳ (Safari panelini kontrol et)');
      }
    } catch (error) {
      const hataMesaji = error instanceof Error ? error.message : 'bilinmeyen hata';
      setIzinDurumuMesaji(`Durum: Izin akisi basarisiz (${hataMesaji})`);
    } finally {
      setIzinIsteniyor(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>LENS TAKİP ARACI</Text>
        <Text style={styles.subTitle}>LENS TRACKER</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.statusText}>{mesaj}</Text>
        
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text key={`gun-${gun}`} style={styles.number}>{gun}</Text>
            <Text style={styles.unit}>GÜN</Text>
          </View>
          
          <Text style={styles.separator}>:</Text>

          <View style={styles.timeBlock}>
            <Text key={`saat-${saat}`} style={styles.number}>{saat}</Text>
            <Text style={styles.unit}>SAAT</Text>
          </View>

          <Text style={styles.separator}>:</Text>

          <View style={styles.timeBlock}>
            <Text key={`dak-${dak}`} style={styles.number}>{dak}</Text>
            <Text style={styles.unit}>DAK</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.7}
          onPress={() => veriyiKaydet(new Date())}
        >
          <Text style={styles.buttonText}>Lensi Bugün Yeniledim</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          activeOpacity={0.7}
          onPress={bildirimIzniIste}
          disabled={izinIsteniyor}
        >
          <Text style={styles.secondaryButtonText}>
            {izinIsteniyor ? 'Bildirim izni isteniyor...' : 'Bildirim İzni Ver'}
          </Text>
        </TouchableOpacity>

        {!!izinDurumuMesaji && (
          <View style={[styles.statusBadge, durumRengi]}>
            <Text style={styles.statusBadgeText}>{izinDurumuMesaji}</Text>
          </View>
        )}
        <Text style={styles.note}>Zamanında değişim göz sağlığını korur.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subTitle: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 5,
    marginTop: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 120,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeBlock: {
    alignItems: 'center',
    width: 95,
  },
  number: {
    color: '#FFFFFF',
    fontSize: 65,
    fontWeight: '900',
    includeFontPadding: false,
  },
  unit: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 5,
  },
  separator: {
    color: '#F59E0B',
    fontSize: 50,
    fontWeight: '500',
    marginHorizontal: 2,
    marginBottom: 35,
  },
  footer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#7C3AED',
    height: 55,
    width: '90%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#7C3AED',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: 'bold',
  },
  note: {
    color: '#475569',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 11,
  },
  statusBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusSuccess: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.5)',
  },
  statusPending: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.5)',
  },
  statusInfo: {
    backgroundColor: 'rgba(148,163,184,0.12)',
    borderColor: 'rgba(148,163,184,0.5)',
  },
});