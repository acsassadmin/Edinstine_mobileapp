import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import TopBar from '../../components/ParentTobBar';
import BackButton from '../../components/BackButton';
import axios from 'axios';
import { BASEURL } from '../../appurls';
import { useUser } from '../../context/UserContext';
import { useRoute } from '@react-navigation/native';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';

const RaiseConcern = () => {
  const route = useRoute();
  const { appUser, token, user } = useUser();

  const concernToEdit = route.params?.concernData;
  const isEditMode = !!concernToEdit;

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const richText = useRef();
  const [htmlContent, setHtmlContent] = useState('');

  // Fetch Categories
  const getConcernCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(
        `${BASEURL}/api/parent/concern-categories/?school_id=${user.school_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCategories(response.data);
    } catch (error) {
      // console.log("Error fetching categories", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch Specific Concern Details (for Edit Mode)
  const getConcernDetails = async id => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASEURL}/api/parent/ParentConcernView/?id=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.results && response.data.results.length > 0) {
        const data = response.data.results[0];

        // Set State
        setSubject(data.subject);
        setHtmlContent(data.content);

        // Set Category Object manually based on ID match
        // We need to wait for categories to load or set it afterwards
        if (categories.length > 0) {
          const catObj = categories.find(c => c.id === data.category);
          if (catObj) setSelectedCategory(catObj);
        }
      }
    } catch (error) {
      // console.log("Error fetching concern details", error);
      Alert.alert('Error', 'Could not load concern details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getConcernCategories();
  }, []);

  // Effect to handle loading data when entering Edit Mode
  useEffect(() => {
    if (isEditMode && concernToEdit) {
      setSubject(concernToEdit.subject);
      setHtmlContent(concernToEdit.content);

      if (categories.length === 0) {
      } else {
        const catObj = categories.find(c => c.id === concernToEdit.category);
        if (catObj) setSelectedCategory(catObj);
      }
    }
  }, [isEditMode, concernToEdit, categories]);

  // Helper to set content in RichEditor programmatically
  useEffect(() => {
    if (isEditMode && htmlContent && richText.current) {
      richText.current.setContentHTML(htmlContent);
    }
  }, [isEditMode, htmlContent]);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject.');
      return;
    }

    setLoading(true);
    console.log('user', user);

    try {
      const payload = {
        category: selectedCategory.id,
        student: appUser?.id,
        school: user.school_id,
        branch: user.branch_id,
        academic_year: user.academic_year_id,
        subject: subject,
        content: htmlContent || '<p>No content</p>',
        created_by: parseInt(user.user_id),
      };

      if (isEditMode) {
        await axios.put(
          `${BASEURL}/api/parent/ParentConcernView/${concernToEdit?.id}/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Referer: BASEURL,
            },
          },
        );

        Alert.alert('Success', 'Concern updated successfully!');
      } else {
        payload.status = 'OPEN';
        await axios.post(`${BASEURL}/api/parent/ParentConcernView/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert('Success', 'Your concern has been raised successfully!');
        setSelectedCategory(null);
        setSubject('');
      }
    } catch (error) {
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.log('403 Server Response Data:', error.response.data);
        console.log('403 Server Response Status:', error.response.status);
        console.log('403 Server Response Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log('No response received:', error.request);
      } else {
        console.log('Error setup message:', error.message);
      }

      Alert.alert(
        'Error',
        isEditMode ? 'Failed to update concern.' : 'Failed to submit concern.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Button Text
  const buttonText = isEditMode ? 'Update Concern' : 'Submit Concern';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <TopBar />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          borderWidth: 0,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
            padding: 8,
          }}
        >
          <BackButton />
          <Text style={{ fontWeight: '800', fontSize: 18 }}>
            {isEditMode ? 'Edit Concern' : 'Raise a concern'}
          </Text>
        </View>

        <Text style={{ fontWeight: '650', fontSize: 14, padding: 10 }}>
          {isEditMode
            ? 'Update your concern details below.'
            : 'Share your concern, feedback, to receive assistance and support.'}
        </Text>

        <Text
          style={{
            paddingHorizontal: 10,
            fontWeight: '700',
            marginTop: 10,
            fontSize: 17,
          }}
        >
          Concern Category
        </Text>

        {categoriesLoading ? (
          <View
            style={{
              height: 100,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size={30} color={'black'} />
          </View>
        ) : (
          <View style={styles.categoryContainer}>
            {categories?.map(item => {
              const isSelected = selectedCategory?.id === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.categoryBox,
                    isSelected && styles.selectedCategoryBox,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.selectedCategoryText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Conditional Form: Only show if category is selected OR if editing (so existing fields stay visible) */}
        {(selectedCategory || isEditMode) && (
          <View style={styles.formContainer}>
            {/* Subject Input */}
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={subject}
              onChangeText={setSubject}
            />

            {/* Rich Text Editor */}
            <Text style={styles.label}>Content</Text>
            <View style={styles.quillContainer}>
              <RichToolbar
                editor={richText}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.heading1,
                  actions.heading2,
                  actions.undo,
                  actions.redo,
                ]}
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  backgroundColor: '#f5f5f5',
                }}
              />

              <RichEditor
                ref={richText}
                placeholder="Describe your concern..."
                initialContentHTML=""
                // Note: initialContentHTML only works on mount.
                // We use setContentHTML in useEffect for editing.
                style={{
                  minHeight: 200,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderTopWidth: 0,
                  backgroundColor: '#fff',
                }}
                editorStyle={{
                  backgroundColor: '#fff',
                  color: '#000',
                  placeholderColor: '#999',
                }}
                onChange={html => {
                  setHtmlContent(html);
                }}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>{buttonText}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RaiseConcern;

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    // height: 10,
  },
  categoryBox: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86b952',
    justifyContent: 'center',
    alignItems: 'center',
    width: 110,
    aspectRatio: 1,
  },
  selectedCategoryBox: {
    backgroundColor: '#86b952',
    borderColor: '#86b952',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  formContainer: {
    padding: 15,
  },
  label: {
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 4,
    color: '#333',
    fontSize: 17,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  quillContainer: {
    marginBottom: 30,
    height: 240,
  },
  submitButton: {
    backgroundColor: '#86b952',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
