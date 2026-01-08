import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../types';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.8;

// Kaaba coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export function QiblaSection() {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const compassRotation = useRef(new Animated.Value(0)).current;
  const subscriptionRef = useRef<any>(null);

  // Calculate Qibla direction from user's location
  const calculateQiblaDirection = (lat: number, lng: number): number => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const kaabaLatRad = (KAABA_LAT * Math.PI) / 180;
    const kaabaLngRad = (KAABA_LNG * Math.PI) / 180;

    const y = Math.sin(kaabaLngRad - lngRad);
    const x =
      Math.cos(latRad) * Math.tan(kaabaLatRad) -
      Math.sin(latRad) * Math.cos(kaabaLngRad - lngRad);

    let qibla = (Math.atan2(y, x) * 180) / Math.PI;
    qibla = (qibla + 360) % 360;

    return qibla;
  };

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        const qibla = calculateQiblaDirection(loc.coords.latitude, loc.coords.longitude);
        setQiblaDirection(qibla);
        setIsCalibrated(true);
      } catch (error) {
        setErrorMsg('Could not get your location');
      }
    })();
  }, []);

  // Subscribe to magnetometer
  useEffect(() => {
    const subscribe = async () => {
      const isAvailable = await Magnetometer.isAvailableAsync();
      if (!isAvailable) {
        setErrorMsg('Magnetometer is not available on this device');
        return;
      }

      Magnetometer.setUpdateInterval(50);
      subscriptionRef.current = Magnetometer.addListener((data) => {
        // Calculate heading from magnetometer data
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        
        // Normalize to 0-360
        if (Platform.OS === 'ios') {
          angle = (360 - angle) % 360;
        } else {
          angle = (angle + 360) % 360;
        }
        
        setHeading(angle);
      });
    };

    subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, []);

  // Animate compass rotation smoothly
  useEffect(() => {
    // The compass dial rotates opposite to heading so that North stays at the top when facing North
    // We subtract qiblaDirection so the Qibla marker on the dial points to actual Qibla
    const rotationValue = -(heading - qiblaDirection);
    
    Animated.timing(compassRotation, {
      toValue: rotationValue,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [heading, qiblaDirection]);

  const compassRotationInterpolate = compassRotation.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  // Check if pointing towards Qibla (within 10 degrees)
  // When the compass rotation brings the Qibla marker to the top (near 0), user is facing Qibla
  const normalizedDiff = ((heading - qiblaDirection) % 360 + 360) % 360;
  const isPointingToQibla = normalizedDiff < 10 || normalizedDiff > 350;

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color={COLORS.warning} />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Text style={styles.errorSubtext}>
            Please enable location services and try again
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>القبلة</Text>
        <Text style={styles.headerSubtitle}>Qibla Direction</Text>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        {!isCalibrated ? (
          <View style={styles.calibratingContainer}>
            <Ionicons name="sync" size={24} color={COLORS.primary} />
            <Text style={styles.calibratingText}>جاري تحديد موقعك...</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, isPointingToQibla && styles.statusBadgeActive]}>
            <Ionicons
              name={isPointingToQibla ? 'checkmark-circle' : 'compass'}
              size={20}
              color={isPointingToQibla ? '#10B981' : COLORS.textSecondary}
            />
            <Text style={[styles.statusText, isPointingToQibla && styles.statusTextActive]}>
              {isPointingToQibla ? 'أنت تواجه القبلة ✓' : 'أدر هاتفك حتى يشير السهم للأعلى'}
            </Text>
          </View>
        )}
      </View>

      {/* Compass */}
      <View style={styles.compassContainer}>
        {/* Fixed Arrow at Top - This is where user should align */}
        <View style={styles.fixedArrowContainer}>
          <View style={[styles.fixedArrow, isPointingToQibla && styles.fixedArrowActive]}>
            <Ionicons name="caret-up" size={40} color={isPointingToQibla ? '#10B981' : '#C9A962'} />
          </View>
          <Text style={[styles.fixedArrowLabel, isPointingToQibla && styles.fixedArrowLabelActive]}>
            اتجه هنا
          </Text>
        </View>

        {/* Rotating Compass Dial */}
        <View style={styles.compassOuter}>
          <Animated.View
            style={[
              styles.compassDial,
              { transform: [{ rotate: compassRotationInterpolate }] },
            ]}
          >
            {/* Cardinal Directions on rotating dial */}
            <View style={[styles.cardinalContainer, styles.northContainer]}>
              <Text style={[styles.cardinalText, styles.northText]}>N</Text>
            </View>
            <View style={[styles.cardinalContainer, styles.southContainer]}>
              <Text style={styles.cardinalText}>S</Text>
            </View>
            <View style={[styles.cardinalContainer, styles.eastContainer]}>
              <Text style={styles.cardinalText}>E</Text>
            </View>
            <View style={[styles.cardinalContainer, styles.westContainer]}>
              <Text style={styles.cardinalText}>W</Text>
            </View>

            {/* Degree Markers */}
            {Array.from({ length: 72 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.tickMark,
                  i % 9 === 0 && styles.majorTickMark,
                  { transform: [{ rotate: `${i * 5}deg` }, { translateY: -COMPASS_SIZE / 2 + 15 }] },
                ]}
              />
            ))}

            {/* Kaaba/Qibla Marker on the dial - points to Qibla direction */}
            <View style={styles.qiblaMarkerContainer}>
              <View style={[styles.qiblaMarker, isPointingToQibla && styles.qiblaMarkerActive]}>
                <Text style={styles.kaabaEmoji}>🕋</Text>
              </View>
              <View style={[styles.qiblaLine, isPointingToQibla && styles.qiblaLineActive]} />
            </View>
          </Animated.View>

          {/* Center Circle - Fixed */}
          <View style={[styles.centerCircle, isPointingToQibla && styles.centerCircleActive]}>
            <Text style={styles.degreeText}>{Math.round(qiblaDirection)}°</Text>
            <Text style={styles.degreeLabel}>Qibla</Text>
          </View>
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="navigate" size={18} color={COLORS.primary} />
            <Text style={styles.infoLabel}>الاتجاه الحالي</Text>
            <Text style={styles.infoValue}>{Math.round(heading)}°</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Ionicons name="location" size={18} color="#C9A962" />
            <Text style={styles.infoLabel}>اتجاه القبلة</Text>
            <Text style={styles.infoValue}>{Math.round(qiblaDirection)}°</Text>
          </View>
        </View>

        <View style={styles.makkahInfo}>
          <Text style={styles.makkahText}>🕋 الكعبة المشرفة - مكة المكرمة</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          ضع هاتفك بشكل مسطح وأدره حتى تصل الكعبة 🕋 للأعلى
        </Text>
        <Text style={styles.instructionsSubtext}>
          Hold your phone flat and rotate until the Kaaba reaches the top
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  calibratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calibratingText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  compassContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedArrowContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  fixedArrow: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#C9A962',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fixedArrowActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  fixedArrowLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#C9A962',
    fontWeight: '600',
  },
  fixedArrowLabelActive: {
    color: '#10B981',
  },
  compassOuter: {
    width: COMPASS_SIZE + 20,
    height: COMPASS_SIZE + 20,
    borderRadius: (COMPASS_SIZE + 20) / 2,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  compassDial: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
  },
  cardinalContainer: {
    position: 'absolute',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  northContainer: {
    top: 15,
  },
  southContainer: {
    bottom: 15,
  },
  eastContainer: {
    right: 15,
  },
  westContainer: {
    left: 15,
  },
  cardinalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  northText: {
    color: '#EF4444',
    fontSize: 18,
  },
  tickMark: {
    position: 'absolute',
    width: 1,
    height: 8,
    backgroundColor: COLORS.border,
  },
  majorTickMark: {
    width: 2,
    height: 12,
    backgroundColor: COLORS.textSecondary,
  },
  qiblaMarkerContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    height: COMPASS_SIZE / 2,
  },
  qiblaMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#C9A962',
    marginTop: -22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  qiblaMarkerActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  qiblaLine: {
    width: 4,
    height: COMPASS_SIZE / 2 - 50,
    backgroundColor: '#C9A962',
    borderRadius: 2,
    marginTop: 5,
  },
  qiblaLineActive: {
    backgroundColor: '#10B981',
  },
  kaabaEmoji: {
    fontSize: 22,
  },
  centerCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.border,
  },
  centerCircleActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  degreeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  degreeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  infoValue: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: 2,
  },
  infoDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  makkahInfo: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
  },
  makkahText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  instructionsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  instructionsSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
