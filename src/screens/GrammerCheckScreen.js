import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const GrammarCheckScreen = () => {
  const [text, setText] = useState("");
  const [correctedWords, setCorrectedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkGrammar = async () => {
    if (!text) {
      Alert.alert("Error", "Please enter some text.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("https://grammerappbackend.up.railway.app/api/grammar/check-modify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (response.ok) {
        highlightMistakes(text, data.correctedText);
      } else {
        Alert.alert("Error", data.error || "Failed to check grammar");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const highlightMistakes = (original, corrected) => {
    const originalWords = original.split(" ");
    const correctedWordsArray = corrected.split(" ");

    const highlighted = originalWords.map((word, index) => ({
      original: word,
      corrected: correctedWordsArray[index] || word,
      isMistake: word !== correctedWordsArray[index],
    }));

    setCorrectedWords(highlighted);
  };

  const correctWord = (index) => {
    const newWords = [...correctedWords];
    newWords[index].original = newWords[index].corrected;
    newWords[index].isMistake = false;
    setCorrectedWords(newWords);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.replace("Login");
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      <Text style={styles.title}>Grammar Checker</Text>
      <ScrollView style={styles.previewContainer}>
        {correctedWords.length > 0 ? (
          <Text style={styles.previewText}>
            {correctedWords.map((word, index) => (
              <Text
                key={index}
                style={word.isMistake ? styles.mistakeText : styles.normalText}
                onPress={() => word.isMistake && correctWord(index)}
              >
                {word.original + " "}
              </Text>
            ))}
          </Text>
        ) : (
          <Text style={styles.placeholderText}>Live preview will appear here...</Text>
        )}
      </ScrollView>
      <TextInput
        placeholder="Enter your text here..."
        value={text}
        onChangeText={setText}
        multiline
        style={styles.input}
      />
      <TouchableOpacity onPress={checkGrammar} disabled={loading} style={styles.button}>
        <Text style={styles.buttonText}>{loading ? "Checking..." : "Check Grammar"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    marginTop: 20,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2563EB",
    textAlign: "center",
    marginBottom: 16,
  },
  previewContainer: {
    padding: 12,
    backgroundColor: "#E0F2FE",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#38BDF8",
    height: 120,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 18,
  },
  mistakeText: {
    color: "#DC2626",
    textDecorationLine: "underline",
  },
  normalText: {
    color: "black",
  },
  placeholderText: {
    color: "#64748B",
  },
  input: {
    backgroundColor: "#E0F2FE",
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#38BDF8",
    height: 120,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default GrammarCheckScreen;
