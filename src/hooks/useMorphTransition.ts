// hooks/useMorphTransition.ts

import { useEffect, useState } from "react";
import type { ViewStyle } from "react-native";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type AnimatedStyle,
} from "react-native-reanimated";

interface UseMorphTransitionOptions {
  /** Width of the content being morphed in, used to pivot the scale from its top-right corner. */
  width: number;
  /** Height of the content being morphed in, used to pivot the scale from its top-right corner. */
  height: number;
  /** Fires once the exit animation fully finishes — safe point to reset internal state. */
  onExited?: () => void;
}

interface UseMorphTransitionResult {
  /** Stays true slightly past `visible={false}` so the exit animation can finish before unmount. */
  isMounted: boolean;
  contentStyle: AnimatedStyle<ViewStyle>;
  backdropStyle: AnimatedStyle<ViewStyle>;
}

const INITIAL_SCALE = 0.3;
const INITIAL_LIFT_OFFSET = -10;

const ENTER_OPACITY_DURATION = 400;
const ENTER_LIFT_SPRING = { damping: 16, stiffness: 250, mass: 0.6 };
const ENTER_SCALE_Y_SPRING = { damping: 16, stiffness: 250, mass: 0.7 };
const ENTER_SCALE_X_SPRING = { damping: 14, stiffness: 250, mass: 0.85 };

const EXIT_OPACITY_DURATION = 130;
const EXIT_TRANSFORM_DURATION = 150;
const EXIT_LIFT_OFFSET = -8;
const EXIT_SCALE_X = 0.45;
const EXIT_SCALE_Y = 0.4;

export function useMorphTransition(
  visible: boolean,
  { width, height, onExited }: UseMorphTransitionOptions
): UseMorphTransitionResult {
  const [isMounted, setIsMounted] = useState(false);

  const opacity = useSharedValue(0);
  const liftY = useSharedValue(INITIAL_LIFT_OFFSET);
  const scaleX = useSharedValue(INITIAL_SCALE);
  const scaleY = useSharedValue(INITIAL_SCALE);

  // Deliberately depends on `visible` only — `onExited` is read from the
  // closure at the moment this effect fires, not tracked as a dependency.
  // Adding it to the deps array would re-trigger the enter/exit animation
  // any time the parent re-renders with a fresh inline callback.
  useEffect(() => {
    if (visible) {
      setIsMounted(true);

      opacity.value = withTiming(1, { duration: ENTER_OPACITY_DURATION });
      liftY.value = withSpring(0, ENTER_LIFT_SPRING);
      scaleY.value = withSpring(1, ENTER_SCALE_Y_SPRING);
      scaleX.value = withSpring(1, ENTER_SCALE_X_SPRING);
    } else {
      opacity.value = withTiming(0, { duration: EXIT_OPACITY_DURATION });
      liftY.value = withTiming(EXIT_LIFT_OFFSET, { duration: EXIT_TRANSFORM_DURATION });
      scaleX.value = withTiming(EXIT_SCALE_X, { duration: EXIT_TRANSFORM_DURATION });
      scaleY.value = withTiming(
        EXIT_SCALE_Y,
        { duration: EXIT_TRANSFORM_DURATION },
        (finished) => {
          if (finished) {
            runOnJS(setIsMounted)(false);
            if (onExited) runOnJS(onExited)();
          }
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const contentStyle = useAnimatedStyle<ViewStyle>(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: halfWidth },
      { translateY: -halfHeight + liftY.value },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
      { translateX: -halfWidth },
      { translateY: halfHeight },
    ],
  }));

  const backdropStyle = useAnimatedStyle<ViewStyle>(() => ({
    opacity: opacity.value,
  }));

  return { isMounted, contentStyle, backdropStyle };
}