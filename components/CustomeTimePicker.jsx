import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Button,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const CustomeTimePicker = ({ time, setTime }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState(
    time ? time.getHours() % 12 || 12 : 12
  );
  const [selectedMinute, setSelectedMinute] = useState(
    time ? time.getMinutes() : 0
  );
  const [isAM, setIsAM] = useState((time ? time.getHours() : 12) < 12);

  const onConfirm = () => {
    const hour = isAM ? selectedHour % 12 : (selectedHour % 12) + 12;
    const newTime = new Date();
    newTime.setHours(hour);
    newTime.setMinutes(selectedMinute);
    newTime.setSeconds(0);
    setTime && setTime(newTime);
    setShowModal(false);
  };

  const renderOptions = (options, selectedValue, onPress) =>
    options.map((num) => (
      <TouchableOpacity
        key={num}
        style={[
          styles.optionButton,
          num === selectedValue && styles.selectedOption,
        ]}
        onPress={() => onPress(num)}
      >
        <Text
          style={[
            styles.optionText,
            num === selectedValue && styles.selectedOptionText,
          ]}
        >
          {num.toString().padStart(2, '0')}
        </Text>
      </TouchableOpacity>
    ));

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowModal(true)}>
        <Text style={styles.timeText}>
          {`${selectedHour.toString().padStart(2, '0')}:${selectedMinute
            .toString()
            .padStart(2, '0')} ${isAM ? 'AM' : 'PM'}`}
        </Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time</Text>

            {/* Hour & Minute Columns */}
            <View style={styles.columnsContainer}>
              {/* Hour Column */}
              <View style={styles.columnWrapper}>
                <Text style={styles.columnTitle}>Hour</Text>
                <ScrollView
                  style={styles.column}
                  contentContainerStyle={{ alignItems: 'center' }}
                  showsVerticalScrollIndicator={false}
                >
                  {renderOptions(HOURS, selectedHour, setSelectedHour)}
                </ScrollView>
              </View>

              {/* Minute Column */}
              <View style={styles.columnWrapper}>
                <Text style={styles.columnTitle}>Minute</Text>
                <ScrollView
                  style={styles.column}
                  contentContainerStyle={{ alignItems: 'center' }}
                  showsVerticalScrollIndicator={false}
                >
                  {renderOptions(MINUTES, selectedMinute, setSelectedMinute)}
                </ScrollView>
              </View>
            </View>

            {/* AM/PM */}
            <View style={styles.amPmRow}>
              <TouchableOpacity
                style={[styles.amPmButton, isAM && styles.selectedOption]}
                onPress={() => setIsAM(true)}
              >
                <Text
                  style={[styles.optionText, isAM && styles.selectedOptionText]}
                >
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.amPmButton, !isAM && styles.selectedOption]}
                onPress={() => setIsAM(false)}
              >
                <Text
                  style={[
                    styles.optionText,
                    !isAM && styles.selectedOptionText,
                  ]}
                >
                  PM
                </Text>
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setShowModal(false)} />
              <Button title="Confirm" onPress={onConfirm} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomeTimePicker;

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  timeText: { fontSize: 13},

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#faeedd',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, marginBottom: 20 },

  columnsContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  columnWrapper: { alignItems: 'center', marginHorizontal: 10 },
  columnTitle: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  column: { maxHeight: 200 },

  optionButton: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#86b952',
    width: 60,
    alignItems: 'center',
  },
  selectedOption: { backgroundColor: '#86b952' },
  optionText: { fontSize: 16 },
  selectedOptionText: { color: 'white', fontWeight: 'bold' },

  amPmRow: { flexDirection: 'row', marginVertical: 15 },
  amPmButton: {
    padding: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#86b952',
    alignItems: 'center',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});
