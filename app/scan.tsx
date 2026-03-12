// EST SB Smart Attendance - QR Code Scanner Screen (Fully Functional)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ChevronLeft, Flashlight, FlashlightOff, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors, BorderRadius } from '@/src/constants/theme';
import { useData } from '@/src/context/data-context';
import { useAuth } from '@/src/context/auth-context';
import * as Haptics from 'expo-haptics';

const { width: _width, height: _height } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { sessions, markAttendance, addNotification } = useData();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [moduleInfo, setModuleInfo] = useState<{ name: string; time: string } | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for scan frame
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!permission) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    if (Platform.OS !== 'web') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      // Find active session with matching QR code
      const activeSession = sessions.find(s =>
        s.status === 'active' && s.qrCode === data
      );

      if (!activeSession) {
        Alert.alert(
          'QR Code invalide',
          'Ce QR code n\'est pas valide ou la session a expiré.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        return;
      }

      // Check if QR code is expired
      if (activeSession.qrCodeExpiresAt && new Date(activeSession.qrCodeExpiresAt) < new Date()) {
        Alert.alert(
          'QR Code expiré',
          'Ce QR code a expiré. Veuillez demander au professeur de générer un nouveau code.',
          [{ text: 'OK', onPress: () => setScanned(false) }]
        );
        return;
      }

      // Mark attendance
      if (user?.id) {
        await markAttendance(activeSession.id, user.id, 'present');

        // Add notification
        await addNotification({
          userId: user.id,
          title: 'Présence confirmée',
          message: `Votre présence a été enregistrée pour le cours de ${activeSession.moduleName}`,
          type: 'success',
          read: false,
        });

        setModuleInfo({
          name: activeSession.moduleName,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        });

        // Show success animation
        setShowSuccess(true);
        Animated.spring(successScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();

        // Navigate back after delay
        setTimeout(() => {
          router.back();
        }, 2500);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la présence', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  const toggleTorch = () => {
    setTorchEnabled(!torchEnabled);
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={AppColors.gradientSplash} style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Accès à la caméra</Text>
          <Text style={styles.permissionText}>
            Cette application nécessite l'accès à la caméra pour scanner les QR codes de présence.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torchEnabled}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={28} color={AppColors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scanner QR Code</Text>
            <TouchableOpacity onPress={toggleTorch} style={styles.flashButton}>
              {torchEnabled ? (
                <Flashlight size={24} color={AppColors.white} />
              ) : (
                <FlashlightOff size={24} color={AppColors.white} />
              )}
            </TouchableOpacity>
          </View>

          {/* Scan Frame */}
          <View style={styles.scanArea}>
            {!showSuccess ? (
              <Animated.View
                style={[
                  styles.scanFrame,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                {/* Corner markers */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />

                {/* Scan line */}
                <Animated.View style={styles.scanLine} />
              </Animated.View>
            ) : (
              <Animated.View
                style={[
                  styles.successContainer,
                  { transform: [{ scale: successScale }] },
                ]}
              >
                <View style={styles.successCircle}>
                  <CheckCircle2 size={80} color={AppColors.lightGreen} strokeWidth={2} />
                </View>
                <Text style={styles.successTitle}>Présence enregistrée!</Text>
                {moduleInfo && (
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleName}>{moduleInfo.name}</Text>
                    <Text style={styles.moduleTime}>{moduleInfo.time}</Text>
                  </View>
                )}
              </Animated.View>
            )}
          </View>

          {/* Instructions */}
          {!showSuccess && (
            <View style={styles.instructions}>
              <Text style={styles.instructionText}>
                Placez le QR code dans le cadre pour marquer votre présence
              </Text>
            </View>
          )}
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.primaryDarkBlue,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: AppColors.lightBlue,
    borderWidth: 4,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: AppColors.lightBlue,
    shadowColor: AppColors.lightBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  instructions: {
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  instructionText: {
    textAlign: 'center',
    fontSize: 16,
    color: AppColors.white,
    lineHeight: 24,
  },
  successContainer: {
    alignItems: 'center',
  },
  successCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: AppColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 16,
  },
  moduleInfo: {
    alignItems: 'center',
  },
  moduleName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.lightBlue,
  },
  moduleTime: {
    fontSize: 14,
    color: AppColors.white,
    marginTop: 4,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: AppColors.white,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.primaryBlue,
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});
