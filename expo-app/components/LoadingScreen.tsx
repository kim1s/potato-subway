import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const MESSAGES = [
  'Steaming potatoes...',
  'Boiling potatoes...',
  'Mashing potatoes...',
  'Frying potatoes...',
  'Baking potatoes...',
];

export default function LoadingScreen({ visible }: { visible: boolean }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
      return;
    }
    screenOpacity.setValue(1);

    let index = 0;
    const cycle = () => {
      setMsgIndex(index % MESSAGES.length);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1000),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        index += 1;
        cycle();
      });
    };
    cycle();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <Animated.Text style={[styles.message, { opacity }]}>
        {MESSAGES[msgIndex]}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f0ee',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  message: {
    fontSize: 16,
    color: '#555',
    fontStyle: 'italic',
  },
});
