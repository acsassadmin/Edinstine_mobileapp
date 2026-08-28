import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import NoticeBoardCard from "./NoticeBoardCard";
import NoticeBoardSkeleton from "../loadingScreens/NoticeBoardLoadingScreen";
import DashboardService from "../services/HomeScreenService";
import { useStorage } from "../context/StorageContext";
import { useUser } from "../context/UserContext";
import BackButton from "./BackButton";
import TopBar from "./ParentTobBar";

const DisplayNotice = () => {
  const { token, appUser } = useUser();
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const { noticeBoard, setNoticeBoard } = useStorage();
  const [loadingMore, setLoadingMore] = useState(false);
  const getNoticeBoard = async () => {
    try {
      setNoticeLoading(true);
      const response = await DashboardService.getNoticeBoard(
        token,
        appUser?.branch_id,
      );
      // console.log("RAW RESPONSE:", response.data);
      setNoticeBoard(response.data.results);
      setNextPage(response.links?.next || null);
    } catch (error) {
      // console.log("error", error);
      // console.error(error);
    } finally {
      setNoticeLoading(false);
    }
  };
  useEffect(() => {
    getNoticeBoard();
  }, []);
  const renderNoticeItem = ({ item, index }) => {
    const dateObj = new Date(item.created_at);
    const date = dateObj.toLocaleDateString("en-GB");
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <NoticeBoardCard
        title={item.title}
        message={item.description}
        date={date}
        time={time}
        poster={item.poster}
        index={index}
        data={item}
      />
    );
  };
  return (
    <View
      style={{
        padding: 12,
        backgroundColor: "white",
        flex: 1,
        rowGap: 15,
        // borderWidth: 2,
      }}
    >
      <TopBar />
      <View
        style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
      >
        <BackButton />
        <Text style={{ fontWeight: "800", fontSize: 18 }}>Notice</Text>
      </View>
      {noticeLoading ? (
        <NoticeBoardSkeleton />
      ) : noticeBoard?.length === 0 ? (
        <Text style={{}}>No notices available</Text>
      ) : (
        <FlatList
          data={noticeBoard}
          // style={{ borderWidth: 2, flex: 1 }}
          // horizontal
          keyExtractor={(item) => item?.id.toString()}
          key={(item) => item?.id.toString()}
          numColumns={2}
          renderItem={renderNoticeItem}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          // style={{ height: 160, marginTop: 13 }}
          columnWrapperStyle={{ columnGap: 15 }}
          contentContainerStyle={{
            // paddingHorizontal: 10,
            alignItems: "center",
            // columnGap: 10,
          }}
          onEndReached={() => {
            if (nextPage && !loadingMore) {
              getNoticeBoard(nextPage);
            }
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={loadingMore ? <NoticeBoardSkeleton /> : null}
        />
      )}
    </View>
  );
};

export default DisplayNotice;
