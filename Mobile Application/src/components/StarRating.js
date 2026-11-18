import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';

export const StarRating = ({ rating = 5, onRatingChange, size = 32, disabled = false }) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        return (
          <TouchableOpacity
            key={star}
            disabled={disabled}
            onPress={() => onRatingChange && onRatingChange(star)}
            activeOpacity={0.7}
            style={styles.starBtn}
          >
            <Star
              size={size}
              color={isFilled ? '#f59e0b' : '#475569'}
              fill={isFilled ? '#f59e0b' : 'transparent'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 14,
    gap: 8,
  },
  starBtn: {
    padding: 4,
  },
});

export default StarRating;
