import { useEffect, useRef } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Divider, Grid, Typography } from "antd";
import logo1 from "../../../assets/logo.png";
import { useAppSelector } from "../../../store/hooks";
import DelayedResponse from "./DelayedResponse";
const { useBreakpoint } = Grid;

const Chatting = () => {
  const chats = useAppSelector((state) => state.general.chats);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const screens = useBreakpoint();
  // Scroll to the bottom whenever chats update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  return (
    <div
      ref={chatContainerRef}
      style={{
        marginTop: "10px",
        width: "100%",
        height: "500px",
        overflow: "auto",
      }}
    >
      {chats.map((e, i) => (
        <div key={i}>
          {i !== 0 && <Divider />}
          <div style={{ display: "flex", gap: "20px" }}>
            <Avatar size={35} icon={<UserOutlined />} />
            <Typography.Text
              style={{
                marginTop: "5px",
                fontSize: "14px",
                fontWeight: "200",
                width: "80%",
              }}
            >
              {e.request}
            </Typography.Text>
          </div>
          <Divider />
          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            <Avatar size={35} icon={<UserOutlined />} src={logo1} />
            <div style={{ width: screens.lg ? "auto" : "80%" }}>
              <DelayedResponse />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chatting;
