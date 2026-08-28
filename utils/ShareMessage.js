import { Share } from "react-native";

export const shareMessage = async ({ message, image }) => {
  try {
    // console.log("message", message, image);

    await Share.share({
      message: message,
      url: image,
    });
  } catch (error) {
    // console.log(error);
  }
};
