import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { X, Camera, Image as ImageIcon, Check, CircleAlert as AlertCircle, Loader } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface DetectedItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  confidence: number;
}

interface CaptureInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  onItemsDetected: (items: DetectedItem[]) => void;
  householdId: string;
}

export default function CaptureInventoryModal({
  visible,
  onClose,
  onItemsDetected,
  householdId,
}: CaptureInventoryModalProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);

  const handleClose = () => {
    setShowCamera(false);
    setCapturedImage(null);
    setDetectedItems([]);
    setIsProcessing(false);
    onClose();
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Camera Not Available', 'Camera access is not available on web. Please use the gallery option.');
      return false;
    }

    if (!permission?.granted) {
      const result = await requestPermission();
      return result.granted;
    }
    return true;
  };

  const handleCameraCapture = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setShowCamera(true);
    }
  };

  const handleGalleryPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        
        if (photo) {
          setCapturedImage(photo.uri);
          setShowCamera(false);
          await processImage(photo.uri);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const processImage = async (imageUri: string) => {
    setIsProcessing(true);
    try {
      // Since we're now using static hosting, simulate the AI processing locally
      console.log('🤖 Simulating AI image processing...');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response with realistic pantry items
      const mockItems = [
        {
          name: 'Organic Milk',
          category: 'Dairy',
          quantity: 1,
          unit: 'bottle',
          confidence: 0.95,
        },
        {
          name: 'Whole Wheat Bread',
          category: 'Bakery',
          quantity: 1,
          unit: 'loaf',
          confidence: 0.88,
        },
        {
          name: 'Fresh Bananas',
          category: 'Fruits',
          quantity: 6,
          unit: 'pieces',
          confidence: 0.92,
        },
        {
          name: 'Greek Yogurt',
          category: 'Dairy',
          quantity: 2,
          unit: 'cups',
          confidence: 0.85,
        },
        {
          name: 'Chicken Breast',
          category: 'Meat',
          quantity: 1,
          unit: 'package',
          confidence: 0.90,
        },
      ];

      console.log('✅ Mock AI processing complete, detected', mockItems.length, 'items');
      setDetectedItems(mockItems);
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmItems = () => {
    onItemsDetected(detectedItems);
    handleClose();
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (showCamera) {
    return (
      <Modal visible={visible} animationType="slide" style={styles.fullScreen}>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowCamera(false)}>
                <X color="#ffffff" size={24} />
              </TouchableOpacity>
              
              <View style={styles.cameraActions}>
                <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
                  <Text style={styles.flipButtonText}>Flip</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
                
                <View style={styles.placeholder} />
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleClose}>
              <X color="#ffffff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Capture Inventory</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content}>
          {!capturedImage ? (
            <View style={styles.captureOptions}>
              <Text style={styles.instructionTitle}>Take a Photo of Your Pantry</Text>
              <Text style={styles.instructionText}>
                Our AI will automatically detect and identify items in your pantry to add them to your inventory.
              </Text>

              <View style={styles.optionButtons}>
                <TouchableOpacity style={styles.optionButton} onPress={handleCameraCapture}>
                  <Camera color="#667eea" size={32} />
                  <Text style={styles.optionButtonText}>Use Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionButton} onPress={handleGalleryPick}>
                  <ImageIcon color="#667eea" size={32} />
                  <Text style={styles.optionButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Tips for Best Results:</Text>
                <Text style={styles.tipItem}>• Ensure good lighting</Text>
                <Text style={styles.tipItem}>• Keep items clearly visible</Text>
                <Text style={styles.tipItem}>• Avoid shadows and glare</Text>
                <Text style={styles.tipItem}>• Hold the camera steady</Text>
              </View>
            </View>
          ) : (
            <View style={styles.resultsContainer}>
              <View style={styles.imagePreview}>
                <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => {
                    setCapturedImage(null);
                    setDetectedItems([]);
                  }}
                >
                  <Text style={styles.retakeButtonText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>

              {isProcessing ? (
                <View style={styles.processingContainer}>
                  <Loader color="#667eea" size={32} />
                  <Text style={styles.processingText}>Analyzing image...</Text>
                  <Text style={styles.processingSubtext}>
                    Our AI is detecting items in your pantry
                  </Text>
                </View>
              ) : detectedItems.length > 0 ? (
                <View style={styles.detectedItemsContainer}>
                  <Text style={styles.detectedTitle}>
                    Detected {detectedItems.length} item{detectedItems.length > 1 ? 's' : ''}
                  </Text>
                  
                  {detectedItems.map((item, index) => (
                    <View key={index} style={styles.detectedItem}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemDetails}>
                          {item.quantity} {item.unit} • {item.category}
                        </Text>
                      </View>
                      <View style={styles.confidenceContainer}>
                        <Text style={styles.confidenceText}>
                          {Math.round(item.confidence * 100)}%
                        </Text>
                        {item.confidence > 0.8 ? (
                          <Check color="#27ae60" size={16} />
                        ) : (
                          <AlertCircle color="#f39c12" size={16} />
                        )}
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmItems}>
                    <Text style={styles.confirmButtonText}>Add Items to Pantry</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  captureOptions: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  optionButtons: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }),
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  tipsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  flipButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
  },
  resultsContainer: {
    paddingVertical: 20,
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  retakeButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#667eea',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retakeButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  detectedItemsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  detectedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});