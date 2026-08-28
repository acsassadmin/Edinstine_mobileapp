import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import TopBar from "../components/ParentTobBar";
import BackButton from "../components/BackButton";
import { BASEURL } from "../appurls";
import { shareMessage } from "../utils/ShareMessage";
import { MessageCircleIcon, Share2Icon } from "lucide-react-native";
import { useUser } from "../context/UserContext";

const EventBoardScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { appUser } = useUser();

  const event = route?.params?.data;
  // console.log("log from events", event);

  const shareEvent = () => {
    const payload = {
      message: `
📅 *${event?.event_name || "Event"}*

📖 Description: ${event?.description || "N/A"}

📍 Location: ${event?.location || "N/A"}

👤 Chief Guest: ${event?.chiefGuest || "N/A"}

📆 Start: ${event?.startDate} ${event?.startTime}
📆 End: ${event?.endDate} ${event?.endTime}
      `.trim(),

      image: event?.image ? `${BASEURL}${event.image}` : null,
    };

    shareMessage(payload);
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>No Circluar Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar />

      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Circular Details</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Image */}
          <View style={{ height: 200 }}>
            {event?.image ? (
              <Image
                source={{ uri: `${event?.image}` }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.noImage}>
                <Text>No Image</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{event?.event_name}</Text>

          {/* Description */}
          <Text style={styles.description}>{event?.description}</Text>

          <View style={styles.divider} />

          {/* Info */}
          <Text style={styles.infoText}> Location: {event?.location}</Text>

          <Text style={styles.infoText}>Chief Guest: {event?.chiefGuest}</Text>

          <Text style={styles.infoText}>
            Start: {event?.startDate} {event?.startTime}
          </Text>

          <Text style={styles.infoText}>
            End: {event?.endDate} {event?.endTime}
          </Text>

          <Text style={styles.infoText}>
            Classes: {event?.class_details?.join(", ")}
          </Text>

          <Text style={styles.infoText}>
            Organizers: {event?.organizer_details?.join(", ")}
          </Text>
        </View>
      </ScrollView>

      {/* Floating Share Button */}
      <View style={styles.floating}>
        {appUser?.id !== event?.created_by && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ChatScreen", { staffId: event?.created_by })
            }
            style={{
              backgroundColor: "#86b952",
              //   padding: 20,
              borderRadius: 100,
              width: 60,
              aspectRatio: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MessageCircleIcon color={"white"} strokeWidth={1.6} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={shareEvent}
          style={{
            borderRadius: 100,
            width: 60,
            aspectRatio: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
          }}
        >
          <Share2Icon color="white" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventBoardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 10,
    color: "#111827",
  },

  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },

  card: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
    color: "#111827",
  },

  description: {
    fontSize: 15,
    color: "#4b5563",
    marginTop: 10,
    lineHeight: 22,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },

  infoText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  noImage: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
  },

  floating: {
    position: "absolute",
    bottom: 25,
    right: 20,
    flexDirection: "column",
    rowGap: 10,
  },

  shareBtn: {
    backgroundColor: "#000",
    padding: 18,
    borderRadius: 50,
  },
});
