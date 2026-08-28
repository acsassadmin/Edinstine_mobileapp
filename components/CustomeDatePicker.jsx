// import React, { useState, useCallback, useMemo, memo } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   Button,
//   StyleSheet,
// } from 'react-native';
// import { ChevronLeft, ChevronRight } from 'lucide-react-native';

// const DayItem = memo(({ day, isSelected, onSelect }) => (
//   <TouchableOpacity
//     style={[styles.dayItem, isSelected && styles.selectedDay]}
//     onPress={() => onSelect(day)}
//   >
//     <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
//       {day.getDate()}
//     </Text>
//   </TouchableOpacity>
// ));

// const CustomDatePicker = ({ date, setDate }) => {
//   const [showModal, setShowModal] = useState(false);
//   const [tempDate, setTempDate] = useState(date || new Date());
//   const [currentMonth, setCurrentMonth] = useState(
//     (date || new Date()).getMonth(),
//   );
//   const [currentYear, setCurrentYear] = useState(
//     (date || new Date()).getFullYear(),
//   );

//   const getDaysInMonth = useCallback((month, year) => {
//     const date = new Date(year, month, 1);
//     const days = [];
//     while (date.getMonth() === month) {
//       days.push(new Date(date));
//       date.setDate(date.getDate() + 1);
//     }
//     return days;
//   }, []);

//   const onConfirm = useCallback(() => {
//     setDate(tempDate);
//     setShowModal(false);
//   }, [setDate, tempDate]);

//   const onCancel = useCallback(() => {
//     setTempDate(date || new Date());
//     setCurrentMonth((date || new Date()).getMonth());
//     setCurrentYear((date || new Date()).getFullYear());
//     setShowModal(false);
//   }, [date]);

//   const prevMonth = useCallback(() => {
//     if (currentMonth === 0) {
//       setCurrentMonth(11);
//       setCurrentYear(currentYear - 1);
//     } else {
//       setCurrentMonth(currentMonth - 1);
//     }
//   }, [currentMonth, currentYear]);

//   const nextMonth = useCallback(() => {
//     if (currentMonth === 11) {
//       setCurrentMonth(0);
//       setCurrentYear(currentYear + 1);
//     } else {
//       setCurrentMonth(currentMonth + 1);
//     }
//   }, [currentMonth, currentYear]);

//   const daysInMonth = useMemo(
//     () => getDaysInMonth(currentMonth, currentYear),
//     [getDaysInMonth, currentMonth, currentYear],
//   );

//   const handleSelectDay = useCallback(day => {
//     setTempDate(day);
//   }, []);

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPress={() => setShowModal(true)}>
//         <Text style={styles.dateText}>{tempDate.toLocaleDateString()}</Text>
//       </TouchableOpacity>

//       <Modal visible={showModal} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Select Date</Text>

//             <View style={styles.monthNav}>
//               <TouchableOpacity onPress={prevMonth}>
//                 <ChevronLeft size={24} color="black" style={styles.navText} />
//               </TouchableOpacity>
//               <Text style={styles.monthTitle}>
//                 {new Date(currentYear, currentMonth).toLocaleString('default', {
//                   month: 'long',
//                   year: 'numeric',
//                 })}
//               </Text>
//               <TouchableOpacity onPress={nextMonth}>
//                 <ChevronRight size={24} color="black" style={styles.navText} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.daysGrid}>
//               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
//                 <Text key={d} style={styles.dayLabel}>
//                   {d}
//                 </Text>
//               ))}

//               {daysInMonth.map(d => (
//                 <DayItem
//                   key={d.toISOString()}
//                   day={d}
//                   isSelected={d.toDateString() === tempDate.toDateString()}
//                   onSelect={handleSelectDay}
//                 />
//               ))}
//             </View>

//             <View style={styles.modalActions}>
//               <Button title="Cancel" onPress={onCancel} />
//               <Button title="Confirm" onPress={onConfirm} />
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   dateText: {
//     fontSize: 13,
//     color: '#333',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     width: '90%',
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//   },
//   modalTitle: { fontSize: 18, marginBottom: 20 },
//   monthNav: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   navText: { fontSize: 20, color: '#86b952', paddingHorizontal: 10 },
//   monthTitle: { fontSize: 18, fontWeight: 'bold' },
//   daysGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
//   dayLabel: {
//     width: '14.28%',
//     textAlign: 'center',
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   dayItem: {
//     width: '14.28%',
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 2,
//   },
//   selectedDay: { backgroundColor: '#86b952', borderRadius: 20 },
//   dayText: { fontSize: 16 },
//   selectedDayText: { color: 'white', fontWeight: 'bold' },
//   modalActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginTop: 20,
//   },
// });

// export default CustomDatePicker;

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const DayItem = memo(({ day, isSelected, onSelect }) => {
  // Render empty views for padding slots
  if (!day) {
    return <View style={styles.dayItem} />;
  }

  return (
    <TouchableOpacity
      style={[styles.dayItem, isSelected && styles.selectedDay]}
      onPress={() => onSelect(day)}
    >
      <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
        {day.getDate()}
      </Text>
    </TouchableOpacity>
  );
});

const CustomDatePicker = ({ date, setDate }) => {
  const [showModal, setShowModal] = useState(false);
  const [tempDate, setTempDate] = useState(date || new Date());

  const [currentMonth, setCurrentMonth] = useState(
    (date || new Date()).getMonth(),
  );
  const [currentYear, setCurrentYear] = useState(
    (date || new Date()).getFullYear(),
  );

  // Generates array with leading empty slots matching the starting weekday
  const getDaysInMonth = useCallback((month, year) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const date = new Date(year, month, 1);
    const days = [];

    // Add empty padding elements for days before the 1st of the month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, []);

  const onConfirm = useCallback(() => {
    setDate(tempDate);
    setShowModal(false);
  }, [setDate, tempDate]);

  const onCancel = useCallback(() => {
    const activeDate = date || new Date();
    setTempDate(activeDate);
    setCurrentMonth(activeDate.getMonth());
    setCurrentYear(activeDate.getFullYear());
    setShowModal(false);
  }, [date]);

  const prevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  }, [currentMonth]);

  const daysInMonth = useMemo(
    () => getDaysInMonth(currentMonth, currentYear),
    [getDaysInMonth, currentMonth, currentYear],
  );

  const handleSelectDay = useCallback(day => {
    setTempDate(day);
  }, []);

  const displayDate = date || tempDate;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setShowModal(true)}>
        <Text style={styles.dateText}>{displayDate.toLocaleDateString()}</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>

            <View style={styles.monthNav}>
              <TouchableOpacity onPress={prevMonth}>
                <ChevronLeft size={24} color="#86b952" style={styles.navText} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {new Date(currentYear, currentMonth).toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <TouchableOpacity onPress={nextMonth}>
                <ChevronRight
                  size={24}
                  color="#86b952"
                  style={styles.navText}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.daysGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <Text key={d} style={styles.dayLabel}>
                  {d}
                </Text>
              ))}
              {daysInMonth.map((d, index) => (
                <DayItem
                  key={d ? d.toISOString() : `empty-${index}`}
                  day={d}
                  isSelected={
                    d ? d.toDateString() === tempDate.toDateString() : false
                  }
                  onSelect={handleSelectDay}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={onCancel} color="#999" />
              <Button title="Confirm" onPress={onConfirm} color="#86b952" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  navText: {
    paddingHorizontal: 10,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  dayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#666',
  },
  dayItem: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  selectedDay: {
    backgroundColor: '#86b952',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});

export default CustomDatePicker;
